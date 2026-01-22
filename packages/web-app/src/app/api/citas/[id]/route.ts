/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Cita Individual
 * GET    /api/citas/[id] - Obtener cita por ID
 * PUT    /api/citas/[id] - Actualizar cita
 * DELETE /api/citas/[id] - Cancelar cita (soft delete)
 * 
 * Schema-aligned: Uses Appointment model with clinic, expedients relations
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantIdFromRequest } from '@/lib/auth';

// Default tenant for MVP demo
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * Generate short display ID from CUID
 * Format: APT-XXXXXX (6 chars from cuid)
 */
function generateDisplayId(cuid: string): string {
  const shortId = cuid.slice(-6).toUpperCase();
  return `APT-${shortId}`;
}

/**
 * GET /api/citas/[id]
 * Get a single appointment by ID with patient info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use default tenant for MVP demo if no auth header
    const tenantId = await getTenantIdFromRequest(request) || DEFAULT_TENANT_ID;

    const { id } = await params;

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId },
      include: {
        clinic: {
          select: { id: true, name: true, address: true, phoneNumber: true },
        },
        expedients: {
          select: { id: true, folio: true, status: true },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Fetch patient info if employeeId exists
    let patient = null;
    if (appointment.employeeId) {
      patient = await prisma.patient.findUnique({
        where: { id: appointment.employeeId },
        select: { id: true, name: true, documentNumber: true },
      });
    }

    return NextResponse.json({
      ...appointment,
      displayId: generateDisplayId(appointment.id),
      appointmentTime: appointment.time,
      patient,
    });
  } catch (error) {
    console.error('[GET /api/citas/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to get appointment' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/citas/[id]
 * Update an appointment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use default tenant for MVP demo if no auth header
    const tenantId = await getTenantIdFromRequest(request) || DEFAULT_TENANT_ID;

    const { id } = await params;
    const body = await request.json();
    const {
      appointmentDate,
      time,
      status,
      clinicId,
      companyId,
      employeeId,
      notes,
    } = body;

    // Verify appointment exists and belongs to tenant
    const existing = await prisma.appointment.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['PENDING', 'SCHEDULED', 'CONFIRMED', 'CHECK_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // If transitioning to CHECK_IN, create expedient automatically
    let createdExpedient = null;
    if (status === 'CHECK_IN' && existing.status !== 'CHECK_IN') {
      // Check if expedient already exists for this appointment
      const existingExpedient = await prisma.expedient.findFirst({
        where: { appointmentId: id },
      });

      if (!existingExpedient && existing.employeeId && existing.clinicId) {
        // Generate folio
        const count = await prisma.expedient.count({
          where: { tenantId, clinicId: existing.clinicId },
        });
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const folio = `EXP-${today}-${String(count + 1).padStart(4, '0')}`;

        // Create expedient
        createdExpedient = await prisma.expedient.create({
          data: {
            tenantId,
            patientId: existing.employeeId,
            clinicId: existing.clinicId,
            appointmentId: id,
            folio,
            status: 'IN_PROGRESS',
          },
        });
      }
    }

    // Update appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(appointmentDate && { appointmentDate: new Date(appointmentDate) }),
        ...(time && { time }),
        ...(status && { status }),
        ...(clinicId && { clinicId }),
        ...(companyId !== undefined && { companyId }),
        ...(employeeId !== undefined && { employeeId }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        clinic: { select: { id: true, name: true } },
        expedients: { select: { id: true, folio: true, status: true } },
      },
    });

    // Fetch patient for response
    let patient = null;
    if (appointment.employeeId) {
      patient = await prisma.patient.findUnique({
        where: { id: appointment.employeeId },
        select: { id: true, name: true, documentNumber: true },
      });
    }

    return NextResponse.json({
      ...appointment,
      displayId: generateDisplayId(appointment.id),
      appointmentTime: appointment.time,
      patient,
      createdExpedient,
    });
  } catch (error) {
    console.error('[PUT /api/citas/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/citas/[id]
 * Cancel an appointment (soft delete via status)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use default tenant for MVP demo if no auth header
    const tenantId = await getTenantIdFromRequest(request) || DEFAULT_TENANT_ID;

    const { id } = await params;

    // Verify appointment exists and belongs to tenant
    const existing = await prisma.appointment.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Soft delete: update status to CANCELLED
    await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('[DELETE /api/citas/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
