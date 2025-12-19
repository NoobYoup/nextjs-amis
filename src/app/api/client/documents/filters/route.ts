import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Get unique years from documents
        const documents = await prisma.document.findMany({
            select: {
                date: true,
                type: true,
                field: true,
            },
        });

        // Extract unique years
        const years = [...new Set(documents.map((doc: typeof documents[0]) => new Date(doc.date).getFullYear()))].sort((a, b) => b - a);
        
        // Extract unique types
        const types = [...new Set(documents.map((doc: typeof documents[0]) => doc.type))].sort();
        
        // Extract unique fields
        const fields = [...new Set(documents.map((doc: typeof documents[0]) => doc.field))].sort();

        return NextResponse.json({
            years,
            types,
            fields,
        });
    } catch (error: unknown) {
        console.error('GET /api/documents/filters error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            {
                error: 'Lỗi khi lấy danh sách filters',
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}
