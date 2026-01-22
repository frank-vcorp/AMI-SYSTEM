/**
 * @fileoverview Servicio de Extracción con IA para AMI-SYSTEM
 * @module core/ai/extraction
 * 
 * Basado en el LECTOR legacy de RD-AMI
 * @see context/LEGACY_IMPORT/ami-rd/context/02_Contexto_Tecnico/Demos funcionales/RD/LECTOR/
 * 
 * @fix IMPL-20260122-02
 * Integración de IA para extracción de datos de documentos médicos
 */

import OpenAI from 'openai';

// ============================================================================
// TIPOS
// ============================================================================

export type StudyType = 
  | 'BIOMETRIA_HEMATICA'
  | 'QUIMICA_SANGUINEA'
  | 'EXAMEN_ORINA'
  | 'AUDIOMETRIA'
  | 'ESPIROMETRIA'
  | 'ELECTROCARDIOGRAMA'
  | 'CAMPIMETRIA'
  | 'RIESGO_CARDIOVASCULAR'
  | 'RADIOGRAFIA'
  | 'TOXICOLOGICO'
  | 'EXAMEN_MEDICO'
  | 'DESCONOCIDO';

export interface ExtractionResult {
  success: boolean;
  studyType: StudyType;
  rawText?: string;
  matrixData: Record<string, string>;
  interpretation: string;
  hints: Record<string, string>;
  confidence: number; // 0-100
  processingTimeMs: number;
  error?: string;
}

export interface ExtractionOptions {
  forceStudyType?: StudyType;
  includeRawText?: boolean;
  maxTokens?: number;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const OPENAI_MODEL = 'gpt-4o-mini';

// ============================================================================
// DETECTOR DE TIPO DE ESTUDIO
// ============================================================================

export function detectStudyType(text: string): StudyType {
  const t = text.toLowerCase();
  
  if (/(biometria hematica|biometría hemática)/.test(t)) return 'BIOMETRIA_HEMATICA';
  if (/(quimica sanguinea|química sanguínea)/.test(t)) return 'QUIMICA_SANGUINEA';
  if (/(examen general de orina|uroanalisis|uroanálisis)/.test(t)) return 'EXAMEN_ORINA';
  if (/(audiometr[ií]a)/.test(t)) return 'AUDIOMETRIA';
  if (/(espirometr[ií]a)/.test(t)) return 'ESPIROMETRIA';
  if (/(electrocardiograma|ecg)/.test(t)) return 'ELECTROCARDIOGRAMA';
  if (/(campimetr[ií]a|examen visual)/.test(t)) return 'CAMPIMETRIA';
  if (/(riesgo cardiovascular)/.test(t)) return 'RIESGO_CARDIOVASCULAR';
  if (/(rayos x|radiograf[ií]a|rx\s|columna|torax|tórax)/.test(t)) return 'RADIOGRAFIA';
  if (/(toxicolog[ií]co|antidoping|5 elementos|drogas)/.test(t)) return 'TOXICOLOGICO';
  if (/(examen medico|examen médico|historia cl[ií]nica)/.test(t)) return 'EXAMEN_MEDICO';
  
  return 'DESCONOCIDO';
}

// ============================================================================
// EXTRACCIÓN DE PISTAS (PRE-PROCESAMIENTO)
// ============================================================================

type HintExtractor = (text: string) => string | null | undefined;

const labHeaderExtractors: Record<string, HintExtractor> = {
  nombre: (text) => text.match(/Paciente\s*([A-ZÁÉÍÓÚÑ ,]+)/i)?.[1],
  empresa: (text) => text.match(/Empresa\s*([A-ZÁÉÍÓÚÑ ]+)/i)?.[1],
  fecha: (text) => text.match(/Fecha de registro\s*([0-9\-]+)/i)?.[1],
  edad: (text) => {
    const match = text.match(/Edad\s*([0-9]+\s*A,\s*[0-9]+\s*M,\s*[0-9]+\s*D)/i)?.[1];
    if (match) return match;
    const dobMatch = text.match(/F\. de nacimiento\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i)?.[1];
    if (dobMatch) {
      const dob = new Date(dobMatch);
      const ageDifMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970) + ' Años';
    }
    return null;
  }
};

