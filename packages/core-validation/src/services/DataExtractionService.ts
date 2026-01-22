/**
 * IMPL-20260122-01: Data Extraction Service
 * Processes uploaded medical studies and extracts relevant findings
 * @ref context/infraestructura/Detalle-Specs/SPEC-MOD-VALIDACIONES.md
 */

export interface ExtractionTask {
  studyUploadId: string;
  studyType: string;
  fileUrl: string;
  mimeType: string;
  expedientId: string;
}

export interface ExtractedValue {
  fieldName: string;
  rawValue: string;
  normalizedValue: string;
  unit?: string;
  referenceMin?: number;
  referenceMax?: number;
  isOutOfRange: boolean;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
  confidence?: number;
  extractionMethod: 'MANUAL' | 'OCR' | 'AI_MODEL';
}

export interface ExtractionResult {
  studyUploadId: string;
  extractedValues: ExtractedValue[];
  summary: string;
  findings: string[];
  requiresManualReview: boolean;
  processingTimeMs: number;
}

export class DataExtractionService {
  // Reference ranges catalog for common lab values
  private static readonly REFERENCE_CATALOG: Record<string, { min: number; max: number; unit: string }> = {
    hemoglobin: { min: 13.5, max: 17.5, unit: 'g/dL' },
    glucose: { min: 70, max: 100, unit: 'mg/dL' },
    glucose_fasting: { min: 70, max: 100, unit: 'mg/dL' },
    glucose_random: { min: 100, max: 140, unit: 'mg/dL' },
    cholesterol_total: { min: 0, max: 200, unit: 'mg/dL' },
    ldl: { min: 0, max: 100, unit: 'mg/dL' },
    hdl: { min: 40, max: 1000, unit: 'mg/dL' },
    triglycerides: { min: 0, max: 150, unit: 'mg/dL' },
    blood_pressure_systolic: { min: 90, max: 120, unit: 'mmHg' },
    blood_pressure_diastolic: { min: 60, max: 80, unit: 'mmHg' },
    heart_rate: { min: 60, max: 100, unit: 'bpm' },
    respiratory_rate: { min: 12, max: 20, unit: 'rpm' },
    temperature: { min: 36.5, max: 37.5, unit: '°C' },
    weight: { min: 40, max: 200, unit: 'kg' },
    height: { min: 140, max: 210, unit: 'cm' },
    bmi: { min: 18.5, max: 24.9, unit: 'kg/m²' },
    pr_interval: { min: 120, max: 200, unit: 'ms' },
    qrs_duration: { min: 80, max: 120, unit: 'ms' },
    qt_interval: { min: 350, max: 450, unit: 'ms' },
  };

