/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Batería Individual
 * GET    /api/batteries/[id] - Obtener batería por ID
 * PUT    /api/batteries/[id] - Actualizar batería
 * DELETE /api/batteries/[id] - Eliminar batería (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTenantFilter } from '@/lib/utils';

/**
 * GET /api/batteries/[id]
 * Get a specific battery by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default-tenant';

    const battery = await prisma.battery.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
      include: {
        services: {
          include: {
            service: {
              select: { id: true, name: true, code: true, sellingPrice: true, estimatedMinutes: true },
            },
          },
        },
        contractedBatteries: {
          include: {
            company: {
              select: { id: true, name: true, rfc: true },
            },
          },
        },
        _count: {
          select: { services: true, contractedBatteries: true },
        },
      },
    });

    if (!battery) {
      return NextResponse.json(
        { error: 'Battery not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(battery);
  } catch (error) {
    console.error('[GET /api/batteries/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to get battery' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/batteries/[id]
 * Update a specific battery
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
      description,
      costTotal,
      sellingPriceTotal,
      estimatedMinutes,
      status,
      serviceIds,
    } = body;

    // Verify battery exists and belongs to tenant
    const existing = await prisma.battery.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Battery not found' },
        { status: 404 }
      );
    }

    // If updating name, check for duplicates
    if (name && name !== existing.name) {
      const nameExists = await prisma.battery.findFirst({
        where: { tenantId, name, id: { not: id } },
      });
      if (nameExists) {
        return NextResponse.json(
          { error: 'Battery name already in use' },
          { status: 409 }
        );
      }
    }

    // Update in transaction
    const battery = await prisma.$transaction(async (tx) => {
      // Update battery
      await tx.battery.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(costTotal !== undefined && { costTotal: parseFloat(String(costTotal)) }),
          ...(sellingPriceTotal !== undefined && { sellingPriceTotal: sellingPriceTotal ? parseFloat(String(sellingPriceTotal)) : null }),
          ...(estimatedMinutes !== undefined && { estimatedMinutes: parseInt(String(estimatedMinutes)) }),
          ...(status && { status }),
        },
      });

      // Update services if provided
      if (serviceIds !== undefined) {
        // Delete existing services
        await tx.batteryService.deleteMany({
          where: { batteryId: id },
        });

        // Add new services
        if (serviceIds.length > 0) {
          await tx.batteryService.createMany({
            data: serviceIds.map((serviceId: string, index: number) => ({
              batteryId: id,
              serviceId,
              order: index,
            })),
          });
        }
      }

      // Fetch updated battery
      return tx.battery.findUnique({
        where: { id },
        include: {
          services: {
            include: {
              service: { select: { id: true, name: true, code: true, sellingPrice: true } },
            },
          },
          _count: { select: { services: true, contractedBatteries: true } },
        },
      });
    });

    return NextResponse.json(battery);
  } catch (error) {
    console.error('[PUT /api/batteries/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to update battery' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/batteries/[id]
 * Soft delete a battery (set status to INACTIVE)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default-tenant';

    // Verify battery exists and belongs to tenant
    const existing = await prisma.battery.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Battery not found' },
        { status: 404 }
      );
    }

    // Soft delete: set status to INACTIVE
    await prisma.battery.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return NextResponse.json({ success: true, message: 'Battery deactivated successfully' });
  } catch (error) {
    console.error('[DELETE /api/batteries/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to delete battery' },
      { status: 500 }
    );
  }
}
