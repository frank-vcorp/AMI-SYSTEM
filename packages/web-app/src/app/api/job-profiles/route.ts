/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Perfiles de Puesto
 * GET  /api/job-profiles - Listar perfiles de puesto
 * POST /api/job-profiles - Crear perfil de puesto
 * 
 * Schema-aligned: Uses JobProfile model with company relation and requiredBatteryIds
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantIdFromRequest } from '@/lib/auth';

/**
 * GET /api/job-profiles
 * List all job profiles with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found' },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || '';
    const companyId = searchParams.get('companyId');
    const riskLevel = searchParams.get('riskLevel');

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    const [jobProfiles, total] = await Promise.all([
      prisma.jobProfile.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true, rfc: true },
          },
        },
        orderBy: [{ company: { name: 'asc' } }, { name: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.jobProfile.count({ where }),
    ]);

    return NextResponse.json({
      data: jobProfiles,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[GET /api/job-profiles]', error);
    return NextResponse.json(
      { error: 'Failed to list job profiles' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/job-profiles
 * Create a new job profile
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      companyId,
      riskLevel = 'BAJO',
      requiredBatteryIds = [],
    } = body;

    // Validate required fields
    if (!name || !companyId) {
      return NextResponse.json(
        { error: 'name and companyId are required' },
        { status: 400 }
      );
    }

    // Check for duplicate name within company
    const existingName = await prisma.jobProfile.findFirst({
      where: { companyId, name },
    });
    if (existingName) {
      return NextResponse.json(
        { error: 'Job profile name already exists in this company' },
        { status: 409 }
      );
    }

    // Verify company exists and belongs to tenant
    const company = await prisma.company.findFirst({
      where: { id: companyId, tenantId },
    });
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Validate risk level
    const validRiskLevels = ['BAJO', 'MEDIO', 'ALTO'];
    if (!validRiskLevels.includes(riskLevel)) {
      return NextResponse.json(
        { error: `riskLevel must be one of: ${validRiskLevels.join(', ')}` },
        { status: 400 }
      );
    }

    const jobProfile = await prisma.jobProfile.create({
      data: {
        tenantId,
        name,
        description,
        companyId,
        riskLevel,
        requiredBatteryIds,
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(jobProfile, { status: 201 });
  } catch (error) {
    console.error('[POST /api/job-profiles]', error);
    return NextResponse.json(
      { error: 'Failed to create job profile' },
      { status: 500 }
    );
  }
}