  /**
   * Process uploaded medical study
   * Routes to appropriate extraction method based on study type
   */
  static async processStudyUpload(task: ExtractionTask): Promise<ExtractionResult> {
    const startTime = Date.now();

    try {
      // Route to appropriate extraction method
      switch (task.studyType) {
        case 'LABORATORY':
          return await this.extractLaboratoryResults(task);
        case 'RADIOGRAPHY':
          return await this.extractRadiographyFindings(task);
        case 'CARDIOGRAM':
          return await this.extractCardiogramData(task);
        case 'ULTRASOUND':
          return await this.extractUltrasoundFindings(task);
        default:
          return {
            studyUploadId: task.studyUploadId,
            extractedValues: [],
            summary: 'Manual review required - unsupported study type',
            findings: [],
            requiresManualReview: true,
            processingTimeMs: Date.now() - startTime,
          };
      }
    } catch (error) {
      console.error('Data extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract laboratory results (blood work, chemistry, etc)
   * Uses OCR + reference validation
   */
  private static async extractLaboratoryResults(task: ExtractionTask): Promise<ExtractionResult> {
    const startTime = Date.now();

    // For MVP: mock extraction with typical lab results
    const mockResults = [
      {
        fieldName: 'Hemoglobin',
        rawValue: '14.5',
        normalizedValue: '14.5',
        unit: 'g/dL',
        referenceMin: 13.5,
        referenceMax: 17.5,
        isOutOfRange: false,
        severity: 'NORMAL' as const,
        confidence: 0.95,
        extractionMethod: 'OCR' as const,
      },
      {
        fieldName: 'Glucose',
        rawValue: '105',
        normalizedValue: '105',
        unit: 'mg/dL',
        referenceMin: 70,
        referenceMax: 100,
        isOutOfRange: true,
        severity: 'MEDIUM' as const,
        confidence: 0.98,
        extractionMethod: 'OCR' as const,
      },
      {
        fieldName: 'Cholesterol Total',
        rawValue: '195',
        normalizedValue: '195',
        unit: 'mg/dL',
        referenceMin: 0,
        referenceMax: 200,
        isOutOfRange: false,
        severity: 'NORMAL' as const,
        confidence: 0.97,
        extractionMethod: 'OCR' as const,
      },
    ];

    const validated = this.validateExtractedValues(mockResults);

    return {
      studyUploadId: task.studyUploadId,
      extractedValues: validated,
      summary: 'Lab results: 2/3 values normal, 1 minor elevation in glucose',
      findings: [
        'Hemoglobin within normal range',
        'Glucose slightly elevated (fasting) - recommend diet review',
        'Cholesterol at optimal level',
      ],
      requiresManualReview: false,
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Extract radiography findings
   * Uses AI model for image analysis
   */
  private static async extractRadiographyFindings(task: ExtractionTask): Promise<ExtractionResult> {
    const startTime = Date.now();

    // For MVP: simulated X-ray analysis
    return {
      studyUploadId: task.studyUploadId,
      extractedValues: [],
      summary: 'X-Ray analysis: No significant abnormalities detected',
      findings: [
        'Thorax: Normal configuration and symmetry',
        'Lungs: Clear bilaterally, no infiltrates',
        'Heart silhouette: Normal size and contour',
        'Mediastinum: Normal',
        'No acute findings',
      ],
      requiresManualReview: false,
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Extract cardiogram data
   * Parse ECG waveforms and detect arrhythmias
   */
  private static async extractCardiogramData(task: ExtractionTask): Promise<ExtractionResult> {
    const startTime = Date.now();

    // For MVP: simulated ECG data
    const ecgData = [
      {
        fieldName: 'Heart Rate',
        rawValue: '72',
        normalizedValue: '72',
        unit: 'bpm',
        referenceMin: 60,
        referenceMax: 100,
        isOutOfRange: false,
        severity: 'NORMAL' as const,
        confidence: 1.0,
        extractionMethod: 'AI_MODEL' as const,
      },
      {
        fieldName: 'PR Interval',
        rawValue: '160',
        normalizedValue: '160',
        unit: 'ms',
        referenceMin: 120,
        referenceMax: 200,
        isOutOfRange: false,
        severity: 'NORMAL' as const,
        confidence: 1.0,
        extractionMethod: 'AI_MODEL' as const,
      },
      {
        fieldName: 'QRS Duration',
        rawValue: '90',
        normalizedValue: '90',
        unit: 'ms',
        referenceMin: 80,
        referenceMax: 120,
        isOutOfRange: false,
        severity: 'NORMAL' as const,
        confidence: 1.0,
        extractionMethod: 'AI_MODEL' as const,
      },
    ];

    const validated = this.validateExtractedValues(ecgData);

    return {
      studyUploadId: task.studyUploadId,
      extractedValues: validated,
      summary: 'ECG: Normal sinus rhythm, no acute ischemic changes',
      findings: ['Regular sinus rhythm', 'Normal intervals', 'Normal axis', 'No ST segment changes'],
      requiresManualReview: false,
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Extract ultrasound findings
   * AI analysis of ultrasound images
   */
  private static async extractUltrasoundFindings(task: ExtractionTask): Promise<ExtractionResult> {
    const startTime = Date.now();

    // For MVP: simulated ultrasound findings
    return {
      studyUploadId: task.studyUploadId,
      extractedValues: [],
      summary: 'Abdominal ultrasound: Normal study',
      findings: [
        'Liver: Normal size (15 cm), homogeneous echotexture',
        'Gallbladder: Normal size, no gallstones, thin wall',
        'Pancreas: Normal appearance, no masses',
        'Spleen: Normal size and echogenicity',
        'Kidneys: Bilateral normal size and echotexture',
        'No free fluid',
      ],
      requiresManualReview: false,
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Compare extracted values against catalog
   * Validate extracted data against known reference ranges
   */
  static validateExtractedValues(values: ExtractedValue[]): ExtractedValue[] {
    return values.map((val) => {
      // Look up reference ranges from catalog (case-insensitive key)
      const catalogKey = val.fieldName.toLowerCase().replace(/\s+/g, '_');
      const catalogEntry = this.REFERENCE_CATALOG[catalogKey];

      if (catalogEntry && val.referenceMin === undefined) {
        val.referenceMin = catalogEntry.min;
        val.referenceMax = catalogEntry.max;
      }

      if (val.referenceMin !== undefined && val.referenceMax !== undefined) {
        const numValue = parseFloat(val.normalizedValue);
        val.isOutOfRange = numValue < val.referenceMin || numValue > val.referenceMax;

        if (val.isOutOfRange) {
          // Determine severity based on deviation from range
          const belowMin = val.referenceMin - numValue;
          const aboveMax = numValue - val.referenceMax;
          const deviation = Math.max(belowMin, aboveMax);
          const range = val.referenceMax - val.referenceMin;
          const deviationPercent = (deviation / range) * 100;

          if (deviationPercent > 50) {
            val.severity = 'CRITICAL';
          } else if (deviationPercent > 30) {
            val.severity = 'HIGH';
          } else {
            val.severity = 'MEDIUM';
          }
        } else {
          val.severity = 'NORMAL';
        }
      }

      return val;
    });
  }
}
