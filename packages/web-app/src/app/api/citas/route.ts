import { NextRequest, NextResponse } from 'next/server';
import { AppointmentService } from '@ami/mod-citas';
import { prisma } from '@/lib/prisma';

// Initialize AppointmentService with real Prisma client
const appointmentService = new AppointmentService(prisma as any);

/**
 * GET /api/citas
 * List appointments with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId') || '550e8400-e29b-41d4-a716-446655440000';
    const clinicId = searchParams.get('clinicId');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const date = searchParams.get('date'); // Single date filter (YYYY-MM-DD)
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Build filter params
    const filterParams: any = {
      tenantId,
      clinicId: clinicId ?? undefined,
      employeeId: employeeId ?? undefined,
      status: status as any,
      page,
      pageSize,
    };

    // Handle single date filter (for daily view)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filterParams.dateFrom = startOfDay;
      filterParams.dateTo = endOfDay;
    } else {
      if (dateFrom) filterParams.dateFrom = new Date(dateFrom);
      if (dateTo) filterParams.dateTo = new Date(dateTo);
    }

    const result = await appointmentService.listAppointments(filterParams);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[GET /api/citas] Error:', errorMessage, error);
    return NextResponse.json(
      { 
        error: 'Failed to list appointments',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
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
    const { tenantId, ...rest } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Map UI fields to service interface
    // UI sends: patientId, clinicId, appointmentDate, time
    // Service expects: employeeId, clinicId, companyId, appointmentDate, appointmentTime, serviceIds
    const appointmentData = {
      clinicId: rest.clinicId,
      employeeId: rest.patientId || rest.employeeId,  // Support both field names
      companyId: rest.companyId || '',  // Optional company
      appointmentDate: rest.appointmentDate,
      appointmentTime: rest.time || rest.appointmentTime,  // Support both field names
      serviceIds: rest.serviceIds || [],  // Optional services
      notes: rest.notes || '',
    };

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
