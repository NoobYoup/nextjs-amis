import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

// Helper: Upload files to Cloudinary
async function uploadToCloudinary(file: File, resourceType: 'image' | 'video' = 'image'): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: resourceType }, (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url || '');
        });
        uploadStream.end(buffer);
    });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;

    const where: Record<string, unknown> = {};

    if (search) {
        // MySQL is case-insensitive by default
        where.OR = [
            { title: { contains: search } },
            { author: { contains: search } },
            { description: { contains: search } },
        ];
    }

    if (category) {
        where.categoryId = category;
    }

    const [activities, total] = await Promise.all([
        prisma.activity.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: { category: true },
        }),
        prisma.activity.count({ where }),
    ]);

    return NextResponse.json({ data: activities, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();

    // Parse fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('category') as string;
    const date = new Date(formData.get('date') as string);
    const author = formData.get('author') as string;
    const videosStr = (formData.get('videos') as string) || '';
    const videos = videosStr.split('\n').filter(Boolean);

    // Upload images
    const imagesFiles = formData.getAll('images') as File[];
    const imageUrls: string[] = [];
    for (const file of imagesFiles) {
        if (file) {
            const url = await uploadToCloudinary(file);
            imageUrls.push(url);
        }
    }
    const thumbnail = imageUrls[0] || '';

    // Validation
    if (!title || !description || !categoryId || !date || !author) {
        return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
    }

    const activity = await prisma.activity.create({
        data: {
            title,
            description,
            categoryId,
            date,
            author,
            thumbnail,
            images: imageUrls,
            videos,
        },
        include: { category: true },
    });

    return NextResponse.json(activity, { status: 201 });
}
