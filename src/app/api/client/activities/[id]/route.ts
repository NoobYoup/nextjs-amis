import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        const activity = await prisma.activity.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!activity) {
            return NextResponse.json(
                { error: 'Không tìm thấy hoạt động' },
                { status: 404 }
            );
        }

        return NextResponse.json(activity);
    } catch (error: unknown) {
        console.error('GET /api/activities/[id] error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            {
                error: 'Lỗi khi lấy thông tin hoạt động',
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}
