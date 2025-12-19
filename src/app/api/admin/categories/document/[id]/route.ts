import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET - Lấy category theo ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const category = await prisma.documentCategory.findUnique({
            where: { id },
        });

        if (!category) {
            return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 });
        }

        return NextResponse.json({ data: category });
    } catch (error) {
        console.error('Error fetching document category:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi lấy thông tin danh mục' }, { status: 500 });
    }
}

// PUT - Cập nhật category
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // Kiểm tra category tồn tại
        const existingCategory = await prisma.documentCategory.findUnique({
            where: { id: params.id },
        });

        if (!existingCategory) {
            return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 });
        }

        // Kiểm tra trùng tên trong cùng loại (trừ chính nó)
        const duplicateCategory = await prisma.documentCategory.findFirst({
            where: {
                name,
                type,
                id: { not: id },
            },
        });

        if (duplicateCategory) {
            return NextResponse.json({ error: 'Tên danh mục đã tồn tại trong loại này' }, { status: 400 });
        }

        const updatedCategory = await prisma.documentCategory.update({
            where: { id },
            data: {
                name: name.trim(),
                type,
            },
        });

        return NextResponse.json({ data: updatedCategory });
    } catch (error) {
        console.error('Error updating document category:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi cập nhật danh mục' }, { status: 500 });
    }
}

// DELETE - Xóa category
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Kiểm tra category tồn tại
        const existingCategory = await prisma.documentCategory.findUnique({
            where: { id: params.id },
        });

        if (!existingCategory) {
            return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 });
        }

        // Kiểm tra xem có document nào đang sử dụng category này không
        const documentsUsingCategory = await prisma.document.findFirst({
            where: {
                OR: [{ type: existingCategory.name }, { field: existingCategory.name }],
            },
        });

        if (documentsUsingCategory) {
            return NextResponse.json(
                { error: 'Không thể xóa danh mục đang được sử dụng bởi tài liệu' },
                { status: 400 },
            );
        }

        await prisma.documentCategory.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        console.error('Error deleting document category:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi xóa danh mục' }, { status: 500 });
    }
}
