/**
 * IMPL-20260122-01: POST /api/validaciones/[id]/generate-pdf
 * Generate and store PDF for completed validation
 * @ref context/infraestructura/Detalle-Specs/SPEC-MOD-VALIDACIONES.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PdfGenerationService } from '@ami/core-validation';

const prisma = new PrismaClient();

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const validationTaskId = params.id;

    // Load complete validation context
    const validationTask = await prisma.validationTask.findUnique({
      where: { id: validationTaskId },
      include: {
        expedient: {
          include: {
            patient: true,
            clinic: true,
            medicalExams: true,
            studies: {
              include: {
                extractedData: true as any,
              } as any,
            },
          },
        },
        medicalExam: {
          include: {
            examinedByDoctor: true,
            extractedData: true as any,
          } as any,
        },
        extractedData: true as any,
      } as any,
    }) as any;

    if (!validationTask) {
      return NextResponse.json({ error: 'Validation task not found' }, { status: 404 });
    }

    if (!validationTask.signedAt || !validationTask.verdict) {
      return NextResponse.json(
        { error: 'Cannot generate PDF: validation not yet signed or verdict missing' },
        { status: 400 }
      );
    }

    // Prepare PDF generation request
    const extractedFindings = validationTask.extractedData.map((data: any) => ({
      field: data.dataType,
      value: data.normalizedValue || data.rawValue || '',
      unit: data.unit,
      referenceRange: data.referenceMin && data.referenceMax ? `${data.referenceMin}-${data.referenceMax}` : undefined,
      severity: data.severity,
    }));

    const pdfRequest = {
      validationTaskId,
      expedientId: validationTask.expedientId,
      patientName: validationTask.expedient.patient.name,
      clinicName: validationTask.expedient.clinic.name,
      medicalExamData: {
        vitalSigns: validationTask.medicalExam.vitalSigns || {},
        visualAcuity: validationTask.medicalExam.visualAcuity || {},
        physicalExamination: validationTask.medicalExam.physicalExamination || {},
      },
      extractedFindings,
      verdict: validationTask.verdict,
      diagnosis: validationTask.diagnosis || '',
      validatorName: '', // TODO: Load from user service
      validatorCedula: validationTask.medicalExam.examinedByDoctor?.cedula || '',
      signatureImage: validationTask.signatureData?.signatureImage,
      timestamp: validationTask.signedAt,
    };

    // Generate PDF
    const pdfResult = await PdfGenerationService.generateMedicalReportPdf(pdfRequest);

    if (pdfResult.status === 'FAILED') {
      return NextResponse.json(
        { error: `PDF generation failed: ${pdfResult.errorMessage}` },
        { status: 500 }
      );
    }

    // Store PDF metadata in database
    const pdfGeneration = await (prisma as any).pdfGeneration.create({
      data: {
        tenantId: validationTask.tenantId,
        validationTaskId,
        fileName: pdfResult.fileName,
        fileUrl: pdfResult.fileUrl,
        fileSizeBytes: pdfResult.fileSizeBytes,
        status: 'COMPLETED',
        generatedBy: validationTask.signedBy,
      },
    });

    return NextResponse.json({
      success: true,
      pdfGeneration: {
        id: pdfGeneration.id,
        fileName: pdfGeneration.fileName,
        fileUrl: pdfGeneration.fileUrl,
        generatedAt: pdfGeneration.generatedAt,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
