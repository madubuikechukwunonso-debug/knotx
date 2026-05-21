// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],

    // These settings help with serverless cold starts
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

// Prevent multiple instances during development hot reloads
export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful disconnect handlers
if (process.env.NODE_ENV === 'production') {
  const disconnect = async () => {
    console.log('[Prisma] Disconnecting...');
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[Prisma] Error during disconnect:', e);
    }
  };

  process.on('beforeExit', disconnect);
  process.on('SIGTERM', disconnect);
  process.on('SIGINT', disconnect);
}

export default prisma;