const EXTRACTION_MAPS: Record<string, Record<string, HintExtractor>> = {
  BIOMETRIA_HEMATICA: labHeaderExtractors,
  QUIMICA_SANGUINEA: labHeaderExtractors,
  EXAMEN_ORINA: labHeaderExtractors,
  ESPIROMETRIA: {
    nombre: (text) => text.match(/Nombre:\s*([A-ZÁÉÍÓÚÑ ]+)/i)?.[1],
    empresa: (text) => text.match(/Procedencia:\s*([A-ZÁÉÍÓÚÑ ]+)/i)?.[1],
    fecha: (text) => text.match(/Fecha:\s*([0-9\-]+)/i)?.[1],
    edad: (text) => text.match(/Edad\(a\):\s*([0-9]+)/i)?.[1]
  },
  AUDIOMETRIA: {
    nombre: (text) => text.match(/\b([A-ZÁÉÍÓÚÑ]+,\s[A-ZÁÉÍÓÚÑ]+\s[A-ZÁÉÍÓÚÑ]+)\b/i)?.[1],
    empresa: (text) => text.match(/(AMI)\s+NVO ING/i)?.[1],
    fecha: (text) => text.match(/Fecha de la acción:\s*([0-9\/]+)/i)?.[1],
    edad: (text) => {
      const dobMatch = text.match(/Fecha de Nacimiento:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i)?.[1];
      if (dobMatch) {
        const parts = dobMatch.split('/');
        if (parts.length !== 3) return null;
        const dob = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        const studyDateMatch = text.match(/Fecha de la acción:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i)?.[1];
        const studyDateParts = studyDateMatch ? studyDateMatch.split('/') : null;
        if (!studyDateParts || studyDateParts.length !== 3) return null;
        const studyDate = new Date(+studyDateParts[2], +studyDateParts[1] - 1, +studyDateParts[0]);
        let age = studyDate.getFullYear() - dob.getFullYear();
        const m = studyDate.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && studyDate.getDate() < dob.getDate())) {
          age--;
        }
        return age + ' Años';
      }
      return null;
    }
  },
  CAMPIMETRIA: {
    nombre: (text) => text.match(/NOMBRE:\s*([A-ZÁÉÍÓÚÑ ]+)/i)?.[1],
    empresa: (text) => text.match(/EMPRESA:\s*([A-ZÁÉÍÓÚÑ ]+)/i)?.[1],
    fecha: (text) => text.match(/FECHA:\s*([0-9\/]+)/i)?.[1],
    edad: (text) => text.match(/EDAD:\s*([0-9]+\s*AÑOS)/i)?.[1]
  },
  ELECTROCARDIOGRAMA: {
    nombre: (text) => text.match(/Paciente:\s*(.+?)\s*Sexo:/i)?.[1],
    empresa: (text) => text.match(/Empresa:\s*(.+?)\s*Tipo de Estudio/i)?.[1],
    edad: (text) => text.match(/Edad:\s*([0-9]+)/i)?.[1]
  },
  RIESGO_CARDIOVASCULAR: {
    nombre: (text) => text.match(/Nombre paciente:\s*(.*?)\s*Empresa:/i)?.[1],
    fecha: (text) => text.match(/a,\s*([0-9]+\s*de\s*[a-z]+\s*de\s*[0-9]{4})/i)?.[1],
    edad: (text) => text.match(/Edad\s+([0-9.]+)/i)?.[1]
  }
};

function extractHints(text: string, studyType: StudyType): Record<string, string> {
  const map = EXTRACTION_MAPS[studyType];
  if (!map) return {};

  const hints: Record<string, string> = {};
  for (const key in map) {
    try {
      const result = map[key](text);
      if (result) {
        hints[key] = String(result).trim().replace(/\s+/g, ' ');
      }
    } catch {
      // Ignorar errores de extracción de hints
    }
  }
  return hints;
}

// ============================================================================
// PROMPTS
// ============================================================================

function buildSystemPrompt(studyType: StudyType, hints: Record<string, string>): string {
  const hintLines = Object.entries(hints)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k.toUpperCase()}: ${v}`)
    .join('\n') || '(sin pistas detectadas)';

  return `Eres un asistente clínico de extracción para salud ocupacional en México.
Tu tarea es extraer datos estructurados de documentos médicos.

TIPO DE ESTUDIO DETECTADO: ${studyType}

PISTAS DETECTADAS AUTOMÁTICAMENTE:
${hintLines}

INSTRUCCIONES:
1. Busca explícitamente: NOMBRE, EMPRESA, EDAD, FECHA, y todos los valores clínicos relevantes
2. Si hay pistas detectadas, úsalas como referencia pero verifica contra el texto
3. Devuelve SOLO TEXTO PLANO con el formato especificado
4. No inventes datos; si algo no aparece, omítelo
5. Usa unidades correctas (mg/dL, %, etc.) cuando apliquen
6. Incluye valores de referencia si están disponibles

FORMATO DE SALIDA OBLIGATORIO:

MATRIZ DE DATOS:
- Campo: Valor [Referencia] (si aplica)
- Campo: Valor
...

INTERPRETACION:
- Redacta 2-4 líneas resumiendo los hallazgos clínicamente relevantes
- Menciona valores fuera de rango si los hay
- NO des diagnósticos, solo describe hallazgos

