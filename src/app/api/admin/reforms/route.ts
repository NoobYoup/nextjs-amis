import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

// Helper: Upload file to Cloudinary (auto-detect resource type)
async function uploadToCloudinary(file: File, fileType: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine resource type based on file type
    const resourceType = fileType === 'image' ? 'image' : 'raw';

    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    resource_type: resourceType,
                    folder: 'reforms',
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result!.secure_url);
                    }
                },
            )
            .end(buffer);
    });
}

// GET - Lấy danh sách reforms với pagination
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 10;
        const skip = (page - 1) * limit;

        const [reforms, total] = await Promise.all([
            prisma.reform.findMany({
                skip,
                take: limit,
                include: {
                    files: {
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.reform.count(),
        ]);

        return NextResponse.json({ data: reforms, total });
    } catch (error) {
        console.error('Error fetching reforms:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi lấy danh sách reforms' }, { status: 500 });
    }
}

// POST - Tạo reform mới với files
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const detailsJson = formData.get('details') as string;

        // Parse details array
        let details: string[] = [];
        try {
            details = JSON.parse(detailsJson || '[]');
        } catch {
            return NextResponse.json({ error: 'Invalid details format' }, { status: 400 });
        }

        // Get all files from formData (multiple files with same key)
        const files: File[] = [];
        const fileTypes: string[] = [];

        // Iterate through formData to get all files
        for (const [key, value] of formData.entries()) {
            if (key === 'file' && value instanceof File) {
                files.push(value);
                const ft = (formData.get(`fileType_${files.length - 1}`) as string) || 'pdf';
                fileTypes.push(ft);
            }
        }

        // Validation
        if (!title || !description) {
            return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
        }

        if (files.length === 0) {
            return NextResponse.json({ error: 'Vui lòng chọn ít nhất một file' }, { status: 400 });
        }

        // Create reform first
        const reform = await prisma.reform.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                details: details,
            },
        });

        // Upload files and create ReformFile records
        for (let i = 0; i < files.length; i++) {
            const fileUrl = await uploadToCloudinary(files[i], fileTypes[i]);

            await prisma.reformFile.create({
                data: {
                    reformId: reform.id,
                    fileUrl,
                    fileType: fileTypes[i],
                    order: i,
                },
            });
        }

        // Return reform with files
        const reformWithFiles = await prisma.reform.findUnique({
            where: { id: reform.id },
            include: {
                files: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        return NextResponse.json({ data: reformWithFiles }, { status: 201 });
    } catch (error) {
        console.error('Error creating reform:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi tạo reform' }, { status: 500 });
    }
}
