/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Clínica Individual
 * GET    /api/clinicas/[id] - Obtener clínica por ID
 * PUT    /api/clinicas/[id] - Actualizar clínica
 * DELETE /api/clinicas/[id] - Eliminar clínica (soft delete)
 * 
 * FIXED: Removed mockPrisma, now using real Prisma client
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantIdFromRequest } from '@/lib/auth';

/**
 * GET /api/clinicas/[id]
 * Get a specific clinic by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const clinic = await prisma.clinic.findFirst({
      where: { id, tenantId },
      include: {
        schedules: {
          orderBy: { dayOfWeek: 'asc' },
        },
        doctors: {
          select: { id: true, name: true, specialty: true, cedula: true },
        },
        services: {
          where: { isAvailable: true },
          include: {
            service: {
              select: { id: true, name: true, code: true },
            },
          },
        },
        _count: {
          select: {
            appointments: true,
            expedients: true,
          },
        },
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(clinic);
  } catch (error) {
    console.error('[GET /api/clinicas/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to get clinic' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clinicas/[id]
 * Update a specific clinic
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      description,
      address, 
      city, 
      state,
      zipCode,
      phoneNumber, 
      email,
      totalBeds,
      availableBeds,
      isHeadquarters,
      status,
    } = body;

    // Verify clinic exists and belongs to tenant
    const existing = await prisma.clinic.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // If updating name, check for duplicates in tenant
    if (name && name !== existing.name) {
      const nameExists = await prisma.clinic.findFirst({
        where: { tenantId, name, id: { not: id } },
      });
      if (nameExists) {
        return NextResponse.json(
          { error: 'Clinic name already in use' },
          { status: 409 }
        );
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Update clinic
    const clinic = await prisma.clinic.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(email !== undefined && { email }),
        ...(totalBeds !== undefined && { totalBeds }),
        ...(availableBeds !== undefined && { availableBeds }),
        ...(isHeadquarters !== undefined && { isHeadquarters }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(clinic);
  } catch (error) {
    console.error('[PUT /api/clinicas/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to update clinic' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clinicas/[id]
 * Soft delete a specific clinic
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify clinic exists and belongs to tenant
    const existing = await prisma.clinic.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Soft delete: update status to ARCHIVED
    await prisma.clinic.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ success: true, message: 'Clinic archived successfully' });
  } catch (error) {
    console.error('[DELETE /api/clinicas/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to delete clinic' },
      { status: 500 }
    );
  }
}
