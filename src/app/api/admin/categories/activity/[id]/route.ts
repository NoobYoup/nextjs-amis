import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get single category
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const category = await prisma.activityCategory.findUnique({
            where: { id },
        });
        
        if (!category || category.deletedAt) {
            return NextResponse.json(
                { error: 'Không tìm thấy danh mục' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error getting category:', error);
        return NextResponse.json(
            { error: 'Lỗi khi lấy thông tin danh mục' },
            { status: 500 }
        );
    }
}

// Update category
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { name } = await req.json();

        // Validate input
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Tên danh mục không hợp lệ' },
                { status: 400 }
            );
        }

        // Check if category exists
        const existingCategory = await prisma.activityCategory.findUnique({
            where: { id },
        });
        
        if (!existingCategory || existingCategory.deletedAt) {
            return NextResponse.json(
                { error: 'Không tìm thấy danh mục' },
                { status: 404 }
            );
        }

        // Check if new name is already taken
        // Note: MySQL is case-insensitive by default
        const duplicateCategory = await prisma.activityCategory.findFirst({
            where: {
                id: { not: id },
                name: name.trim(),
                deletedAt: null,
            },
        });

        if (duplicateCategory) {
            return NextResponse.json(
                { error: 'Tên danh mục đã tồn tại' },
                { status: 400 }
            );
        }

        const updatedCategory = await prisma.activityCategory.update({
            where: { id },
            data: { name: name.trim() },
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Lỗi khi cập nhật danh mục' },
            { status: 500 }
        );
    }
}

// Delete category (soft delete)
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        
        // Check if category is being used by any activity
        const activityCount = await prisma.activity.count({ 
            where: { categoryId: id },
        });

        if (activityCount > 0) {
            return NextResponse.json(
                { 
                    error: 'Không thể xóa danh mục đang được sử dụng bởi các hoạt động',
                    activityCount
                },
                { status: 400 }
            );
        }

        // Check if category exists
        const category = await prisma.activityCategory.findUnique({
            where: { id },
        });
        
        if (!category || category.deletedAt) {
            return NextResponse.json(
                { error: 'Không tìm thấy danh mục' },
                { status: 404 }
            );
        }

        // Perform soft delete
        await prisma.activityCategory.update({
            where: { id },
            data: { 
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Đã xóa danh mục thành công' 
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Lỗi khi xóa danh mục' },
            { status: 500 }
        );
    }
}
