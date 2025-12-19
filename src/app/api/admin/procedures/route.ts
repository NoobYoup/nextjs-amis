import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

// GET - Lấy danh sách procedures
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const where: {
            category?: string;
            OR?: Array<{ title?: { contains: string } } | { description?: { contains: string } }>;
        } = {};

        if (category && category !== 'all') {
            where.category = category;
        }

        if (search) {
            where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
        }

        const procedures = await prisma.procedure.findMany({
            where,
            include: {
                content: {
                    orderBy: { createdAt: 'asc' },
                },
                files: {
                    orderBy: { createdAt: 'asc' },
                },
                _count: {
                    select: {
                        content: true,
                        files: true,
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(procedures);
    } catch (error) {
        console.error('Error fetching procedures:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi lấy danh sách quy chế' }, { status: 500 });
    }
}

// POST - Tạo procedure mới
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const title = formData.get('title') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const contentJson = formData.get('content') as string;

        // Parse content array
        let content: Array<{ title: string; items: string[] }> = [];
        try {
            content = JSON.parse(contentJson || '[]');
        } catch {
            return NextResponse.json({ error: 'Invalid content format' }, { status: 400 });
        }

        // Get all files from formData
        const files: File[] = [];
        const fileTypes: string[] = [];

        for (const [key, value] of formData.entries()) {
            if (key === 'file' && value instanceof File) {
                files.push(value);
                const ft = (formData.get(`fileType_${files.length - 1}`) as string) || 'pdf';
                fileTypes.push(ft);
            }
        }

        // Validation
        if (!title || !category || !description) {
            return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
        }

        if (content.length === 0) {
            return NextResponse.json({ error: 'Vui lòng thêm ít nhất một mục nội dung' }, { status: 400 });
        }

        // Create procedure
        const procedure = await prisma.procedure.create({
            data: {
                title: title.trim(),
                category: category.trim(),
                description: description.trim(),
            },
        });

        // Create content sections
        for (let i = 0; i < content.length; i++) {
            const section = content[i];
            if (section.title && section.items && section.items.length > 0) {
                await prisma.procedureContent.create({
                    data: {
                        procedureId: procedure.id,
                        title: section.title.trim(),
                        items: section.items.filter((item) => item.trim() !== ''),
                    },
                });
            }
        }

        // Upload and create files
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const fileUrl = await uploadToCloudinary(files[i], fileTypes[i]);

                await prisma.procedureFile.create({
                    data: {
                        procedureId: procedure.id,
                        fileUrl,
                        fileType: fileTypes[i],
                        fileName: files[i].name,
                    },
                });
            }
        }

        // Return created procedure with relations
        const createdProcedure = await prisma.procedure.findUnique({
            where: { id: procedure.id },
            include: {
                content: {
                    orderBy: { createdAt: 'asc' },
                },
                files: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        return NextResponse.json(createdProcedure);
    } catch (error) {
        console.error('Error creating procedure:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi tạo quy chế' }, { status: 500 });
    }
}