CONFIANZA: [número del 0 al 100]%`;
}

const RADIOGRAFIA_PROMPT = `Eres un asistente de apoyo radiológico para descripción técnica NO DIAGNÓSTICA.

INSTRUCCIONES:
1. Describe técnicamente la imagen (proyección, calidad, artefactos)
2. Identifica estructuras visibles
3. PROHIBIDO dar diagnósticos clínicos
4. Requiere interpretación por radiólogo certificado

FORMATO DE SALIDA:

MATRIZ DE DATOS:
- Proyección: (AP/Lateral/Oblicua)
- Región Anatómica: (Columna, Tórax, etc.)
- Calidad de Imagen: (Adecuada/Subóptima)
- Artefactos: (Presencia/Ausencia, descripción)
- Dispositivos Visibles: (si aplica)

INTERPRETACION:
- Descripción técnica de 2-4 líneas
- SIN DIAGNÓSTICO CLÍNICO

CONFIANZA: [número del 0 al 100]%`;

// ============================================================================
// PARSEO DE RESPUESTA
// ============================================================================

function parseAIResponse(response: string): {
  matrixData: Record<string, string>;
  interpretation: string;
  confidence: number;
} {
  const matrixData: Record<string, string> = {};
  let interpretation = '';
  let confidence = 70; // Default

  // Extraer MATRIZ DE DATOS
  const matrixMatch = response.match(/MATRIZ DE DATOS:([\s\S]*?)(?=INTERPRETACION:|$)/i);
  if (matrixMatch) {
    const lines = matrixMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    for (const line of lines) {
      const match = line.match(/-\s*([^:]+):\s*(.+)/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (key && value) {
          matrixData[key] = value;
        }
      }
    }
  }

  // Extraer INTERPRETACION
  const interpMatch = response.match(/INTERPRETACION:([\s\S]*?)(?=CONFIANZA:|$)/i);
  if (interpMatch) {
    interpretation = interpMatch[1]
      .split('\n')
      .map(l => l.replace(/^-\s*/, '').trim())
      .filter(l => l)
      .join(' ');
  }

  // Extraer CONFIANZA
  const confMatch = response.match(/CONFIANZA:\s*(\d+)/i);
  if (confMatch) {
    confidence = Math.min(100, Math.max(0, parseInt(confMatch[1], 10)));
  }

  return { matrixData, interpretation, confidence };
}

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

export class AIExtractionService {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY no configurada');
    }
    this.openai = new OpenAI({ apiKey: key });
  }

  /**
   * Extrae datos estructurados de texto de un documento médico
   */
  async extractFromText(
    text: string,
    options: ExtractionOptions = {}
  ): Promise<ExtractionResult> {
    const startTime = Date.now();

    try {
      // Detectar tipo de estudio
      const studyType = options.forceStudyType || detectStudyType(text);

      // Extraer hints
      const hints = extractHints(text, studyType);

      // Construir prompt
      const systemPrompt = buildSystemPrompt(studyType, hints);

      // Llamar a OpenAI
      const completion = await this.openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `TEXTO DEL DOCUMENTO:\n\n${text.slice(0, 100000)}` }
        ],
        temperature: 0,
        max_tokens: options.maxTokens || 2000
      });

      const responseText = completion.choices[0]?.message?.content || '';
      const parsed = parseAIResponse(responseText);

      return {
        success: true,
        studyType,
        rawText: options.includeRawText ? text : undefined,
        matrixData: parsed.matrixData,
        interpretation: parsed.interpretation,
        hints,
        confidence: parsed.confidence,
        processingTimeMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        studyType: 'DESCONOCIDO',
        matrixData: {},
        interpretation: '',
        hints: {},
        confidence: 0,
        processingTimeMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Extrae datos de una imagen (radiografía, etc.)
   * Usa visión de GPT-4
   */
  async extractFromImage(
    imageBase64: string,
    mimeType: string = 'image/jpeg'
  ): Promise<ExtractionResult> {
    const startTime = Date.now();

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: RADIOGRAFIA_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analiza esta radiografía con descripción técnica NO DIAGNÓSTICA:' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0,
        max_tokens: 1500
      });

      const responseText = completion.choices[0]?.message?.content || '';
      const parsed = parseAIResponse(responseText);

      return {
        success: true,
        studyType: 'RADIOGRAFIA',
        matrixData: parsed.matrixData,
        interpretation: parsed.interpretation,
        hints: {},
        confidence: parsed.confidence,
        processingTimeMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        studyType: 'RADIOGRAFIA',
        matrixData: {},
        interpretation: '',
        hints: {},
        confidence: 0,
        processingTimeMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Singleton para uso global
let _instance: AIExtractionService | null = null;

export function getAIExtractionService(): AIExtractionService {
  if (!_instance) {
    _instance = new AIExtractionService();
  }
  return _instance;
}

export default AIExtractionService;
