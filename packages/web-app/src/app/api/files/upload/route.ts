import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, generateDownloadUrl, initializeStorage } from '@ami/core-storage';

// Asegurarse de que storage está inicializado
function ensureStorageInit() {
  try {
    initializeStorage({
      projectId: process.env.GCP_PROJECT_ID || '',
      bucketName: process.env.GCP_STORAGE_BUCKET || '',
      credentials: process.env.GCP_CREDENTIALS
        ? JSON.parse(process.env.GCP_CREDENTIALS)
        : undefined,
      keyFilename: process.env.GCP_KEY_FILENAME,
    });
  } catch (error) {
    // Si ya está inicializado, ignorar error
    if (!String(error).includes('ya está inicializado')) {
      console.error('Error initializing storage:', error);
    }
  }
}

/**
 * POST /api/files/upload
 * Carga un archivo a GCS y retorna la URL firmada
 */
export async function POST(request: NextRequest) {
  try {
    // Validar que el usuario esté autenticado
    const authToken = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!authToken) {
      // Para desarrollo, permitir sin token, pero idealmente debería validarse
      console.warn('[POST /api/files/upload] No auth token provided');
    }

    // Inicializar storage
    ensureStorageInit();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tenantId = (formData.get('tenantId') as string) || '550e8400-e29b-41d4-a716-446655440000';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}` },
        { status: 400 }
      );
    }

    // Validar tamaño (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max: 50MB, Got: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      );
    }

    // Convertir File a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Crear ruta de archivo con estructura: uploads/{tenantId}/{timestamp}-{fileName}
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `uploads/${tenantId}/${timestamp}-${safeFileName}`;

    // Subir a GCS
    const uploadResult = await uploadFile(buffer, {
      fileName: filePath,
      mimeType: file.type,
      metadata: {
        tenantId,
        uploadedBy: 'api',
        originalName: file.name,
      },
    });

    // Generar URL firmada con expiración de 7 días
    const signedUrl = await generateDownloadUrl(filePath, {
      expirationHours: 7 * 24, // 7 days
    });

    console.log(`[POST /api/files/upload] File uploaded successfully:`, {
      fileName: file.name,
      filePath,
      size: file.size,
      tenantId,
      publicUrl: uploadResult.publicUrl,
    });

    return NextResponse.json(
      {
        success: true,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath,
        },
        url: signedUrl, // Retornar URL firmada
        publicUrl: uploadResult.publicUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[POST /api/files/upload] Error:', errorMessage, error);

    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
