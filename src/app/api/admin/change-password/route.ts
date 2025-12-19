import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest) {
    try {
        // Kiểm tra session
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Validation
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
        }

        // Kiểm tra độ mạnh mật khẩu mới
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return NextResponse.json(
                {
                    error: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
                },
                { status: 400 },
            );
        }

        // Tìm user hiện tại
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
        }

        // Xác minh mật khẩu hiện tại
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 });
        }

        // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return NextResponse.json({ error: 'Mật khẩu mới phải khác với mật khẩu hiện tại' }, { status: 400 });
        }

        // Hash mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Cập nhật mật khẩu
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword },
        });

        return NextResponse.json({ message: 'Thay đổi mật khẩu thành công' }, { status: 200 });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi thay đổi mật khẩu' }, { status: 500 });
    }
}
