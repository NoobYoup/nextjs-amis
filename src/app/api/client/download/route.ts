import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
        return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
    }

    try {
        // Fetch file từ URL (Cloudinary hoặc URL khác)
        const response = await fetch(fileUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Lấy tên file từ URL
        const urlParts = fileUrl.split('/');
        const filename = urlParts[urlParts.length - 1].split('?')[0];

        // Lấy content type từ response
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // Tạo response với file data
        const fileBuffer = await response.arrayBuffer();

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
                'Content-Type': contentType,
                'Content-Length': fileBuffer.byteLength.toString(),
            },
        });
    } catch (error: unknown) {
        console.error('Download error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Error downloading file', details: errorMessage },
            { status: 500 }
        );
    }
}
