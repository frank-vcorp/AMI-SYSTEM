/**
 * @impl IMPL-20260121-A1
 * @ref context/Plan-Demo-RD-20260121.md
 * GET /api/doctors - List doctors
 * POST /api/doctors - Create doctor
 */

import { NextRequest, NextResponse } from 'next/server';
import { listDoctors, createDoctor } from '@ami/core-database';

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

    const doctors = await listDoctors(tenantId, clinicId || undefined);

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
    const body = await request.json();
    const { tenantId, name, cedula, specialty, clinicId } = body;

    if (!tenantId || !name || !cedula || !specialty || !clinicId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const doctor = await createDoctor({
      tenantId,
      name,
      cedula,
      specialty,
      clinicId,
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
