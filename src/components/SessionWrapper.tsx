'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionWrapperProps {
    children: ReactNode;
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (!session?.user || (session.user as { role: string }).role !== 'admin') {
        return <p>Phiên đăng nhập hết hạn</p>; //fix lỗi từ next-auth.d.ts
    }

    return <>{children}</>;
}
