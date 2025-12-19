import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Helper function to delete file from Cloudinary
async function deleteFromCloudinary(fileUrl: string) {
    try {
        const { v2: cloudinary } = await import('cloudinary');

        // Extract public_id from Cloudinary URL
        const urlParts = fileUrl.split('/');
        const fileWithExtension = urlParts[urlParts.length - 1];
        const publicId = fileWithExtension.split('.')[0];

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
}

// GET - Lấy procedure theo ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const procedure = await prisma.procedure.findUnique({
            where: { id },
            include: {
                content: {
                    orderBy: { createdAt: 'asc' },
                },
                files: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!procedure) {
            return NextResponse.json({ error: 'Không tìm thấy quy chế' }, { status: 404 });
        }

        return NextResponse.json(procedure);
    } catch (error) {
        console.error('Error fetching procedure:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi lấy thông tin quy chế' }, { status: 500 });
    }
}

// PUT - Cập nhật procedure
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const contentJson = formData.get('content') as string;
        const existingFilesJson = formData.get('existingFiles') as string;

        // Parse content array
        let content: Array<{ title: string; items: string[] }> = [];
        try {
            content = JSON.parse(contentJson || '[]');
        } catch {
            return NextResponse.json({ error: 'Invalid content format' }, { status: 400 });
        }

        // Parse existing files that should be kept
        let existingFilesToKeep: { id: string; fileUrl: string; fileType: string }[] = [];
        try {
            existingFilesToKeep = JSON.parse(existingFilesJson || '[]');
        } catch (e) {
            console.error('Error parsing existingFiles:', e);
        }

        // Get all files from formData
        const files: File[] = [];
        const fileTypes: string[] = [];

        for (const [key, value] of formData.entries()) {
            if (key === 'file' && value instanceof File) {
                files.push(value);
                const ft = (formData.get(`fileType_${files.length - 1}`) as string) || 'pdf';
                fileTypes.push(ft);
            }
        }

        // Validation
        if (!title || !category || !description) {
            return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
        }

        if (content.length === 0) {
            return NextResponse.json({ error: 'Vui lòng thêm ít nhất một mục nội dung' }, { status: 400 });
        }

        // Check if procedure exists
        const existingProcedure = await prisma.procedure.findUnique({
            where: { id },
            include: {
                content: true,
                files: true,
            },
        });

        if (!existingProcedure) {
            return NextResponse.json({ error: 'Không tìm thấy quy chế' }, { status: 404 });
        }

        // Update procedure basic info
        await prisma.procedure.update({
            where: { id },
            data: {
                title: title.trim(),
                category: category.trim(),
                description: description.trim(),
            },
        });

        // Delete old content and create new ones
        await prisma.procedureContent.deleteMany({
            where: { procedureId: id },
        });

        for (let i = 0; i < content.length; i++) {
            const section = content[i];
            if (section.title && section.items && section.items.length > 0) {
                await prisma.procedureContent.create({
                    data: {
                        procedureId: id,
                        title: section.title.trim(),
                        items: section.items.filter((item) => item.trim() !== ''),
                    },
                });
            }
        }

        // Handle file updates
        const currentFiles = existingProcedure.files;
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
            await prisma.procedureFile.deleteMany({
                where: {
                    id: { in: filesToDelete.map((f) => f.id) },
                },
            });
        }

        // Upload new files and create new records
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const fileUrl = await uploadToCloudinary(files[i], fileTypes[i]);

                await prisma.procedureFile.create({
                    data: {
                        procedureId: id,
                        fileUrl,
                        fileType: fileTypes[i],
                        fileName: files[i].name,
                    },
                });
            }
        }

        // Return updated procedure with files
        const updatedProcedure = await prisma.procedure.findUnique({
            where: { id },
            include: {
                content: {
                    orderBy: { createdAt: 'asc' },
                },
                files: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        return NextResponse.json(updatedProcedure);
    } catch (error) {
        console.error('Error updating procedure:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi cập nhật quy chế' }, { status: 500 });
    }
}

// DELETE - Xóa procedure
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check if procedure exists
        const procedure = await prisma.procedure.findUnique({
            where: { id },
            include: { files: true },
        });

        if (!procedure) {
            return NextResponse.json({ error: 'Không tìm thấy quy chế' }, { status: 404 });
        }

        // Delete files from Cloudinary
        for (const file of procedure.files) {
            try {
                await deleteFromCloudinary(file.fileUrl);
            } catch (error) {
                console.error('Error deleting file from Cloudinary:', error);
            }
        }

        // Hard delete the procedure (cascade will delete content and files)
        await prisma.procedure.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Xóa quy chế thành công' });
    } catch (error) {
        console.error('Error deleting procedure:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi xóa quy chế' }, { status: 500 });
    }
}
