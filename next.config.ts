import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    },
    // Enable proper CSS optimization for Material-UI
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? true : false,
    },
};

export default nextConfig;
