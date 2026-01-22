/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-02
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * API Routes para Médicos de Clínica
 * GET  /api/clinicas/[id]/doctors - Listar médicos de la clínica
 * POST /api/clinicas/[id]/doctors - Asignar médico a clínica
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildTenantFilter } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clinicId } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || '550e8400-e29b-41d4-a716-446655440000';

    // Verify clinic exists
    const clinic = await prisma.clinic.findFirst({
      where: { id: clinicId, ...buildTenantFilter(tenantId) },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Get doctors
    const doctors = await prisma.doctor.findMany({
      where: {
        clinicId,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      clinicId,
      clinicName: clinic.name,
      doctors,
      total: doctors.length,
    });
  } catch (error) {
    console.error('[GET /api/clinicas/[id]/doctors]', error);
    return NextResponse.json(
      { error: 'Failed to get clinic doctors' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clinicId } = await params;
    const body = await request.json();
    const tenantId = body.tenantId || '550e8400-e29b-41d4-a716-446655440000';
    const { name, cedula, specialty, signature } = body;

    if (!name || !cedula || !specialty) {
      return NextResponse.json(
        { error: 'name, cedula, and specialty are required' },
        { status: 400 }
      );
    }

    // Verify clinic exists
    const clinic = await prisma.clinic.findFirst({
      where: { id: clinicId, ...buildTenantFilter(tenantId) },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Check for duplicate cedula
    const existingDoctor = await prisma.doctor.findFirst({
      where: { ...buildTenantFilter(tenantId), cedula },
    });

    if (existingDoctor) {
      return NextResponse.json(
        { error: 'Doctor with this cedula already exists' },
        { status: 409 }
      );
    }

    // Create doctor
    const doctor = await prisma.doctor.create({
      data: {
        tenantId,
        clinicId,
        name,
        cedula,
        specialty,
        signature: signature ? { dataUrl: signature, timestamp: new Date().toISOString() } : undefined,
      },
    });

    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    console.error('[POST /api/clinicas/[id]/doctors]', error);
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
}
