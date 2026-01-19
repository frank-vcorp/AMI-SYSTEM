/**
 * ExpedientService
 * Business logic for medical records management
 */

import {
  CreatePatientDTO,
  CreateMedicalExamDTO,
  ExpedientDTO,
} from "../types/index";

import {
  validateEmail,
  validatePhone,
  validateDocumentId,
  validateVitalSigns,
} from "../utils/validators";

/**
 * Mock database layer - in production, this would use Prisma directly
 */
export class ExpedientService {
  /**
   * Create a new patient
   */
  static validateCreatePatient(data: CreatePatientDTO): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    if (!validateEmail(data.email)) {
      errors.push("Invalid email format");
    }

    if (!validatePhone(data.phone)) {
      errors.push("Invalid phone format");
    }

    if (!validateDocumentId(data.documentId)) {
      errors.push("Invalid document ID format");
    }

    try {
      new Date(data.birthDate);
    } catch {
      errors.push("Invalid birth date format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate medical exam data
   */
  static validateMedicalExam(data: CreateMedicalExamDTO): {
    isValid: boolean;
    errors: string[];
  } {
    const { isValid, errors } = validateVitalSigns(
      data.bloodPressure,
      data.heartRate,
      data.respiratoryRate,
      data.temperature,
      data.weight,
      data.height
    );

    return { isValid, errors };
  }

  /**
   * Validate expedient status transition
   */
  static canTransitionStatus(
    currentStatus: string,
    newStatus: string
  ): { isValid: boolean; reason?: string } {
    const validTransitions: Record<string, string[]> = {
      DRAFT: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "DRAFT"],
      COMPLETED: ["SIGNED"],
      SIGNED: ["DELIVERED"],
      DELIVERED: [],
    };

    const allowed = validTransitions[currentStatus] || [];

    if (allowed.includes(newStatus)) {
      return { isValid: true };
    }

    return {
      isValid: false,
      reason: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  /**
   * Calculate expedient progress
   */
  static calculateExpedientProgress(expedient: ExpedientDTO): number {
    let progress = 0;
    const maxSteps = 4;

    // Check if has medical exam
    if (expedient.medicalExams && expedient.medicalExams.length > 0) {
      progress += 1;
    }

    // Check if has studies
    if (expedient.studies && expedient.studies.length > 0) {
      progress += 1;
    }

    // Check status
    if (expedient.status === "COMPLETED") {
      progress += 1;
    }

    if (expedient.status === "SIGNED") {
      progress += 1;
    }

    return Math.round((progress / maxSteps) * 100);
  }

  /**
   * Format blood pressure for display
   */
  static formatBloodPressure(
    bloodPressure?: string
  ): { systolic: number; diastolic: number } | null {
    if (!bloodPressure) return null;

    const [sys, dia] = bloodPressure.split("/").map(Number);
    return { systolic: sys, diastolic: dia };
  }
}
