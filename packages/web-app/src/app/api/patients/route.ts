/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Pacientes (Patient)
 * GET  /api/patients - Listar pacientes con filtros
 * POST /api/patients - Crear paciente
 * 
 * Schema-aligned: Uses Patient model with documentNumber, dateOfBirth, gender (M/F/O), etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTenantFilter } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'default-tenant';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, parseInt(searchParams.get('pageSize') || '20'));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');

    // Build where clause - omit tenantId filter if not a valid UUID
    const where: any = { ...buildTenantFilter(tenantId) };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    // Fetch patients with pagination
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          _count: {
            select: { expedients: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.patient.count({ where }),
    ]);

    return NextResponse.json({
      data: patients,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[GET /api/patients]', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId || 'default-tenant';
    const { 
      name, 
      email, 
      phoneNumber, 
      dateOfBirth, 
      gender = 'M', 
      documentType = 'DNI',
      documentNumber,
      address,
      city,
      state,
      zipCode,
      companyId,
    } = body;

    // Validations
    if (!name || !dateOfBirth || !documentNumber) {
      return NextResponse.json(
        { error: 'name, dateOfBirth, and documentNumber are required' },
        { status: 400 }
      );
    }

    // Validate gender enum
    const validGenders = ['M', 'F', 'O'];
    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { error: `gender must be one of: ${validGenders.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if patient with same documentNumber exists
    const existing = await prisma.patient.findFirst({
      where: {
        tenantId,
        documentNumber,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Patient with this document number already exists' },
        { status: 409 }
      );
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        tenantId,
        name,
        email,
        phoneNumber,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        documentType,
        documentNumber,
        address,
        city,
        state,
        zipCode,
        companyId,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('[POST /api/patients]', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
