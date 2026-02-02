/**
 * POST /api/expedientes/[id]/studies
 * Upload medical study file
 * 
 * FormData:
 * - file: File (PDF, JPEG, PNG; max 50MB)
 * - studyType: StudyType enum (RADIOGRAFIA|LABORATORIO|ECG|ESPIROMETRIA|AUDIOMETRIA|OTROS)
 * 
 * TODO: Integrate with @ami/core-storage for GCP Storage upload
 * Currently generates fileKey for storage path
 * 
 * Side effect: Changes expedient status to IN_PROGRESS if it was DRAFT
 *
 * GET /api/expedientes/[id]/studies
 * List studies for expedient
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth";

// MVP Demo tenant ID
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const VALID_STUDY_TYPES = [
  "RADIOGRAFIA",
  "LABORATORIO",
  "ECG",
  "ESPIROMETRIA",
  "AUDIOMETRIA",
  "OTROS",
];

const STUDY_TYPE_MAP: Record<string, string> = {
  "RADIOGRAFIA": "RADIOGRAPHY",
  "LABORATORIO": "LABORATORY",
  "ECG": "CARDIOGRAM",
  "ESPIROMETRIA": "OTHER", // Map to OTHER if no direct match or update enums
  "AUDIOMETRIA": "OTHER",
  "OTROS": "OTHER",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantIdFromRequest(request) || DEFAULT_TENANT_ID;
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

    // === VERIFY EXPEDIENT EXISTS & BELONGS TO TENANT ===
    const expedient = await prisma.expedient.findFirst({
      where: { id, tenantId },
      select: { id: true, status: true, tenantId: true },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expedient not found" },
        { status: 404 }
      );
    }

    // === UPLOAD FILE & CREATE STUDY RECORD ===
    // Generate fileKey for storage path (tenant-isolated)
    const fileKey = `${expedient.tenantId}/studies/${id}/${Date.now()}-${file.name}`;

    // Create study record with Prisma transaction
    const study = await prisma.$transaction(async (tx: any) => {
      // Create study
      const newStudy = await tx.studyUpload.create({
        data: {
          expedientId: id,
          fileUrl: fileKey,
          fileName: file.name,
          type: (STUDY_TYPE_MAP[studyType] || "OTHER") as any,
          fileSizeBytes: file.size,
          mimeType: file.type,
          status: "UPLOADED", // Pendiente procesamiento por IA
        },
      });

      // Update expedient status to STUDIES_UPLOADED
      if (expedient.status === "EXAM_COMPLETED" || expedient.status === "AWAITING_STUDIES") {
        await tx.expedient.update({
          where: { id },
          data: { status: "STUDIES_UPLOADED" },
        });
      }

      return newStudy;
    });

    return NextResponse.json(study, { status: 201 });
  } catch (error: any) {
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
    const tenantId = await getTenantIdFromRequest(request) || DEFAULT_TENANT_ID;
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // === VERIFY EXPEDIENT EXISTS & BELONGS TO TENANT ===
    const expedient = await prisma.expedient.findFirst({
      where: { id, tenantId },
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
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.studyUpload.count({ where: { expedientId: id } }),
    ]);

    return NextResponse.json({
      data: studies.map((study: any) => ({
        id: study.id,
        expedientId: study.expedientId,
        studyType: study.type,
        fileName: study.fileName,
        fileKey: study.fileUrl,
        mimeType: study.mimeType,
        fileSize: study.fileSizeBytes,
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
