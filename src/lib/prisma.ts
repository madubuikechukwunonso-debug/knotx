// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
  }).$extends(withAccelerate());
}

// Prevent multiple instances during development hot reloads
export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Optional: Light disconnect handling (Accelerate is more resilient)
if (process.env.NODE_ENV === 'production') {
  const disconnect = async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Accelerate handles connections differently, so we can safely ignore most disconnect errors
    }
  };

  process.on('beforeExit', disconnect);
  process.on('SIGTERM', disconnect);
}

export default prisma;
