import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET - Lấy danh sách categories
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'document_type' hoặc 'document_field'

        const where: { type?: string } = {};
        if (type) {
            where.type = type;
        }

        const categories = await prisma.documentCategory.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ data: categories });
    } catch (error) {
        console.error('Error fetching document categories:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi lấy danh sách danh mục' }, { status: 500 });
    }
}

// POST - Tạo category mới
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, type } = body;

        // Validation
        if (!name || !type) {
            return NextResponse.json({ error: 'Tên và loại danh mục là bắt buộc' }, { status: 400 });
        }

        if (!['document_type', 'document_field'].includes(type)) {
            return NextResponse.json({ error: 'Loại danh mục không hợp lệ' }, { status: 400 });
        }

        // Kiểm tra trùng tên trong cùng loại
        const existingCategory = await prisma.documentCategory.findFirst({
            where: { name, type },
        });

        if (existingCategory) {
            return NextResponse.json({ error: 'Tên danh mục đã tồn tại trong loại này' }, { status: 400 });
        }

        const category = await prisma.documentCategory.create({
            data: {
                name: name.trim(),
                type,
            },
        });

        return NextResponse.json({ data: category }, { status: 201 });
    } catch (error) {
        console.error('Error creating document category:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi tạo danh mục' }, { status: 500 });
    }
}
