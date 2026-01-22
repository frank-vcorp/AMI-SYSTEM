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
 * GET /api/citas/[id]
 * Get a single appointment by ID
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

    return NextResponse.json(appointment);
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
      const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
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

    return NextResponse.json(appointment);
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
