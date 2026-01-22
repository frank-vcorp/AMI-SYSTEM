/**
 * @fileoverview API Route para extracción de datos con IA
 * @route POST /api/ai/extract
 * 
 * @fix IMPL-20260122-02
 * Endpoint para extraer datos estructurados de documentos médicos usando IA
 * 
 * @example POST /api/ai/extract
 * Body: { text: "contenido del PDF", studyType?: "BIOMETRIA_HEMATICA" }
 * 
 * @example POST /api/ai/extract/image
 * Body: { imageBase64: "...", mimeType: "image/jpeg" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIExtractionService, StudyType } from '@ami/core';

// Inicializar servicio (lazy)
let aiService: AIExtractionService | null = null;

function getService(): AIExtractionService {
  if (!aiService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY no configurada en variables de entorno');
    }
    aiService = new AIExtractionService(apiKey);
  }
  return aiService;
}

/**
 * POST /api/ai/extract
 * Extrae datos estructurados de texto de documento médico
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada
    if (!body.text && !body.imageBase64) {
      return NextResponse.json(
        { error: 'Se requiere "text" o "imageBase64" en el body' },
        { status: 400 }
      );
    }

    const service = getService();

    // Procesar según tipo de entrada
    if (body.imageBase64) {
      // Extracción de imagen (radiografía)
      const result = await service.extractFromImage(
        body.imageBase64,
        body.mimeType || 'image/jpeg'
      );

      return NextResponse.json({
        success: result.success,
        data: {
          studyType: result.studyType,
          matrixData: result.matrixData,
          interpretation: result.interpretation,
          confidence: result.confidence,
          processingTimeMs: result.processingTimeMs
        },
        error: result.error
      });
    } else {
      // Extracción de texto (PDF)
      const result = await service.extractFromText(body.text, {
        forceStudyType: body.studyType as StudyType | undefined,
        includeRawText: body.includeRawText === true,
        maxTokens: body.maxTokens
      });

      return NextResponse.json({
        success: result.success,
        data: {
          studyType: result.studyType,
          matrixData: result.matrixData,
          interpretation: result.interpretation,
          hints: result.hints,
          confidence: result.confidence,
          processingTimeMs: result.processingTimeMs,
          rawText: result.rawText
        },
        error: result.error
      });
    }
  } catch (error) {
    console.error('[AI Extract Error]', error);
    
    // Manejar error de API key no configurada
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Servicio de IA no configurado. Contacte al administrador.',
          code: 'AI_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/extract
 * Información sobre el endpoint
 */
export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    service: 'AMI AI Extraction Service',
    version: '1.0.0',
    status: hasApiKey ? 'configured' : 'not_configured',
    endpoints: {
      'POST /api/ai/extract': {
        description: 'Extrae datos de texto o imagen',
        body: {
          text: 'string (contenido del documento)',
          studyType: 'string? (tipo de estudio forzado)',
          imageBase64: 'string? (imagen en base64 para radiografías)',
          mimeType: 'string? (tipo MIME de imagen, default: image/jpeg)'
        }
      }
    },
    supportedStudyTypes: [
      'BIOMETRIA_HEMATICA',
      'QUIMICA_SANGUINEA',
      'EXAMEN_ORINA',
      'AUDIOMETRIA',
      'ESPIROMETRIA',
      'ELECTROCARDIOGRAMA',
      'CAMPIMETRIA',
      'RIESGO_CARDIOVASCULAR',
      'RADIOGRAFIA',
      'TOXICOLOGICO',
      'EXAMEN_MEDICO'
    ]
  });
}
