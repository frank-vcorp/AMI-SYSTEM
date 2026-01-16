/**
 * POST /api/expedientes/[id]/studies
 * Upload medical studies (integrates with core-storage)
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const studyType = formData.get("studyType") as string;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (!studyType) {
      return NextResponse.json(
        { error: "Study type is required" },
        { status: 400 }
      );
    }

    // Validate file
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, JPEG, PNG" },
        { status: 400 }
      );
    }

    const maxSizeBytes = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // TODO: In production:
    // 1. Call GCP Storage (via core-storage) to upload file
    // 2. Get signed URL
    // 3. Save record to Prisma StudyUpload
    // For now, return mock response

    const mockStudyId = `study_${Date.now()}`;
    const mockFileUrl = `https://storage.example.com/studies/${mockStudyId}/${file.name}`;

    return NextResponse.json(
      {
        id: mockStudyId,
        expedientId: id,
        type: studyType,
        fileName: file.name,
        fileUrl: mockFileUrl,
        mimeType: file.type,
        fileSizeBytes: file.size,
        status: "COMPLETED",
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
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

/**
 * GET /api/expedientes/[id]/studies
 * List studies for expedient
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: In production, query Prisma for studies
    // For now, return mock data

    const mockStudies = [
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
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      data: mockStudies,
      total: mockStudies.length,
    });
  } catch (error) {
    console.error("Error fetching studies:", error);
    return NextResponse.json(
      { error: "Failed to fetch studies" },
      { status: 500 }
    );
  }
}
