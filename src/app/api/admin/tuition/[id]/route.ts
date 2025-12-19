import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ===== GET: Lấy thông tin học phí theo id =====
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        const tuition = await prisma.tuition.findUnique({ where: { id } });
        if (!tuition) {
            return NextResponse.json({ error: 'Tuition not found' }, { status: 404 });
        }

        return NextResponse.json(tuition);
    } catch (error) {
        console.error('Error fetching tuition:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ===== PUT: Cập nhật thông tin học phí =====
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        console.log('PUT /api/admin/tuition/[id] - ID:', id, 'Body:', body);

        const tuition = await prisma.tuition.findUnique({ where: { id } });
        if (!tuition) {
            return NextResponse.json({ error: 'Không tìm thấy học phí' }, { status: 404 });
        }

        // Set name for grade type
        if (body.type === 'grade' && body.grade) {
            body.name = body.grade;
        }

        // Update tuition
        const updatedTuition = await prisma.tuition.update({
            where: { id },
            data: body,
        });

        console.log('Tuition updated:', updatedTuition);
        return NextResponse.json(updatedTuition);
    } catch (error: unknown) {
        console.error('PUT tuition error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { 
                error: 'Lỗi khi cập nhật học phí',
                details: errorMessage 
            },
            { status: 500 },
        );
    }
}

// ===== DELETE: Xóa thông tin học phí =====
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        console.log('DELETE /api/admin/tuition/[id] - ID:', id);

        const tuition = await prisma.tuition.findUnique({ where: { id } });
        if (!tuition) {
            return NextResponse.json({ error: 'Không tìm thấy học phí' }, { status: 404 });
        }

        await prisma.tuition.delete({ where: { id } });

        console.log('Tuition deleted:', id);
        return NextResponse.json({ message: 'Xóa học phí thành công' });
    } catch (error: unknown) {
        console.error('Error deleting tuition:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ 
            error: 'Lỗi khi xóa học phí',
            details: errorMessage 
        }, { status: 500 });
    }
}
