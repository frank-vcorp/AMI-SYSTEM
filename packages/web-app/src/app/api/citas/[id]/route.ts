import { NextRequest, NextResponse } from 'next/server';
import { AppointmentService } from '@ami/mod-citas';

const mockPrisma = {
  appointment: {
    findFirst: async () => null,
    update: async (data: any) => ({ ...data.data.data }),
    delete: async () => ({})
  },
  appointmentService: {
    deleteMany: async () => ({})
  }
};

const appointmentService = new AppointmentService(mockPrisma as any);

/**
 * GET /api/citas/[id]
 * Get a single appointment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'default-tenant';
    const { id } = params;

    const result = await appointmentService.getAppointment(tenantId, id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[GET /api/citas/[id]]', error);
    const message = error instanceof Error ? error.message : 'Failed to get appointment';
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('Not found') ? 404 : 500 }
    );
  }
}

/**
 * PUT /api/citas/[id]
 * Update an appointment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { tenantId, ...updateData } = body;
    const { id } = params;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const result = await appointmentService.updateAppointment(tenantId, id, updateData);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/citas/[id]]', error);
    const message = error instanceof Error ? error.message : 'Failed to update appointment';
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('Not found') ? 404 : 500 }
    );
  }
}

/**
 * DELETE /api/citas/[id]
 * Cancel an appointment (soft delete via status)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'default-tenant';
    const { id } = params;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    await appointmentService.cancelAppointment(tenantId, id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/citas/[id]]', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel appointment';
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('Not found') ? 404 : 500 }
    );
  }
}
