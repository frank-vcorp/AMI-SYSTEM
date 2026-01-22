/**
 * IMPL-20260122-01: POST/GET /api/citas
 * Manage appointments with occupancy-based availability
 * @ref context/infraestructura/Detalle-Specs/SPEC-MOD-CITAS.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

/**
 * Generate unique appointment folio (ID Papeleta)
 * Format: EXP-YYYYNNN (e.g., EXP-202601001)
 */
async function generateAppointmentFolio(_clinicCity: string, tenantId: string): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const yearMonth = `${year}${month}`;

  // Get count of appointments this month for sequencing
  const count = await prisma.appointment.count({
    where: {
      tenantId,
      appointmentDate: {
        gte: new Date(year, new Date().getMonth(), 1),
        lt: new Date(year, new Date().getMonth() + 1, 1),
      },
    },
  });

  const sequence = String(count + 1).padStart(3, '0');
  return `EXP-${yearMonth}${sequence}`;
}

/**
 * Generate QR code for appointment check-in
 */
async function generateAppointmentQrCode(appointmentId: string, folio: string): Promise<string> {
  const qrData = JSON.stringify({
    appointmentId,
    folio,
    checkInUrl: `${process.env.NEXT_PUBLIC_APP_URL}/check-in/${appointmentId}`,
  });

  return await QRCode.toDataURL(qrData);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clinicId, employeeId, companyId, appointmentDate, time, occupancySlot, notes } = body;

    // Validate required fields
    if (!clinicId || !appointmentDate || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: clinicId, appointmentDate, time' },
        { status: 400 }
      );
    }

    // Get clinic and tenant info
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Check availability for this time slot
    const appointmentCount = await prisma.appointment.count({
      where: {
        clinicId,
        appointmentDate: new Date(appointmentDate),
        time,
      },
    });

    // Get max occupancy from clinic schedule (simplified for now)
    const maxOccupancy = 10; // TODO: Load from ClinicSchedule

    if (appointmentCount >= maxOccupancy) {
      return NextResponse.json(
        { error: 'Time slot is fully booked. Please select another time.' },
        { status: 409 }
      );
    }

    // Generate appointment folio and QR code
    const folio = await generateAppointmentFolio(clinic.city, clinic.tenantId);

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        tenantId: clinic.tenantId,
        clinicId,
        employeeId,
        companyId,
        appointmentDate: new Date(appointmentDate),
        time,
        appointmentFolio: folio,
        occupancySlot: occupancySlot || appointmentCount + 1,
        maxOccupancy,
        status: 'SCHEDULED',
        notes,
      } as any, // Temporary workaround for Prisma type sync issue
    });

    // Generate QR code
    const qrCode = await generateAppointmentQrCode(appointment.id, folio);

    return NextResponse.json(
      {
        success: true,
        appointment: {
          id: (appointment as any).id,
          folio: (appointment as any).appointmentFolio,
          qrCode,
          date: (appointment as any).appointmentDate,
          time: (appointment as any).time,
          status: (appointment as any).status,
          occupancySlot: (appointment as any).occupancySlot,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/citas
 * List appointments with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinicId = searchParams.get('clinicId');
    const date = searchParams.get('date');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    if (date) {
      const dateObj = new Date(date);
      where.appointmentDate = {
        gte: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()),
        lt: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        clinic: true,
      },
      orderBy: { appointmentDate: 'asc' },
      take: 100,
    });

    // Calculate occupancy for each time slot
    const occupancyMap = new Map<string, number>();
    for (const apt of appointments) {
      const slotKey = `${apt.clinicId}-${apt.appointmentDate.toISOString().split('T')[0]}-${apt.time}`;
      occupancyMap.set(slotKey, (occupancyMap.get(slotKey) || 0) + 1);
    }

    return NextResponse.json({
      success: true,
      appointments: appointments.map((apt: any) => ({
        ...apt,
        occupancyPercentage:
          apt.maxOccupancy && apt.occupancySlot
            ? Math.round((apt.occupancySlot / apt.maxOccupancy) * 100)
            : 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
