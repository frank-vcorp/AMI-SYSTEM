/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Paciente Individual
 * GET    /api/patients/[id] - Obtener paciente por ID
 * PUT    /api/patients/[id] - Actualizar paciente
 * DELETE /api/patients/[id] - Eliminar paciente (soft delete)
 * 
 * Schema-aligned: Uses Patient model with documentNumber, dateOfBirth, gender (M/F/O), etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTenantFilter } from '@/lib/utils';

// Tenant por defecto para MVP demo
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || DEFAULT_TENANT_ID;

    const patient = await prisma.patient.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
      include: {
        company: {
          select: { id: true, name: true },
        },
        expedients: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            clinic: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('[GET /api/patients/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
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
    const tenantId = body.tenantId || DEFAULT_TENANT_ID;
    
    // Support both form field names and schema field names for compatibility
    const phoneNumber = body.phoneNumber || body.phone;
    const dateOfBirth = body.dateOfBirth || body.birthDate;
    const documentNumber = body.documentNumber || body.documentId;
    
    // Map gender from form values to schema values
    let gender = body.gender;
    if (gender === 'MASCULINO') gender = 'M';
    else if (gender === 'FEMENINO') gender = 'F';
    else if (gender === 'OTRO') gender = 'O';
    
    const { 
      name, 
      email, 
      documentType,
      address,
      city,
      state,
      zipCode,
      companyId,
      status,
    } = body;

    // Verify patient exists and belongs to tenant
    const existing = await prisma.patient.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // If updating documentNumber, check for duplicates
    if (documentNumber && documentNumber !== existing.documentNumber) {
      const docExists = await prisma.patient.findFirst({
        where: { tenantId, documentNumber, id: { not: id } },
      });
      if (docExists) {
        return NextResponse.json(
          { error: 'Document number already in use by another patient' },
          { status: 409 }
        );
      }
    }

    // Validate gender if provided
    if (gender) {
      const validGenders = ['M', 'F', 'O'];
      if (!validGenders.includes(gender)) {
        return NextResponse.json(
          { error: `gender must be one of: ${validGenders.join(', ')}` },
          { status: 400 }
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

    // Update patient
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(documentType && { documentType }),
        ...(documentNumber && { documentNumber }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(companyId !== undefined && { companyId }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error('[PUT /api/patients/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
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
    const tenantId = searchParams.get('tenantId') || DEFAULT_TENANT_ID;

    // Verify patient exists and belongs to tenant
    const existing = await prisma.patient.findFirst({
      where: { id, ...buildTenantFilter(tenantId) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Soft delete: update status to ARCHIVED
    await prisma.patient.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ success: true, message: 'Patient archived successfully' });
  } catch (error) {
    console.error('[DELETE /api/patients/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}
