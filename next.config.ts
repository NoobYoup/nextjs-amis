import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // output: 'export',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    experimental: {
        optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    },
    // Enable proper CSS optimization for Material-UI
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? true : false,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
