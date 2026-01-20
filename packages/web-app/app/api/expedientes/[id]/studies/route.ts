import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ami/core-database";
import { getTenantIdFromRequest } from "@/lib/auth";

/**
 * POST /api/expedientes/[id]/studies
 * 
 * Crear un nuevo estudio (archivo) para un expediente.
 * Soporta almacenamiento local (MVP) o Firebase Storage.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantIdFromRequest();
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener el expediente
    const expedient = await prisma.expedient.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    // Parsear FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const studyType = formData.get("studyType") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Para MVP: Guardar referencia y metadata localmente
    // TODO: Integrar con Firebase Storage para persistencia real
    const fileName = `${params.id}_${Date.now()}_${file.name}`;
    const fileKey = `expedientes/${params.id}/studies/${fileName}`;

    // Crear registro en BD
    const study = await prisma.study.create({
      data: {
        expedientId: params.id,
        studyType,
        fileKey, // Referencia a archivo
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        tenantId,
      },
    });

    return NextResponse.json({
      id: study.id,
      fileName: study.fileName,
      studyType: study.studyType,
      uploadedAt: study.createdAt,
      fileKey: study.fileKey,
    });
  } catch (error) {
    console.error("Error uploading study:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/expedientes/[id]/studies
 * 
 * Listar todos los estudios de un expediente
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantIdFromRequest();
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studies = await prisma.study.findMany({
      where: {
        expedientId: params.id,
        tenantId,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        studyType: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
        fileKey: true,
      },
    });

    return NextResponse.json({
      studies,
      count: studies.length,
    });
  } catch (error) {
    console.error("Error fetching studies:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
