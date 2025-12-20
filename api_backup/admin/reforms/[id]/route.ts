import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

// Helper: Upload file to Cloudinary (auto-detect resource type)
async function uploadToCloudinary(file: File, fileType: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine resource type based on file type
    const resourceType = fileType === 'image' ? 'image' : 'raw';

    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    resource_type: resourceType,
                    folder: 'reforms',
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result!.secure_url);
                    }
                },
            )
            .end(buffer);
    });
}

// Helper: Delete file from Cloudinary
async function deleteFromCloudinary(fileUrl: string): Promise<void> {
    try {
        // Extract public_id from URL
        const urlParts = fileUrl.split('/');
        const fileWithExtension = urlParts[urlParts.length - 1];
        const publicId = `reforms/${fileWithExtension.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
}

// GET - Lấy reform theo ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const reform = await prisma.reform.findUnique({
            where: { id },
            include: {
                files: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!reform) {
            return NextResponse.json({ error: 'Không tìm thấy reform' }, { status: 404 });
        }

        return NextResponse.json(reform);
    } catch (error) {
        console.error('Error fetching reform:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi lấy thông tin reform' }, { status: 500 });
    }
}

// PUT - Cập nhật reform
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const detailsJson = formData.get('details') as string;
        const existingFilesJson = formData.get('existingFiles') as string;

        // Parse details array
        let details: string[] = [];
        try {
            details = JSON.parse(detailsJson || '[]');
        } catch {
            return NextResponse.json({ error: 'Invalid details format' }, { status: 400 });
        }

        // Parse existing files that should be kept
        let existingFilesToKeep: { id: string; fileUrl: string; fileType: string }[] = [];
        try {
            existingFilesToKeep = JSON.parse(existingFilesJson || '[]');
        } catch (e) {
            console.error('Error parsing existingFiles:', e);
        }

        // Get all files from formData (multiple files with same key)
        const files: File[] = [];
        const fileTypes: string[] = [];

        // Iterate through formData to get all files
        for (const [key, value] of formData.entries()) {
            if (key === 'file' && value instanceof File) {
                files.push(value);
                const ft = (formData.get(`fileType_${files.length - 1}`) as string) || 'pdf';
                fileTypes.push(ft);
            }
        }

        // Validation
        if (!title || !description) {
            return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
        }

        // Check if reform exists
        const existingReform = await prisma.reform.findUnique({
            where: { id: params.id },
            include: { files: true },
        });

        if (!existingReform) {
            return NextResponse.json({ error: 'Không tìm thấy reform' }, { status: 404 });
        }

        // Update reform basic info
        await prisma.reform.update({
            where: { id: params.id },
            data: {
                title: title.trim(),
                description: description.trim(),
                details: details,
            },
        });

        // Handle file updates
        const currentFiles = existingReform.files;
        const filesToDelete = currentFiles.filter(
            (file) => !existingFilesToKeep.some((keepFile) => keepFile.id === file.id),
        );

        // Delete removed files from Cloudinary
        for (const file of filesToDelete) {
            try {
                await deleteFromCloudinary(file.fileUrl);
            } catch (error) {
                console.error('Error deleting file from Cloudinary:', error);
            }
        }

        // Delete removed file records from database
        if (filesToDelete.length > 0) {
            await prisma.reformFile.deleteMany({
                where: {
                    id: { in: filesToDelete.map((f) => f.id) },
                },
            });
        }

        // Upload new files and create new records
        if (files.length > 0) {
            const maxOrder =
                existingFilesToKeep.length > 0 ? Math.max(...existingFilesToKeep.map((f) => f.order || 0)) : -1;

            for (let i = 0; i < files.length; i++) {
                const fileUrl = await uploadToCloudinary(files[i], fileTypes[i]);

                await prisma.reformFile.create({
                    data: {
                        reformId: params.id,
                        fileUrl,
                        fileType: fileTypes[i],
                        order: maxOrder + i + 1,
                    },
                });
            }
        }

        // Return updated reform with files
        const updatedReform = await prisma.reform.findUnique({
            where: { id: params.id },
            include: {
                files: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        return NextResponse.json({ data: updatedReform });
    } catch (error) {
        console.error('Error updating reform:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi cập nhật reform' }, { status: 500 });
    }
}

// DELETE - Xóa reform
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get reform with files
        const reform = await prisma.reform.findUnique({
            where: { id: params.id },
            include: { files: true },
        });

        if (!reform) {
            return NextResponse.json({ error: 'Không tìm thấy reform' }, { status: 404 });
        }

        // Delete files from Cloudinary
        for (const file of reform.files) {
            try {
                await deleteFromCloudinary(file.fileUrl);
            } catch (error) {
                console.error('Error deleting file from Cloudinary:', error);
            }
        }

        // Delete reform (files will be deleted automatically due to cascade)
        await prisma.reform.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Xóa reform thành công' });
    } catch (error) {
        console.error('Error deleting reform:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi xóa reform' }, { status: 500 });
    }
}
