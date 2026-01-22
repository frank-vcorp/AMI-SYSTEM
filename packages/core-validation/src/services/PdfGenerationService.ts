/**
 * IMPL-20260122-01: PDF Generation Service
 * Handles medical report PDF generation with embedded signatures
 * @ref context/infraestructura/Detalle-Specs/SPEC-MOD-VALIDACIONES.md
 */

export interface PdfGenerationRequest {
  validationTaskId: string;
  expedientId: string;
  patientName: string;
  patientId: string;
  clinicName: string;
  clinicAddress?: string;
  medicalExamData: Record<string, any>;
  extractedFindings: Array<{
    field: string;
    value: string;
    unit?: string;
    referenceRange?: string;
    severity?: string;
  }>;
  verdict: string;
  diagnosis: string;
  restrictions?: string;
  validatorName: string;
  validatorCedula: string;
  signatureImage?: string;
  timestamp: Date;
}

export interface PdfGenerationResult {
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  generatedAt: Date;
  status: 'COMPLETED' | 'FAILED';
  errorMessage?: string;
}

export class PdfGenerationService {
  /**
   * Generate medical report PDF with HTML-to-PDF approach
   * Returns base64 encoded PDF for storage in Firebase/GCP
   */
  static async generateMedicalReportPdf(
    request: PdfGenerationRequest
  ): Promise<PdfGenerationResult> {
    try {
      // Generate HTML content
      const htmlContent = PdfGenerationService.buildMedicalReportHtml(request);

      // For MVP: encode as base64 (production uses pdfkit or headless Chrome)
      const pdfBuffer = Buffer.from(htmlContent);
      const base64Pdf = pdfBuffer.toString('base64');

      const fileName = `EXP-${request.expedientId}-${Date.now()}.pdf`;

      // In production: upload to GCS and get signed URL
      const fileUrl = `data:application/pdf;base64,${base64Pdf}`;

      return {
        fileUrl,
        fileName,
        fileSizeBytes: Buffer.byteLength(base64Pdf),
        generatedAt: new Date(),
        status: 'COMPLETED',
      };
    } catch (error) {
      return {
        fileUrl: '',
        fileName: '',
        fileSizeBytes: 0,
        generatedAt: new Date(),
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'PDF generation failed',
      };
    }
  }

