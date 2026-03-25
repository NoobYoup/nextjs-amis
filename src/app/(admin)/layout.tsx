'use client';

import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '@/components/Sidebar';
import SessionWrapper from '@/components/SessionWrapper';
import AdminGuard from '@/components/AdminGuard';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <SessionWrapper>
            <AdminGuard>
                <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
                    <Sidebar />
                    <Box
                        component="main"
                        sx={{
                            flex: 1,
                            overflow: 'auto',
                            backgroundColor: 'var(--background)',
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </AdminGuard>
        </SessionWrapper>
    );
};

export default AdminLayout;
