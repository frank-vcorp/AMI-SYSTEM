/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Servicios Médicos
 * GET  /api/services - Listar servicios
 * POST /api/services - Crear servicio
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
 * GET /api/services
 * List all medical services with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tenantId = searchParams.get('tenantId') || 'default-tenant';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status');

    const where: any = { ...buildTenantFilter(tenantId) };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          _count: {
            select: { batteries: true, clinics: true },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json({
      data: services,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[GET /api/services]', error);
    return NextResponse.json(
      { error: 'Failed to list services' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services
 * Create a new medical service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId || 'default-tenant';
    const {
      name,
      code,
      description,
      category = 'OTROS',
      estimatedMinutes = 30,
      requiresEquipment = false,
      equipmentName,
      costAmount = 0,
      sellingPrice,
      status = 'ACTIVE',
    } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'name and code are required' },
        { status: 400 }
      );
    }

    // Check for duplicate code in tenant
    const existingCode = await prisma.service.findFirst({
      where: { tenantId, code },
    });
    if (existingCode) {
      return NextResponse.json(
        { error: 'Service code already exists' },
        { status: 409 }
      );
    }

    const service = await prisma.service.create({
      data: {
        tenantId,
        name,
        code,
        description,
        category,
        estimatedMinutes: parseInt(estimatedMinutes.toString()),
        requiresEquipment,
        equipmentName,
        costAmount: parseFloat(costAmount.toString()),
        sellingPrice: sellingPrice ? parseFloat(sellingPrice.toString()) : null,
        status,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('[POST /api/services]', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
