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

/**
 * POST /api/citas/availability
 * Find available time slots for a clinic on a given date
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, clinicId, appointmentDate } = body as AvailabilityRequest;

    if (!tenantId || !clinicId || !appointmentDate) {
      return NextResponse.json(
        { error: 'tenantId, clinicId, and appointmentDate are required' },
        { status: 400 }
      );
    }

    const slots = await appointmentService.findAvailableSlots(tenantId, {
      tenantId,
      clinicId,
      appointmentDate,
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
