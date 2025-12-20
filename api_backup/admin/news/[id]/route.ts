import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';
import cloudinary from '@/lib/cloudinary';

// GET /api/admin/news/[id] - Get single news
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

// PUT /api/admin/news/[id] - Update news
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Check if news exists
        const existingNews = await prisma.news.findUnique({
            where: { id },
            include: {
                images: true,
            },
        });

        if (!existingNews) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        const formData = await request.formData();

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const content = formData.get('content') as string;
        const category = formData.get('category') as string;
        const date = formData.get('date') as string;

        if (!title || !description || !content || !category || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Handle image updates
        const imageFiles = formData.getAll('images') as File[];
        const uploadedImages: { imageUrl: string; order: number }[] = [];

        // Delete existing images from Cloudinary if new images are provided
        if (imageFiles.length > 0 && imageFiles[0].size > 0) {
            for (const image of existingNews.images) {
                try {
                    // Extract public_id from Cloudinary URL
                    const publicId = image.imageUrl.split('/').pop()?.split('.')[0];
                    if (publicId) {
                        await cloudinary.uploader.destroy(`news/${publicId}`);
                    }
                } catch (error) {
                    console.error('Error deleting image from Cloudinary:', error);
                }
            }

            // Upload new images
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

            // Delete existing images from database and create new ones
            await prisma.newsImage.deleteMany({
                where: { newsId: id },
            });
        }

        // Update news
        const updatedNews = await prisma.news.update({
            where: { id },
            data: {
                title,
                description,
                content,
                category,
                date: new Date(date),
                thumbnail: uploadedImages.length > 0 ? uploadedImages[0].imageUrl : existingNews.thumbnail,
                ...(uploadedImages.length > 0 && {
                    images: {
                        create: uploadedImages,
                    },
                }),
            },
            include: {
                images: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        return NextResponse.json(updatedNews);
    } catch (error) {
        console.error('Error updating news:', error);
        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
    }
}

// DELETE /api/admin/news/[id] - Delete news
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Get news with images
        const news = await prisma.news.findUnique({
            where: { id },
            include: {
                images: true,
            },
        });

        if (!news) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        // Delete images from Cloudinary
        for (const image of news.images) {
            try {
                // Extract public_id from Cloudinary URL
                const publicId = image.imageUrl.split('/').pop()?.split('.')[0];
                if (publicId) {
                    await cloudinary.uploader.destroy(`news/${publicId}`);
                }
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
            }
        }

        // Delete news (images will be deleted automatically due to cascade)
        await prisma.news.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'News deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
    }
}
