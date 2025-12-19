import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Lấy danh sách reforms cho client (public)
export async function GET() {
    try {
        const reforms = await prisma.reform.findMany({
            include: {
                files: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ data: reforms });
    } catch (error) {
        console.error('Error fetching reforms:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi lấy danh sách thông tin công khai' }, { status: 500 });
    }
}
