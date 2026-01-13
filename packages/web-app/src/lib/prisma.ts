import { PrismaClient } from '@prisma/client';

// Singleton pattern to avoid multiple PrismaClient instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// CRITICAL: DATABASE_URL must be injected by Vercel at build time
// Force rebuild to ensure env vars are properly loaded
const isDatabaseConfigured = !!process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'], // Log errors and warnings only
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Debug helper - can be removed after verification
if (!isDatabaseConfigured && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ DATABASE_URL not configured - Prisma will fail in production');
}
