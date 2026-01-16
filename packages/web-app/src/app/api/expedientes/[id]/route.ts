/**
 * GET /api/expedientes/[id]
 * Get expedient details with all relations
 *
 * PATCH /api/expedientes/[id]
 * Update expedient status and notes
 * 
 * Allowed transitions: DRAFT → IN_PROGRESS → COMPLETED → SIGNED → DELIVERED
 *
 * DELETE /api/expedientes/[id]
 * Soft delete expedient
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ami/core-database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const expedient = await prisma.expedient.findUnique({
      where: { id },
      include: {
        patient: true,
        clinic: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
        medicalExams: {
          orderBy: { examinedAt: "desc" },
        },
        studies: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: expedient.id,
      patientId: expedient.patientId,
      clinicId: expedient.clinicId,
      companyId: expedient.companyId,
      status: expedient.status,
      notes: expedient.notes,
      patient: expedient.patient,
      clinic: expedient.clinic,
      medicalExams: expedient.medicalExams.map((exam) => ({
        id: exam.id,
        bloodPressure: exam.bloodPressure,
        heartRate: exam.heartRate,
        respiratoryRate: exam.respiratoryRate,
        temperature: exam.temperature,
        weight: exam.weight,
        height: exam.height,
        physicalExam: exam.physicalExam,
        notes: exam.notes,
        examinedAt: exam.examinedAt.toISOString(),
        createdAt: exam.createdAt.toISOString(),
      })),
      studies: expedient.studies.map((study) => ({
        id: study.id,
        type: study.type,
        fileName: study.fileName,
        fileUrl: study.fileUrl,
        mimeType: study.mimeType,
        fileSizeBytes: study.fileSizeBytes,
        status: study.status,
        uploadedAt: study.uploadedAt.toISOString(),
      })),
      createdAt: expedient.createdAt.toISOString(),
      updatedAt: expedient.updatedAt.toISOString(),
    });
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

    // Fetch current expedient
    const expedient = await prisma.expedient.findUnique({
      where: { id },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    // Validate status transition if provided
    if (status) {
      const validStatuses = ["DRAFT", "IN_PROGRESS", "COMPLETED", "SIGNED", "DELIVERED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }

      // Validate state machine transition
      const statusOrder: Record<string, number> = {
        DRAFT: 0,
        IN_PROGRESS: 1,
        COMPLETED: 2,
        SIGNED: 3,
        DELIVERED: 4,
      };

      const currentOrder = statusOrder[expedient.status];
      const newOrder = statusOrder[status];

      if (newOrder < currentOrder) {
        return NextResponse.json(
          { error: `Cannot transition from ${expedient.status} to ${status}` },
          { status: 400 }
        );
      }
    }

    // Update expedient
    const updated = await prisma.expedient.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      notes: updated.notes,
      updatedAt: updated.updatedAt.toISOString(),
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

    const expedient = await prisma.expedient.findUnique({
      where: { id },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    // Delete expedient (cascade deletes medical exams and studies)
    await prisma.expedient.delete({
      where: { id },
    });

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
