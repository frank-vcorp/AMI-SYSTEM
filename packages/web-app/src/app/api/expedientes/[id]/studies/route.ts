/**
 * POST /api/expedientes/[id]/studies
 * Upload medical study file
 * 
 * FormData:
 * - file: File (PDF, JPEG, PNG; max 50MB)
 * - studyType: StudyType enum (RADIOGRAPHY|LABORATORY|CARDIOGRAM|ULTRASOUND|TOMOGRAPHY|RESONANCE|ENDOSCOPY|OTHER)
 * 
 * TODO: Integrate with @ami/core-storage for GCP Storage upload
 * Currently generates mock URLs for testing
 * 
 * Side effect: Changes expedient status to IN_PROGRESS if it was DRAFT
 *
 * GET /api/expedientes/[id]/studies
 * List studies for expedient
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ami/core-database";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const VALID_STUDY_TYPES = [
  "RADIOGRAPHY",
  "LABORATORY",
  "CARDIOGRAM",
  "ULTRASOUND",
  "TOMOGRAPHY",
  "RESONANCE",
  "ENDOSCOPY",
  "OTHER",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const studyType = formData.get("studyType") as string;

    // === VALIDATIONS ===
    if (!file) {
      return NextResponse.json(
        { error: "file is required" },
        { status: 400 }
      );
    }

    if (!studyType) {
      return NextResponse.json(
        { error: "studyType is required" },
        { status: 400 }
      );
    }

    if (!VALID_STUDY_TYPES.includes(studyType)) {
      return NextResponse.json(
        { error: `studyType must be one of: ${VALID_STUDY_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // === VERIFY EXPEDIENT EXISTS ===
    const expedient = await prisma.expedient.findUnique({
      where: { id },
      select: { id: true, status: true, tenantId: true },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    // === UPLOAD FILE & CREATE STUDY RECORD ===
    // TODO: Replace with actual GCP Storage upload
    // For now, generate mock URL based on file name
    const fileExtension = file.name.split(".").pop() || "bin";
    const mockFileUrl = `https://storage.googleapis.com/ami-system-mvp.appspot.com/${expedient.tenantId}/studies/${id}/${Date.now()}-${file.name}`;

    const result = await prisma.$transaction(async (tx) => {
      const newStudy = await tx.studyUpload.create({
        data: {
          expedientId: id,
          type: studyType as any,
          fileName: file.name,
          fileUrl: mockFileUrl,
          mimeType: file.type,
          fileSizeBytes: file.size,
          status: "COMPLETED", // TODO: Set to PENDING and process asynchronously
        },
      });

      // If expedient is in DRAFT, move to IN_PROGRESS
      if (expedient.status === "DRAFT") {
        await tx.expedient.update({
          where: { id },
          data: { status: "IN_PROGRESS" },
        });
      }

      return newStudy;
    });

    return NextResponse.json(
      {
        id: result.id,
        expedientId: result.expedientId,
        type: result.type,
        fileName: result.fileName,
        fileUrl: result.fileUrl,
        mimeType: result.mimeType,
        fileSizeBytes: result.fileSizeBytes,
        status: result.status,
        uploadedAt: result.uploadedAt.toISOString(),
        createdAt: result.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading study:", error);
    return NextResponse.json(
      { error: "Failed to upload study" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // === VERIFY EXPEDIENT EXISTS ===
    const expedient = await prisma.expedient.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    // === FETCH STUDIES ===
    const [studies, total] = await Promise.all([
      prisma.studyUpload.findMany({
        where: { expedientId: id },
        orderBy: { uploadedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.studyUpload.count({ where: { expedientId: id } }),
    ]);

    return NextResponse.json({
      data: studies.map((study) => ({
        id: study.id,
        expedientId: study.expedientId,
        type: study.type,
        fileName: study.fileName,
        fileUrl: study.fileUrl,
        mimeType: study.mimeType,
        fileSizeBytes: study.fileSizeBytes,
        status: study.status,
        uploadedAt: study.uploadedAt.toISOString(),
        createdAt: study.createdAt.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching studies:", error);
    return NextResponse.json(
      { error: "Failed to fetch studies" },
      { status: 500 }
    );
  }
}
