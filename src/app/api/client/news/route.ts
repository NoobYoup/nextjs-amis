import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/client/news - Get published news for client
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');
        const category = searchParams.get('category') || '';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: { category?: string } = {};

        if (category && category !== 'all') {
            where.category = category;
        }

        // Get total count
        const total = await prisma.news.count({ where });

        // Get news with images
        const news = await prisma.news.findMany({
            where,
            include: {
                images: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { date: 'desc' },
            skip,
            take: limit,
        });

        return NextResponse.json({
            data: news,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
