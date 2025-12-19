import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Box } from '@mui/material';

export const metadata: Metadata = {
    title: 'AMIS School',
    description: 'Australian American International School',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh' }}>{children}</Box>
            <Footer />
        </>
    );
}
