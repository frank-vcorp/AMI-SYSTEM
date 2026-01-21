/**
 * @impl IMPL-20260121-A1
 * @ref context/Plan-Demo-RD-20260121.md
 * GET /api/doctors/[id] - Get doctor
 * PUT /api/doctors/[id] - Update doctor
 * DELETE /api/doctors/[id] - Delete doctor
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDoctor, updateDoctor, deleteDoctor } from '@ami/core-database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const doctor = await getDoctor(id);

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(doctor, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const doctor = await updateDoctor({
      id,
      ...body,
    });

    return NextResponse.json(doctor, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await deleteDoctor(id);

    return NextResponse.json(
      { message: 'Doctor deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
