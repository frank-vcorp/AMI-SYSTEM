/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Empresa Individual
 * GET    /api/empresas/[id] - Obtener empresa por ID
 * PUT    /api/empresas/[id] - Actualizar empresa
 * DELETE /api/empresas/[id] - Eliminar empresa (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTenantFilter } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default-tenant';

    const company = await prisma.company.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
      include: {
        jobProfiles: {
          orderBy: { name: 'asc' },
        },
        batteries: {
          include: {
            battery: {
              select: { id: true, name: true, status: true },
            },
          },
          where: { isActive: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('[GET /api/empresas/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

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
      rfc, 
      description,
      address, 
      city, 
      state,
      zipCode,
      phoneNumber, 
      email, 
      contactPerson,
      contactPhone,
      maxEmployees,
      status,
      updatedBy 
    } = body;

    // Verify company exists and belongs to tenant
    const existing = await prisma.company.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // If updating RFC, check for duplicates
    if (rfc && rfc !== existing.rfc) {
      const rfcRegex = /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/i;
      if (!rfcRegex.test(rfc)) {
        return NextResponse.json(
          { error: 'Invalid RFC format' },
          { status: 400 }
        );
      }

      const rfcExists = await prisma.company.findUnique({
        where: { rfc: rfc.toUpperCase() },
      });
      if (rfcExists && rfcExists.id !== id) {
        return NextResponse.json(
          { error: 'RFC already in use by another company' },
          { status: 409 }
        );
      }
    }

    // If updating name, check for duplicates in tenant
    if (name && name !== existing.name) {
      const nameExists = await prisma.company.findFirst({
        where: { tenantId, name, id: { not: id } },
      });
      if (nameExists) {
        return NextResponse.json(
          { error: 'Company name already in use' },
          { status: 409 }
        );
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Update company
    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(rfc && { rfc: rfc.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(email !== undefined && { email }),
        ...(contactPerson !== undefined && { contactPerson }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(maxEmployees !== undefined && { maxEmployees }),
        ...(status && { status }),
        ...(updatedBy && { updatedBy }),
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('[PUT /api/empresas/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default-tenant';

    // Verify company exists and belongs to tenant
    const existing = await prisma.company.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Soft delete: update status to ARCHIVED
    await prisma.company.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ success: true, message: 'Company archived successfully' });
  } catch (error) {
    console.error('[DELETE /api/empresas/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
