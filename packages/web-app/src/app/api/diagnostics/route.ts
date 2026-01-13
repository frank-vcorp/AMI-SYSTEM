/**
 * Diagnostic API endpoint to debug Vercel/Railway connection
 * GET /api/diagnostics
 */
import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
    databaseUrl: process.env.DATABASE_URL ? '***REDACTED***' : 'NOT SET',
    railway: {
      status: !!process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'
    }
  };

  try {
    // Try to import Prisma
    const { prisma } = await import('@/lib/prisma');
    
    // Try to query
    const clinics = await prisma.clinic.count();
    diagnostics.prisma = {
      status: '✅ Connected',
      clinicCount: clinics
    };
  } catch (error) {
    diagnostics.prisma = {
      status: '❌ Error',
      error: error instanceof Error ? error.message : String(error)
    };
  }

  return NextResponse.json(diagnostics);
}
