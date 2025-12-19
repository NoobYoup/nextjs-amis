import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('categoryId') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');

        const where: Record<string, unknown> = {};

        if (search) {
            // MySQL is case-insensitive by default
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { author: { contains: search } },
            ];
        }

        if (categoryId && categoryId !== 'all') {
            where.categoryId = categoryId;
        }

        const [activities, total] = await Promise.all([
            prisma.activity.findMany({
                where,
                orderBy: { date: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            prisma.activity.count({ where }),
        ]);

        return NextResponse.json({
            data: activities,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error: unknown) {
        console.error('GET /api/activities error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            {
                error: 'Lỗi khi lấy danh sách hoạt động',
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}
