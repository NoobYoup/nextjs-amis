'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRootPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (user) {
            // Logged in -> redirect to admin activities
            router.push('/admin/activities');
        } else {
            // Not logged in -> redirect to login
            router.push('/login');
        }
    }, [user, isLoading, router]);

    // Show loading while checking auth and redirecting
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <CircularProgress />
        </Box>
    );
}
