import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const categories = await prisma.activityCategory.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(categories);
    } catch {
        return NextResponse.json({ error: 'Lỗi khi lấy danh sách danh mục' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json();

        console.log('POST /api/admin/categories/activity - Received:', { name });

        // Validate input
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            console.log('Validation failed: Invalid name');
            return NextResponse.json({ error: 'Tên danh mục không hợp lệ' }, { status: 400 });
        }

        // Check if category already exists
        // Note: MySQL is case-insensitive by default, no need for mode: 'insensitive'
        const existingCategory = await prisma.activityCategory.findFirst({
            where: {
                name: name.trim(),
                deletedAt: null,
            },
        });

        if (existingCategory) {
            console.log('Category already exists:', existingCategory);
            return NextResponse.json({ error: 'Danh mục đã tồn tại' }, { status: 400 });
        }

        console.log('Creating category with name:', name.trim());
        const category = await prisma.activityCategory.create({
            data: { name: name.trim() },
        });

        console.log('Category created successfully:', category);
        return NextResponse.json(category, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating category:', error);
        const errorWithCode = error as Record<string, unknown>;
        console.error('Error details:', {
            message: errorWithCode.message,
            code: errorWithCode.code,
            meta: errorWithCode.meta,
        });
        
        // Handle Prisma unique constraint error
        if (errorWithCode.code === 'P2002') {
            return NextResponse.json({ error: 'Danh mục đã tồn tại (unique constraint)' }, { status: 400 });
        }
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ 
            error: 'Lỗi khi tạo danh mục', 
            details: errorMessage 
        }, { status: 500 });
    }
}
