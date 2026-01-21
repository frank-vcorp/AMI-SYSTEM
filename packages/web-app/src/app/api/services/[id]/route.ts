/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Servicio Individual
 * GET    /api/services/[id] - Obtener servicio por ID
 * PUT    /api/services/[id] - Actualizar servicio
 * DELETE /api/services/[id] - Eliminar servicio (soft delete)
 * 
 * Campos del modelo Service:
 * - code, name, description, category (ServiceCategory enum)
 * - estimatedMinutes, requiresEquipment, equipmentName
 * - costAmount, sellingPrice, status (ServiceStatus enum)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTenantFilter } from '@/lib/utils';

/**
 * GET /api/services/[id]
 * Get a specific service by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default-tenant';

    const service = await prisma.service.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
      include: {
        batteries: {
          include: {
            battery: {
              select: { id: true, name: true, status: true },
            },
          },
        },
        clinics: {
          include: {
            clinic: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { batteries: true, clinics: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('[GET /api/services/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to get service' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/services/[id]
 * Update a specific service
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = body.tenantId || 'default-tenant';
    const {
      name,
      code,
      description,
      category,
      estimatedMinutes,
      requiresEquipment,
      equipmentName,
      costAmount,
      sellingPrice,
      status,
    } = body;

    // Verify service exists and belongs to tenant
    const existing = await prisma.service.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // If updating code, check for duplicates
    if (code && code !== existing.code) {
      const codeExists = await prisma.service.findFirst({
        where: { tenantId, code, id: { not: id } },
      });
      if (codeExists) {
        return NextResponse.json(
          { error: 'Service code already in use' },
          { status: 409 }
        );
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(estimatedMinutes !== undefined && { estimatedMinutes: parseInt(estimatedMinutes.toString()) }),
        ...(requiresEquipment !== undefined && { requiresEquipment }),
        ...(equipmentName !== undefined && { equipmentName }),
        ...(costAmount !== undefined && { costAmount: parseFloat(costAmount.toString()) }),
        ...(sellingPrice !== undefined && { sellingPrice: sellingPrice ? parseFloat(sellingPrice.toString()) : null }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('[PUT /api/services/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services/[id]
 * Soft delete a service (set status to INACTIVE)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default-tenant';

    // Verify service exists and belongs to tenant
    const existing = await prisma.service.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Soft delete: set status to INACTIVE
    await prisma.service.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return NextResponse.json({ success: true, message: 'Service disabled successfully' });
  } catch (error) {
    console.error('[DELETE /api/services/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
