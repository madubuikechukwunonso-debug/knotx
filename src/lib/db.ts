// src/lib/db.ts
import { prisma } from "./prisma";

// For backward compatibility with old code that calls db()
export function db() {
  return prisma;
}

// Export prisma directly as well
export { prisma };
