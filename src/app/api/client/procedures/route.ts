import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách procedures cho client (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const where: { category?: string } = {};

        if (category && category !== 'all') {
            where.category = category;
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
            },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(procedures);
    } catch (error) {
        console.error('Error fetching procedures:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi lấy danh sách quy chế' }, { status: 500 });
    }
}
