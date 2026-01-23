import { NextRequest, NextResponse } from 'next/server';
import { AppointmentService } from '@ami/mod-citas';
import { prisma } from '@/lib/prisma';

// Initialize AppointmentService with real Prisma client
const appointmentService = new AppointmentService(prisma as any);

// Default tenant for MVP demo
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * Generate short display ID from CUID
 * Format: APT-XXXXXX (6 chars from cuid)
 */
function generateDisplayId(cuid: string): string {
  // Take last 6 chars of the CUID (more unique than first chars)
  const shortId = cuid.slice(-6).toUpperCase();
  return `APT-${shortId}`;
}

/**
 * GET /api/citas
 * List appointments with filters
 * Enhanced: Includes patient and clinic info
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId') || DEFAULT_TENANT_ID;
    const clinicId = searchParams.get('clinicId');
    const patientId = searchParams.get('patientId') || searchParams.get('employeeId'); // Support both names
    const status = searchParams.get('status');
    const date = searchParams.get('date'); // Single date filter (YYYY-MM-DD)
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = { tenantId };
    if (clinicId) where.clinicId = clinicId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    // Handle date filters
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.appointmentDate = { gte: startOfDay, lte: endOfDay };
    } else {
      if (dateFrom || dateTo) {
        where.appointmentDate = {};
        if (dateFrom) where.appointmentDate.gte = new Date(dateFrom);
        if (dateTo) where.appointmentDate.lte = new Date(dateTo);
      }
    }

    // Query appointments with clinic relation
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          clinic: { select: { id: true, name: true, address: true } },
          expedients: { select: { id: true, folio: true, status: true } },
        },
        orderBy: [
          { appointmentDate: 'asc' },
          { time: 'asc' }
        ],
      }),
      prisma.appointment.count({ where }),
    ]);

    // Get patient IDs from appointments
    const patientIds = appointments.map(a => a.patientId).filter(Boolean) as string[];
    
    // Fetch patients in one query
    const patients = patientIds.length > 0 
      ? await prisma.patient.findMany({
          where: { id: { in: patientIds } },
          select: { id: true, name: true, documentNumber: true },
        })
      : [];

    // Create patient lookup map
    const patientMap = new Map(patients.map(p => [p.id, p]));

    // Enhance appointments with patient info and displayId
    const enhancedAppointments = appointments.map(apt => ({
      ...apt,
      displayId: generateDisplayId(apt.id),
      appointmentTime: apt.time, // Alias for frontend compatibility
      patient: apt.patientId ? patientMap.get(apt.patientId) || null : null,
    }));

    return NextResponse.json({
      data: enhancedAppointments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }, { status: 200 });
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

    // Map UI fields to Prisma
    // UI sends: patientId, clinicId, appointmentDate, time
    const appointmentData = {
      tenantId,
      clinicId: rest.clinicId,
      patientId: rest.patientId || rest.employeeId,  // Support both field names
      companyId: rest.companyId || null,  // Optional company
      appointmentDate: rest.appointmentDate,
      time: rest.time || rest.appointmentTime,  // Support both field names
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
