import { NextRequest, NextResponse } from 'next/server';
import { AppointmentService } from '@ami/mod-citas';

/**
 * Mock Prisma client (replace with real database when infrastructure ready)
 * In production: Use real PrismaClient connected to PostgreSQL
 */
const mockPrisma = {
  appointment: {
    findMany: async () => [],
    findFirst: async () => null,
    create: async (data: any) => ({ id: 'mock-' + Date.now(), ...data.data }),
    update: async (data: any) => ({ ...data.data.data }),
    delete: async () => ({})
  },
  clinicSchedule: {
    findFirst: async () => null,
    findMany: async () => [],
  },
  appointmentService: {
    createMany: async () => ({})
  }
};

const appointmentService = new AppointmentService(mockPrisma as any);

/**
 * GET /api/citas
 * List appointments with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId') || 'default-tenant';
    const clinicId = searchParams.get('clinicId');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const result = await appointmentService.listAppointments({
      tenantId,
      clinicId,
      employeeId,
      status: status as any,
      page,
      pageSize,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[GET /api/citas]', error);
    return NextResponse.json(
      { error: 'Failed to list appointments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/citas
 * Create a new appointment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, ...appointmentData } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const result = await appointmentService.createAppointment(tenantId, appointmentData);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/citas]', error);
    const message = error instanceof Error ? error.message : 'Failed to create appointment';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
