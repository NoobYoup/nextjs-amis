import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (search) {
        // MySQL is case-insensitive by default
        where.OR = [
            { description: { contains: search } },
            { name: { contains: search } },
            { grade: { contains: search } },
        ];
    }

    const [tuitions, total] = await Promise.all([
        prisma.tuition.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.tuition.count({ where }),
    ]);

    return NextResponse.json({ data: tuitions, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        console.log('POST /api/admin/tuition - Received:', body);

        // Validate based on type
        if (!body.type) {
            return NextResponse.json({ error: 'Thiếu trường type' }, { status: 400 });
        }

        if (body.type === 'grade') {
            if (!body.grade || !body.tuition) {
                return NextResponse.json({ error: 'Thiếu trường grade hoặc tuition' }, { status: 400 });
            }
            // Set name for grade type
            body.name = body.grade;
        } else if (body.type === 'fee') {
            if (!body.name || !body.typeFee) {
                return NextResponse.json({ error: 'Thiếu trường name hoặc typeFee' }, { status: 400 });
            }
        } else if (body.type === 'discount' || body.type === 'schedule') {
            if (!body.name) {
                return NextResponse.json({ error: 'Thiếu trường name' }, { status: 400 });
            }
        }

        const tuition = await prisma.tuition.create({
            data: body,
        });

        console.log('Tuition created:', tuition);
        return NextResponse.json(tuition, { status: 201 });
    } catch (error: unknown) {
        console.error('POST tuition error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ 
            error: 'Lỗi khi tạo học phí',
            details: errorMessage 
        }, { status: 500 });
    }
}
