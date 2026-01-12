import { NextRequest, NextResponse } from 'next/server';
import { AppointmentService, AvailabilityRequest } from '@ami/mod-citas';

const mockPrisma = {
  appointment: {
    findMany: async () => [],
  },
  clinicSchedule: {
    findFirst: async () => null,
  }
};

const appointmentService = new AppointmentService(mockPrisma as any);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clinicId, dateFrom, dateTo, serviceIds, durationMin } = body as AvailabilityRequest;
    
    // Get tenantId from headers (from auth context in production)
    const tenantId = request.headers.get('x-tenant-id') || 'default-tenant';

    if (!clinicId || !dateFrom || !dateTo || !serviceIds || durationMin === undefined) {
      return NextResponse.json(
        { error: 'clinicId, dateFrom, dateTo, serviceIds, and durationMin are required' },
        { status: 400 }
      );
    }

    const slots = await appointmentService.findAvailableSlots(tenantId, {
      clinicId,
      dateFrom,
      dateTo,
      serviceIds,
      durationMin,
    });

    return NextResponse.json({ slots }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/citas/availability]', error);
    const message = error instanceof Error ? error.message : 'Failed to find available slots';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