  /**
   * Generate lightweight fitness certificate
   * Minimal document with verdict and signature only
   */
  static async generateFitnessCertificate(
    validationTaskId: string,
    patientName: string,
    verdict: string,
    validatorName: string,
    validatorCedula: string,
    signatureImage: string
  ): Promise<PdfGenerationResult> {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificado de Aptitud</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .content { margin: 30px 0; }
    .signature-block { margin-top: 50px; text-align: center; }
    .line { border-top: 1px solid #000; width: 200px; margin: 20px auto; }
    .footer { font-size: 10px; color: #666; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>CERTIFICADO DE APTITUD MÉDICA</h2>
    <p>ID: ${validationTaskId}</p>
  </div>
  <div class="content">
    <p><strong>Paciente:</strong> ${patientName}</p>
    <p><strong>Veredicto:</strong> ${verdict}</p>
    <p><strong>Validador:</strong> ${validatorName} (${validatorCedula})</p>
    <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-MX')}</p>
  </div>
  <div class="signature-block">
    ${signatureImage ? `<img src="${signatureImage}" alt="Firma" style="max-width: 200px;">` : '<div class="line"></div>'}
    <p><strong>${validatorName}</strong><br>${validatorCedula}</p>
  </div>
  <div class="footer">
    <p>Documento generado automáticamente por AMI-SYSTEM</p>
  </div>
</body>
</html>`;

      const pdfBuffer = Buffer.from(htmlContent);
      const base64Pdf = pdfBuffer.toString('base64');

      const fileName = `CERT-${validationTaskId}-${Date.now()}.pdf`;
      const fileUrl = `data:application/pdf;base64,${base64Pdf}`;

      return {
        fileUrl,
        fileName,
        fileSizeBytes: Buffer.byteLength(base64Pdf),
        generatedAt: new Date(),
        status: 'COMPLETED',
      };
    } catch (error) {
      return {
        fileUrl: '',
        fileName: '',
        fileSizeBytes: 0,
        generatedAt: new Date(),
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Certificate generation failed',
      };
    }
  }

  /**
   * Archive PDF to cold storage
   * Simulated for MVP (production: move to Nearline/Coldline)
   */
  static async archivePdfAfterRetention(
    fileUrl: string,
    retentionDays: number = 90
  ): Promise<boolean> {
    try {
      // In production:
      // - Check file age from metadata
      // - Copy to gs://ami-cold-storage/
      // - Delete from hot tier
      // - Update database pointer

      // MVP: just log the archival
      console.log(`Archiving PDF ${fileUrl} after ${retentionDays} days retention`);
      return true;
    } catch (error) {
      console.error('PDF archival failed:', error);
      return false;
    }
  }

  /**
   * Build HTML for medical report
   * Includes patient info, vital signs, findings, diagnosis, signature
   */
  private static buildMedicalReportHtml(request: PdfGenerationRequest): string {
    const findingsHtml = request.extractedFindings
      .map(
        (f) => `
      <tr>
        <td>${f.field}</td>
        <td>${f.value} ${f.unit || ''}</td>
        <td>${f.referenceRange || '-'}</td>
        <td style="color: ${f.severity === 'HIGH' ? 'red' : 'black'}">${f.severity || 'NORMAL'}</td>
      </tr>`
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte Médico - ${request.expedientId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
    .header { border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 20px; }
    .clinic-info { font-size: 14px; color: #666; }
    .section { margin-top: 30px; page-break-inside: avoid; }
    .section-title { background: #007bff; color: white; padding: 10px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    .verdict-box { background: #e8f5e9; border: 2px solid #4caf50; padding: 15px; margin: 20px 0; }
    .verdict { font-size: 18px; font-weight: bold; }
    .signature-section { margin-top: 50px; text-align: center; }
    .signature-img { max-width: 200px; margin: 20px 0; }
    .line { border-top: 1px solid #000; width: 250px; margin: 20px auto; }
  </style>
</head>
<body>
  <div class="header">
    <h2>${request.clinicName}</h2>
    <div class="clinic-info">
      ${request.clinicAddress ? `<p>${request.clinicAddress}</p>` : ''}
      <p>Folio: <strong>${request.expedientId}</strong></p>
      <p>Fecha: ${new Date(request.timestamp).toLocaleDateString('es-MX')} ${new Date(request.timestamp).toLocaleTimeString('es-MX')}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">DATOS DEL PACIENTE</div>
    <table>
      <tr><td><strong>Nombre:</strong></td><td>${request.patientName}</td></tr>
      <tr><td><strong>ID Paciente:</strong></td><td>${request.patientId}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">EXAMEN MÉDICO</div>
    <table>
      <tr><th>Parámetro</th><th>Valor</th><th>Rango Referencia</th><th>Estado</th></tr>
      ${findingsHtml}
    </table>
  </div>

  <div class="section">
    <div class="section-title">DIAGNÓSTICO Y VEREDICTO</div>
    <p><strong>Diagnóstico:</strong></p>
    <p>${request.diagnosis}</p>
    ${request.restrictions ? `<p><strong>Restricciones:</strong> ${request.restrictions}</p>` : ''}
    
    <div class="verdict-box">
      <div class="verdict">VEREDICTO: ${request.verdict}</div>
    </div>
  </div>

  <div class="signature-section">
    <p>Validado por:</p>
    ${request.signatureImage ? `<div class="signature-img"><img src="${request.signatureImage}" alt="Firma" style="max-width: 250px;"></div>` : '<div class="line"></div>'}
    <p><strong>${request.validatorName}</strong></p>
    <p>Cédula: ${request.validatorCedula}</p>
    <p><small>Documento generado automáticamente por AMI-SYSTEM</small></p>
  </div>
</body>
</html>`;
  }
}
