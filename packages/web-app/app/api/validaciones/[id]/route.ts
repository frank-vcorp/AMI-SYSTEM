/**
 * IMPL-20260122-01: GET/PUT /api/validaciones/[id]
 * Retrieve and update validation task details
 * @ref context/infraestructura/Detalle-Specs/SPEC-MOD-VALIDACIONES.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ValidationTaskService } from '@ami/core-validation';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const validationTaskId = params.id;

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
        pdfGeneration: true,
      } as any,
    }) as any;

    if (!validationTask) {
      return NextResponse.json({ error: 'Validation task not found' }, { status: 404 });
    }

    // Perform pre-validation checks
    const preChecks = await ValidationTaskService.performPreValidationChecks(
      validationTask.id,
      validationTask.expedientId,
      validationTask.medicalExamId
    );

    // Get verdict recommendation
    const extractedFindings = validationTask.extractedData.reduce(
      (acc: Record<string, any>, data: any) => {
        acc[data.dataType] = {
          value: data.normalizedValue,
          severity: data.severity,
        };
        return acc;
      },
      {} as Record<string, any>
    );

    const verdictRec = await ValidationTaskService.generateVerdictRecommendation(
      validationTask.medicalExamId,
      extractedFindings
    );

    return NextResponse.json({
      success: true,
      validationTask: {
        ...validationTask,
        preValidationChecks: preChecks,
        verdictRecommendation: verdictRec,
      },
    });
  } catch (error) {
    console.error('Error fetching validation task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/validaciones/[id]
 * Update validation task (verdict, diagnosis, signature)
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const validationTaskId = params.id;
    const body = await request.json();
    const { verdict, diagnosis, restrictions, _referralSpecialty, signatureData, ipAddress, userAgent } = body;

    // Validate verdict if provided
    const validVerdicts = ['APTO', 'APTO_CON_RESTRICCIONES', 'NO_APTO', 'PENDIENTE', 'REFERENCIA'];
    if (verdict && !validVerdicts.includes(verdict)) {
      return NextResponse.json(
        { error: `Invalid verdict. Must be one of: ${validVerdicts.join(', ')}` },
        { status: 400 }
      );
    }

    // Update validation task
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (verdict) updateData.verdict = verdict;
    if (diagnosis) updateData.diagnosis = diagnosis;
    if (restrictions) updateData.prediagnosis = JSON.stringify(restrictions);

    // Handle signature (mark as completed if signature provided)
    if (signatureData) {
      updateData.signatureData = signatureData;
      updateData.signedAt = new Date();
      updateData.signedBy = body.validatorId;
      updateData.status = 'COMPLETED';
    }

    const updatedTask = await (prisma as any).validationTask.update({
      where: { id: validationTaskId },
      data: updateData,
      include: {
        expedient: {
          include: {
            medicalExams: true,
            patient: true,
          },
        },
        medicalExam: true,
        extractedData: true as any,
      } as any,
    }) as any;

    // TODO: If status is COMPLETED, trigger:
    // 1. PDF generation
    // 2. Update Expedient to COMPLETED
    // 3. Send notifications
    // 4. Create audit entry

    return NextResponse.json({
      success: true,
      validationTask: updatedTask,
    });
  } catch (error) {
    console.error('Error updating validation task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
