/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Perfil de Puesto Individual
 * GET    /api/job-profiles/[id] - Obtener perfil por ID
 * PUT    /api/job-profiles/[id] - Actualizar perfil
 * DELETE /api/job-profiles/[id] - Eliminar perfil
 * 
 * Schema-aligned: Uses JobProfile model with company relation and requiredBatteryIds
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTenantFilter } from '@/lib/utils';

/**
 * GET /api/job-profiles/[id]
 * Get a specific job profile by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default-tenant';

    const jobProfile = await prisma.jobProfile.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
      include: {
        company: {
          select: { id: true, name: true, rfc: true, contactPerson: true },
        },
      },
    });

    if (!jobProfile) {
      return NextResponse.json(
        { error: 'Job profile not found' },
        { status: 404 }
      );
    }

    // Fetch related batteries if requiredBatteryIds exist
    let batteries: any[] = [];
    if (jobProfile.requiredBatteryIds && jobProfile.requiredBatteryIds.length > 0) {
      batteries = await prisma.battery.findMany({
        where: {
          id: { in: jobProfile.requiredBatteryIds },
          tenantId,
        },
        include: {
          services: {
            include: {
              service: {
                select: { id: true, name: true, code: true, sellingPrice: true },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({
      ...jobProfile,
      batteries,
    });
  } catch (error) {
    console.error('[GET /api/job-profiles/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to get job profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/job-profiles/[id]
 * Update a specific job profile
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
      companyId,
      riskLevel,
      requiredBatteryIds,
    } = body;

    // Verify job profile exists and belongs to tenant
    const existing = await prisma.jobProfile.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Job profile not found' },
        { status: 404 }
      );
    }

    // If updating name, check for duplicates within company
    if (name && name !== existing.name) {
      const nameExists = await prisma.jobProfile.findFirst({
        where: { 
          companyId: companyId || existing.companyId, 
          name, 
          id: { not: id } 
        },
      });
      if (nameExists) {
        return NextResponse.json(
          { error: 'Job profile name already exists in this company' },
          { status: 409 }
        );
      }
    }

    // Verify company if provided
    if (companyId && companyId !== existing.companyId) {
      const company = await prisma.company.findFirst({
        where: { id: companyId, tenantId },
      });
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
    }

    // Validate risk level if provided
    if (riskLevel) {
      const validRiskLevels = ['BAJO', 'MEDIO', 'ALTO'];
      if (!validRiskLevels.includes(riskLevel)) {
        return NextResponse.json(
          { error: `riskLevel must be one of: ${validRiskLevels.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const jobProfile = await prisma.jobProfile.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(companyId && { companyId }),
        ...(riskLevel && { riskLevel }),
        ...(requiredBatteryIds !== undefined && { requiredBatteryIds }),
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(jobProfile);
  } catch (error) {
    console.error('[PUT /api/job-profiles/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to update job profile' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/job-profiles/[id]
 * Delete a job profile
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default-tenant';

    // Verify job profile exists and belongs to tenant
    const existing = await prisma.jobProfile.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Job profile not found' },
        { status: 404 }
      );
    }

    // Hard delete
    await prisma.jobProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Job profile deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/job-profiles/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to delete job profile' },
      { status: 500 }
    );
  }
}
