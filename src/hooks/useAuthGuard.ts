'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthGuard = (options: {
    requireAuth?: boolean;
    redirectIfAuthenticated?: boolean;
    redirectTo?: string;
} = {}) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    
    const {
        requireAuth = false,
        redirectIfAuthenticated = false,
        redirectTo
    } = options;
    
    useEffect(() => {
        if (isLoading) return;
        
        // Redirect authenticated users away from login
        if (redirectIfAuthenticated && user) {
            router.push(redirectTo || '/admin/activities');
            return;
        }
        
        // Redirect unauthenticated users to login
        if (requireAuth && !user) {
            router.push(redirectTo || '/login');
            return;
        }
    }, [user, isLoading, requireAuth, redirectIfAuthenticated, redirectTo, router]);
    
    return { user, isLoading };
};
