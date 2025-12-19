import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

// GET /api/admin/news - List all news with pagination and search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: {
            OR?: Array<{ title?: { contains: string } } | { description?: { contains: string } }>;
            category?: string;
        } = {};

        if (search) {
            where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
        }

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

// POST /api/admin/news - Create new news
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const content = formData.get('content') as string;
        const category = formData.get('category') as string;
        const date = formData.get('date') as string;

        if (!title || !description || !content || !category || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Upload images to Cloudinary
        const imageFiles = formData.getAll('images') as File[];
        const uploadedImages: { imageUrl: string; order: number }[] = [];

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            if (file.size > 0) {
                const imageUrl = await uploadToCloudinary(file, 'image');
                uploadedImages.push({
                    imageUrl,
                    order: i,
                });
            }
        }

        // Create news with images
        const news = await prisma.news.create({
            data: {
                title,
                description,
                content,
                category,
                date: new Date(date),
                thumbnail: uploadedImages.length > 0 ? uploadedImages[0].imageUrl : null,
                images: {
                    create: uploadedImages,
                },
            },
            include: {
                images: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        return NextResponse.json(news, { status: 201 });
    } catch (error) {
        console.error('Error creating news:', error);
        return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
    }
}
