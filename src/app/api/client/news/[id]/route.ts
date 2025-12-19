import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/client/news/[id] - Get single news for client
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const news = await prisma.news.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!news) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        return NextResponse.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
