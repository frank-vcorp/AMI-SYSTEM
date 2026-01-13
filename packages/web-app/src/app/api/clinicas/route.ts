import { NextRequest, NextResponse } from 'next/server';
import { ClinicService } from '@ami/mod-clinicas';
import { prisma } from '@/lib/prisma';

// Initialize ClinicService with real Prisma client
const clinicService = new ClinicService(prisma as any);

/**
 * GET /api/clinicas
 * List all clinics with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId') || 'default-tenant';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const city = searchParams.get('city') || undefined;

    const result = await clinicService.listClinics({
      tenantId,
      page,
      pageSize,
      search,
      status: status as any,
      city
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[GET /api/clinicas]', error);
    return NextResponse.json(
      { error: 'Failed to list clinics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clinicas
 * Create a new clinic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId = 'default-tenant', createdBy = 'system', ...data } = body;

    const clinic = await clinicService.createClinic(tenantId, data, createdBy);

    return NextResponse.json(clinic, { status: 201 });
  } catch (error) {
    console.error('[POST /api/clinicas]', error);
    return NextResponse.json(
      { error: 'Failed to create clinic' },
      { status: 500 }
    );
  }
}
