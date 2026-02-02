/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Pacientes (Patient)
 * GET  /api/patients - Listar pacientes con filtros
 * POST /api/patients - Crear paciente
 * 
 * Schema-aligned: Uses Patient model with documentId, dateOfBirth, gender (M/F/O), etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTenantFilter } from '@/lib/utils';
import { generateWorkerId } from '@ami/core-database';
import { Gender } from '@prisma/client';

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
        { firstName: { contains: search, mode: 'insensitive' } },
        { paternalLastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { documentId: { contains: search, mode: 'insensitive' } },
        { uniqueId: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
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
          company: {
            select: { id: true, name: true },
          },
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

    // Extract name parts or whole name
    let firstName = body.firstName;
    let paternalLastName = body.paternalLastName;
    let maternalLastName = body.maternalLastName;
    const fullName = body.name || body.fullName;

    // Logic to split name if only full name is provided
    if (!firstName && fullName) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length >= 3) {
        firstName = parts[0];
        paternalLastName = parts[1];
        maternalLastName = parts.slice(2).join(' ');
      } else if (parts.length === 2) {
        firstName = parts[0];
        paternalLastName = parts[1];
      } else {
        firstName = parts[0];
        paternalLastName = 'X';
      }
    }

    const email = body.email || `${firstName?.toLowerCase()}.${paternalLastName?.toLowerCase()}@example.com`;
    const phone = body.phone || body.phoneNumber || '0000000000';
    const birthDateStr = body.birthDate || body.dateOfBirth;
    const documentId = body.documentId || body.documentId || `DOC-${Date.now()}`;
    const alias = body.alias || null;
    const companyId = body.companyId && body.companyId.trim() !== '' ? body.companyId : null;

    // Mapear género
    let gender: Gender = Gender.MASCULINO;
    const gInput = (body.gender || 'M').toUpperCase();
    if (gInput.startsWith('F')) gender = Gender.FEMENINO;
    if (gInput === 'OTRO' || gInput === 'O') gender = Gender.OTRO;

    // Validations
    if (!firstName || !paternalLastName) {
      return NextResponse.json(
        { error: 'El nombre y apellido paterno son requeridos' },
        { status: 400 }
      );
    }

    if (!birthDateStr) {
      return NextResponse.json(
        { error: 'La fecha de nacimiento es requerida' },
        { status: 400 }
      );
    }

    // Generate the UNIQUE AMI-ID
    const birthDate = new Date(birthDateStr);
    const uniqueId = await generateWorkerId({
      tenantId,
      firstName,
      paternalLastName,
      maternalLastName,
      birthDate,
      gender: gender === Gender.FEMENINO ? 'FEMALE' : 'MALE'
    });

    // Check if patient with same documentId exists
    const existing = await prisma.patient.findFirst({
      where: {
        tenantId,
        OR: [
          { documentId },
          { uniqueId }
        ]
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un paciente con este documento (${documentId}) o ID (${uniqueId})` },
        { status: 409 }
      );
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        tenantId,
        name: body.name || `${firstName} ${paternalLastName} ${maternalLastName || ''}`.trim(),
        firstName,
        paternalLastName,
        maternalLastName,
        alias,
        email,
        phone,
        birthDate,
        gender,
        documentId,
        uniqueId,
        companyId,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('[POST /api/patients]', error);
    return NextResponse.json(
      { error: 'Failed to create patient: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
