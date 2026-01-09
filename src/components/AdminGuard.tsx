'use client';

import { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface AdminGuardProps {
    children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const { isLoading } = useAuthGuard({
        requireAuth: true,
        redirectTo: '/login'
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return <>{children}</>;
}
