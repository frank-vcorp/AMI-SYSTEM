/**
 * core-database - Prisma + PostgreSQL + tenant middleware
 * 
 * Proporciona:
 * - Cliente Prisma configurado
 * - Middleware multi-tenant
 * - Funciones de seed
 * - Migrations
 */

import { PrismaClient } from '@prisma/client';

// Services
export * from './services/doctorService';
export * from './services/folioService';
export * from './services/dashboardService';
export * from './services/workerIdService';

// Declare global para TypeScript
declare global {
  var prisma: PrismaClient | undefined;
}

// Cliente Prisma singleton
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };

/**
 * Middleware para filtrar automáticamente por tenantId
 */
export function createTenantMiddleware(tenantId: string) {
  // Implementación pendiente
  console.log('Tenant middleware for:', tenantId);
}

/**
 * Seed database con datos iniciales
 */
export async function seedDatabase() {
  // Implementación pendiente
  console.log('Database seeding pending');
}

export default {
  prisma,
  createTenantMiddleware,
  seedDatabase,
};
