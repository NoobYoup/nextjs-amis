'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface SessionWrapperProps {
    children: ReactNode;
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!user || user.role !== 'admin') {
        const isClient = typeof window !== 'undefined';
        if (isClient) {
             window.location.href = '/login';
        }
        return <p>Phiên đăng nhập hết hạn</p>;
    }

    return <>{children}</>;
}
