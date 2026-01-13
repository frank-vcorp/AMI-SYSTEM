/**
 * Diagnostic API endpoint to debug Vercel/Railway connection
 * GET /api/diagnostics
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: {
      env: process.env.VERCEL_ENV,
      url: process.env.VERCEL_URL,
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
      gitCommitRef: process.env.VERCEL_GIT_COMMIT_REF,
      projectId: process.env.VERCEL_PROJECT_ID,
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
    },
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

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
