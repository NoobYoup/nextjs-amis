import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

// Helper: Upload file to Cloudinary (auto-detect resource type)
async function uploadToCloudinary(file: File, fileType: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Lấy tên file không có extension
    const fileName = file.name.replace(/\.[^/.]+$/, '');

    // Determine resource type based on file type
    const resourceType = fileType === 'image' ? 'image' : 'raw';

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: resourceType,
                public_id: `documents/${fileName}`, // Đặt tên file
                use_filename: true,
                unique_filename: true,
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    // Đảm bảo URL có đúng extension
                    const url = result?.secure_url || '';
                    console.log('Uploaded file URL:', url);
                    resolve(url);
                }
            },
        );
        uploadStream.end(buffer);
    });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const field = searchParams.get('field') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;

    const where: Record<string, unknown> = {};

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { number: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (type) where.type = type;
    if (field) where.field = field;

    const [documents, total] = await Promise.all([
        prisma.document.findMany({
            where,
            include: { files: { orderBy: { order: 'asc' } } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.document.count({ where }),
    ]);

    return NextResponse.json({ data: documents, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const number = formData.get('number') as string;
    const date = new Date(formData.get('date') as string);
    const field = formData.get('field') as string;
    const summary = formData.get('summary') as string;
    const isNew = formData.get('isNew') === 'true';

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

    if (files.length === 0) {
        return NextResponse.json({ error: 'Vui lòng chọn ít nhất một file' }, { status: 400 });
    }

    // Validation
    if (!title || !type || !date || !field) {
        return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }

    try {
        // Create document
        const document = await prisma.document.create({
            data: { title, type, number, date, field, summary, isNew },
        });

        // Upload files and create DocumentFile records
        for (let i = 0; i < files.length; i++) {
            const fileUrl = await uploadToCloudinary(files[i], fileTypes[i]);

            await prisma.documentFile.create({
                data: {
                    documentId: document.id,
                    fileUrl,
                    fileType: fileTypes[i],
                    order: i,
                },
            });
        }

        // Return document with files
        const documentWithFiles = await prisma.document.findUnique({
            where: { id: document.id },
            include: { files: { orderBy: { order: 'asc' } } },
        });

        return NextResponse.json(documentWithFiles, { status: 201 });
    } catch (error) {
        console.error('Error creating document:', error);
        return NextResponse.json({ error: 'Lỗi tạo tài liệu' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Vui lòng chọn tài liệu' }, { status: 400 });

    const document = await prisma.document.findUnique({
        where: { id },
        include: { files: true },
    });
    if (!document) return NextResponse.json({ error: 'Tài liệu không tồn tại' }, { status: 404 });

    // Delete all files from Cloudinary
    for (const file of document.files) {
        try {
            // Extract public_id from URL
            // URL format: https://res.cloudinary.com/.../raw/upload/v123/documents/filename.pdf
            const urlParts = file.fileUrl.split('/upload/');
            if (urlParts.length > 1) {
                const pathWithVersion = urlParts[1]; // v123/documents/filename.pdf
                const publicIdWithExt = pathWithVersion.split('/').slice(1).join('/'); // documents/filename.pdf
                const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // documents/filename

                const resourceType = file.fileType === 'image' ? 'image' : 'raw';
                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
                console.log('Deleted file from Cloudinary:', publicId);
            }
        } catch (error) {
            console.error('Error deleting file from Cloudinary:', error);
            // Continue with database deletion even if Cloudinary deletion fails
        }
    }

    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ message: 'Xóa tài liệu thành công' });
}
