import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

// Helper: Upload file to Cloudinary (auto-detect resource type)
async function uploadToCloudinary(file: File, fileType: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Lấy tên file không có extension
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    
    // Determine resource type based on file type
    const resourceType = fileType === 'image' ? 'image' : 'raw';
    
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                resource_type: resourceType,
                public_id: `documents/${fileName}`, // Đặt tên file
                use_filename: true,
                unique_filename: true,
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    // Đảm bảo URL có đúng extension
                    const url = result?.secure_url || '';
                    console.log('Uploaded file URL:', url);
                    resolve(url);
                }
            },
        );
        uploadStream.end(buffer);
    });
}

// ✅ GET: Load document by id (Next.js 15 compatible)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const document = await prisma.document.findUnique({ 
            where: { id },
            include: { files: { orderBy: { order: 'asc' } } }
        });

        if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

        return NextResponse.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ✅ PUT: Update document (Next.js 15 compatible)
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        const formData = await req.formData();

        const title = formData.get('title') as string;
        const type = formData.get('type') as string;
        const number = formData.get('number') as string;
        const date = new Date(formData.get('date') as string);
        const field = formData.get('field') as string;
        const summary = formData.get('summary') as string;
        const isNew = formData.get('isNew') === 'true';

        const document = await prisma.document.findUnique({ 
            where: { id },
            include: { files: true }
        });
        if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

        // Get all new files from formData
        const files: File[] = [];
        const fileTypes: string[] = [];
        
        for (const [key, value] of formData.entries()) {
            if (key === 'file' && value instanceof File) {
                files.push(value);
                const ft = formData.get(`fileType_${files.length - 1}`) as string || 'pdf';
                fileTypes.push(ft);
            }
        }

        // If there are new files, delete old files and add new ones
        if (files.length > 0) {
            // Delete old files from Cloudinary
            for (const oldFile of document.files) {
                try {
                    const urlParts = oldFile.fileUrl.split('/upload/');
                    if (urlParts.length > 1) {
                        const pathWithVersion = urlParts[1];
                        const publicIdWithExt = pathWithVersion.split('/').slice(1).join('/');
                        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
                        
                        const resourceType = oldFile.fileType === 'image' ? 'image' : 'raw';
                        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
                        console.log('Deleted old file from Cloudinary:', publicId);
                    }
                } catch (error) {
                    console.error('Error deleting old file from Cloudinary:', error);
                }
            }

            // Delete old DocumentFile records
            await prisma.documentFile.deleteMany({ where: { documentId: id } });

            // Upload new files and create DocumentFile records
            for (let i = 0; i < files.length; i++) {
                const fileUrl = await uploadToCloudinary(files[i], fileTypes[i]);
                
                await prisma.documentFile.create({
                    data: {
                        documentId: id,
                        fileUrl,
                        fileType: fileTypes[i],
                        order: i,
                    },
                });
            }
        }

        // Update document metadata
        const updatedDocument = await prisma.document.update({
            where: { id },
            data: {
                title: title || document.title,
                type: type || document.type,
                number: number || document.number,
                date: date || document.date,
                field: field || document.field,
                summary: summary || document.summary,
                isNew: isNew !== undefined ? isNew : document.isNew,
            },
            include: { files: { orderBy: { order: 'asc' } } }
        });

        return NextResponse.json(updatedDocument);
    } catch (error) {
        console.error('Error updating document:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ✅ DELETE: Remove document (Next.js 15 compatible)
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        const document = await prisma.document.findUnique({ 
            where: { id },
            include: { files: true }
        });
        if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

        // Delete all files from Cloudinary
        for (const file of document.files) {
            try {
                // Extract public_id from URL
                // URL format: https://res.cloudinary.com/.../raw/upload/v123/documents/filename.pdf
                const urlParts = file.fileUrl.split('/upload/');
                if (urlParts.length > 1) {
                    const pathWithVersion = urlParts[1]; // v123/documents/filename.pdf
                    const publicIdWithExt = pathWithVersion.split('/').slice(1).join('/'); // documents/filename.pdf
                    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // documents/filename
                    
                    const resourceType = file.fileType === 'image' ? 'image' : 'raw';
                    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
                    console.log('Deleted file from Cloudinary:', publicId);
                }
            } catch (error) {
                console.error('Error deleting file from Cloudinary:', error);
                // Continue with database deletion even if Cloudinary deletion fails
            }
        }

        await prisma.document.delete({ where: { id } });

        return NextResponse.json({ message: 'Document deleted' });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
