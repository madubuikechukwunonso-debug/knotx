// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    
    // Connection pool settings for serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful disconnect on serverless shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    console.log('Prisma disconnecting...');
    await prisma.$disconnect();
  });

  // Also handle SIGTERM for Vercel
  process.on('SIGTERM', async () => {
    console.log('Prisma SIGTERM received, disconnecting...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default prisma;
