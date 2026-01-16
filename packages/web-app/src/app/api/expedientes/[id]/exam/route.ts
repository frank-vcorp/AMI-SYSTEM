/**
 * POST /api/expedientes/[id]/exam
 * Add medical exam to expedient
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      bloodPressure,
      heartRate,
      respiratoryRate,
      temperature,
      weight,
      height,
      physicalExam,
      notes,
    } = body;

    // TODO: In production, validate and save to Prisma
    // For now, return mock response

    const mockExamId = `exam_${Date.now()}`;

    return NextResponse.json(
      {
        id: mockExamId,
        expedientId: id,
        bloodPressure,
        heartRate,
        respiratoryRate,
        temperature,
        weight,
        height,
        physicalExam,
        notes,
        examinedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding medical exam:", error);
    return NextResponse.json(
      { error: "Failed to add medical exam" },
      { status: 500 }
    );
  }
}
