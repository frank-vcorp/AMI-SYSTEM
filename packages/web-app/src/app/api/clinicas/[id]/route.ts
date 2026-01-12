import { NextRequest, NextResponse } from 'next/server';
import { ClinicService } from '@ami/mod-clinicas';

// Mock Prisma client (replace with real when DB is ready)
const mockPrisma = {
  clinic: {
    findMany: async () => [],
    findFirst: async () => null,
    create: async (data: any) => ({ id: 'mock-1', ...data.data }),
    update: async (data: any) => ({ ...data.data.data }),
    delete: async () => ({})
  },
  clinicSchedule: {
    findFirst: async () => null,
    upsert: async (data: any) => ({ ...data.create })
  }
};

const clinicService = new ClinicService(mockPrisma as any);

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/clinicas/:id
 * Get a specific clinic by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const clinicId = params.id;
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'default-tenant';

    const clinic = await clinicService.getClinic(tenantId, clinicId);

    return NextResponse.json(clinic, { status: 200 });
  } catch (error) {
    console.error('[GET /api/clinicas/:id]', error);
    return NextResponse.json(
      { error: 'Failed to get clinic' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clinicas/:id
 * Update a specific clinic
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const clinicId = params.id;
    const body = await request.json();
    const { tenantId = 'default-tenant', updatedBy = 'system', ...data } = body;

    const clinic = await clinicService.updateClinic(tenantId, clinicId, data, updatedBy);

    return NextResponse.json(clinic, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/clinicas/:id]', error);
    return NextResponse.json(
      { error: 'Failed to update clinic' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clinicas/:id
 * Delete (soft delete) a specific clinic
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const clinicId = params.id;
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'default-tenant';

    await clinicService.deleteClinic(tenantId, clinicId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/clinicas/:id]', error);
    return NextResponse.json(
      { error: 'Failed to delete clinic' },
      { status: 500 }
    );
  }
}
