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

// Tenant por defecto para MVP demo
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || DEFAULT_TENANT_ID;
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
    const tenantId = body.tenantId || DEFAULT_TENANT_ID;
    
    // Aceptar nombres del formulario y del schema (compatibilidad)
    const name = body.name;
    const email = body.email;
    const phoneNumber = body.phoneNumber || body.phone;
    const dateOfBirth = body.dateOfBirth || body.birthDate;
    const documentNumber = body.documentNumber || body.documentId;
    const documentType = body.documentType || 'CURP';
    const address = body.address;
    const city = body.city;
    const state = body.state;
    const zipCode = body.zipCode;
    const companyId = body.companyId || null;
    // Note: jobProfileId from form is ignored - not in Patient schema
    
    // Mapear género del formulario al schema
    let gender = body.gender || 'M';
    if (gender === 'MASCULINO' || gender === 'Masculino') gender = 'M';
    if (gender === 'FEMENINO' || gender === 'Femenino') gender = 'F';
    if (gender === 'OTRO' || gender === 'Otro') gender = 'O';

    // Validations - ahora más flexibles
    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }
    
    if (!dateOfBirth) {
      return NextResponse.json(
        { error: 'La fecha de nacimiento es requerida' },
        { status: 400 }
      );
    }
    
    if (!documentNumber) {
      return NextResponse.json(
        { error: 'El documento de identidad es requerido' },
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
        { error: 'Ya existe un paciente con este documento' },
        { status: 409 }
      );
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        tenantId,
        name,
        email: email || null,
        phoneNumber: phoneNumber || null,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        documentType,
        documentNumber,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        companyId,
        // Note: jobProfileId is not in Patient model, ignore it
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
