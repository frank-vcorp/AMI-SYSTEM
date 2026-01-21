/**
 * @impl IMPL-20260121-PROD
 * @route GET|POST /api/doctors
 * @description CRUD para médicos (lista y creación)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface DoctorRequest {
  name: string;
  cedula: string;
  specialty: string;
  clinicId: string;
  tenantId: string;
  signatureCanvas?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId');
    const clinicId = searchParams.get('clinicId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const where: any = {
      clinic: {
        tenantId,
      },
    };

    if (clinicId) {
      where.clinicId = clinicId;
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        clinic: true,
      },
    });

    return NextResponse.json(doctors, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: DoctorRequest = await request.json();
    const { tenantId, name, cedula, specialty, clinicId, signatureCanvas } = body;

    if (!tenantId || !name || !cedula || !specialty || !clinicId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic || clinic.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        cedula,
        clinicId,
      },
    });

    if (existingDoctor) {
      return NextResponse.json(
        { error: 'Doctor with this cedula already exists in clinic' },
        { status: 409 }
      );
    }

    const doctor = await prisma.doctor.create({
      data: {
        name,
        cedula,
        specialty,
        clinicId,
        tenantId,
        signature: signatureCanvas
          ? { data: signatureCanvas, timestamp: new Date().toISOString() }
          : undefined,
      },
      include: {
        clinic: true,
      },
    });

    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
