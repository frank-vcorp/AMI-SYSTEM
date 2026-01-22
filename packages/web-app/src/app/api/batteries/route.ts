/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Baterías de Exámenes
 * GET  /api/batteries - Listar baterías
 * POST /api/batteries - Crear batería
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTenantFilter } from '@/lib/utils';

/**
 * GET /api/batteries
 * List all exam batteries with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tenantId = searchParams.get('tenantId') || '550e8400-e29b-41d4-a716-446655440000';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const companyId = searchParams.get('companyId');

    const where: any = { ...buildTenantFilter(tenantId) };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.status = isActive === 'true' ? 'ACTIVE' : 'INACTIVE';
    }

    const [batteries, total] = await Promise.all([
      prisma.battery.findMany({
        where,
        include: {
          services: {
            include: {
              service: {
                select: { id: true, name: true, code: true, sellingPrice: true },
              },
            },
          },
          contractedBatteries: companyId
            ? {
                where: { companyId },
                include: {
                  company: { select: { id: true, name: true } },
                },
              }
            : {
                take: 5,
                include: {
                  company: { select: { id: true, name: true } },
                },
              },
          _count: {
            select: { services: true, contractedBatteries: true },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.battery.count({ where }),
    ]);

    return NextResponse.json({
      data: batteries,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[GET /api/batteries]', error);
    return NextResponse.json(
      { error: 'Failed to list batteries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/batteries
 * Create a new exam battery
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId || '550e8400-e29b-41d4-a716-446655440000';
    const {
      name,
      description,
      costTotal = 0,
      sellingPriceTotal,
      estimatedMinutes = 0,
      status = 'ACTIVE',
      serviceIds = [],
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate name in tenant
    const existingName = await prisma.battery.findFirst({
      where: { tenantId, name },
    });
    if (existingName) {
      return NextResponse.json(
        { error: 'Battery name already exists' },
        { status: 409 }
      );
    }

    // Create battery with services in a transaction
    const battery = await prisma.$transaction(async (tx) => {
      // Create the battery
      const newBattery = await tx.battery.create({
        data: {
          tenantId,
          name,
          description,
          costTotal: costTotal ? parseFloat(String(costTotal)) : 0,
          sellingPriceTotal: sellingPriceTotal ? parseFloat(String(sellingPriceTotal)) : null,
          estimatedMinutes: estimatedMinutes ? parseInt(String(estimatedMinutes)) : 0,
          status,
        },
      });

      // Add services if provided
      if (serviceIds.length > 0) {
        await tx.batteryService.createMany({
          data: serviceIds.map((serviceId: string, index: number) => ({
            batteryId: newBattery.id,
            serviceId,
            order: index,
          })),
        });
      }

      return newBattery;
    });

    // Fetch complete battery with relations
    const completeBattery = await prisma.battery.findUnique({
      where: { id: battery.id },
      include: {
        services: {
          include: {
            service: { select: { id: true, name: true, code: true, sellingPrice: true } },
          },
        },
        _count: { select: { services: true, contractedBatteries: true } },
      },
    });

    return NextResponse.json(completeBattery, { status: 201 });
  } catch (error) {
    console.error('[POST /api/batteries]', error);
    return NextResponse.json(
      { error: 'Failed to create battery' },
      { status: 500 }
    );
  }
}
