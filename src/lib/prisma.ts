import { PrismaClient } from '@prisma/client';

// Khai báo type mở rộng cho globalThis
declare global {
    var prisma: PrismaClient | undefined;
}

// Tạo Prisma Client với caching để tránh tạo nhiều instance trong development
const prismaClient =
    globalThis.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prismaClient;
}

export const prisma = prismaClient;
export default prismaClient;
