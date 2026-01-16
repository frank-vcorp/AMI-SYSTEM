/**
 * GET /api/expedientes/[id]
 * Get expedient details
 *
 * PATCH /api/expedientes/[id]
 * Update expedient
 *
 * DELETE /api/expedientes/[id]
 * Delete expedient
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: In production, query Prisma by ID
    // For now, return mock data

    const mockExpedient = {
      id,
      patientId: "patient_1",
      clinicId: "clinic_1",
      companyId: "company_1",
      status: "IN_PROGRESS",
      notes: "Expedient for regular health check",
      patient: {
        id: "patient_1",
        name: "Juan Pérez García",
        email: "juan@example.com",
        phone: "+55 11 99999-9999",
        birthDate: "1980-05-15",
        gender: "MASCULINO",
        documentId: "123456789",
        status: "ACTIVE",
      },
      medicalExams: [
        {
          id: "exam_1",
          expedientId: id,
          bloodPressure: "120/80",
          heartRate: 72,
          temperature: 37.0,
          weight: 75.5,
          height: 175,
          physicalExam: "Normal findings",
          examinedAt: new Date().toISOString(),
        },
      ],
      studies: [
        {
          id: "study_1",
          expedientId: id,
          type: "RADIOGRAPHY",
          fileName: "chest_xray.pdf",
          fileUrl: "https://storage.example.com/studies/chest_xray.pdf",
          mimeType: "application/pdf",
          fileSizeBytes: 2048000,
          status: "COMPLETED",
          uploadedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockExpedient);
  } catch (error) {
    console.error("Error fetching expedient:", error);
    return NextResponse.json(
      { error: "Failed to fetch expedient" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // TODO: In production, update Prisma
    // For now, return mock response

    return NextResponse.json({
      id,
      status: status || "IN_PROGRESS",
      notes: notes || "",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating expedient:", error);
    return NextResponse.json(
      { error: "Failed to update expedient" },
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

    // TODO: In production, soft delete in Prisma
    // For now, return mock response

    return NextResponse.json({
      id,
      deleted: true,
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error deleting expedient:", error);
    return NextResponse.json(
      { error: "Failed to delete expedient" },
      { status: 500 }
    );
  }
}
