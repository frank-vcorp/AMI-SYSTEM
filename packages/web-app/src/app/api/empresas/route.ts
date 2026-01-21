/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Empresas (Company)
 * GET  /api/empresas - Listar empresas con filtros
 * POST /api/empresas - Crear empresa
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
    const city = searchParams.get('city');

    // Build where clause - omit tenantId filter if not a valid UUID
    const where: any = { ...buildTenantFilter(tenantId) };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { rfc: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    // Fetch companies with pagination
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: { 
              jobProfiles: true,
              batteries: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      data: companies,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[GET /api/empresas]', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
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
      createdBy 
    } = body;

    // Validations
    if (!name || !rfc) {
      return NextResponse.json(
        { error: 'name and rfc are required' },
        { status: 400 }
      );
    }

    // Validate RFC format (Mexican tax ID)
    const rfcRegex = /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/i;
    if (!rfcRegex.test(rfc)) {
      return NextResponse.json(
        { error: 'Invalid RFC format' },
        { status: 400 }
      );
    }

    // Check if company with same RFC exists (RFC is globally unique)
    const existingRfc = await prisma.company.findUnique({
      where: { rfc },
    });

    if (existingRfc) {
      return NextResponse.json(
        { error: 'Company with this RFC already exists' },
        { status: 409 }
      );
    }

    // Check if company with same name exists in tenant
    const existingName = await prisma.company.findFirst({
      where: { tenantId, name },
    });

    if (existingName) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      );
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        tenantId,
        name,
        rfc: rfc.toUpperCase(),
        description: description || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        phoneNumber: phoneNumber || null,
        email: email || null,
        contactPerson: contactPerson || null,
        contactPhone: contactPhone || null,
        maxEmployees: maxEmployees || 100,
        status: 'ACTIVE',
        createdBy: createdBy || null,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('[POST /api/empresas]', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
