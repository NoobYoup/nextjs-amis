import '@/styles/globals.css';
import type { Metadata } from 'next';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
    title: 'AMIS School',
    description: 'Australian American International School',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi">
            <head>
                <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v7.1.0/css/all.css" />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
