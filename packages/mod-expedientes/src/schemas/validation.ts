/**
 * Validation schemas for MOD-EXPEDIENTES components
 * Zod schemas for type-safe form validation
 */

import { z } from "zod";

/**
 * Schema para crear expediente
 */
export const createExpedientSchema = z
  .object({
    appointmentId: z.string().min(1, "Appointment is required"),
    patientId: z.string().min(1, "Patient is required"),
    notes: z.string().optional(),
  })
  .strict();

export type CreateExpedientInput = z.infer<typeof createExpedientSchema>;

/**
 * Schema para agregar examen médico
 */
export const medicalExamSchema = z.object({
  bloodPressure: z
    .string()
    .regex(/^\d{1,3}\/\d{1,3}$/, "Format: SYS/DIA (e.g., 120/80)")
    .optional()
    .or(z.literal("")),
  heartRate: z.coerce.number().min(40).max(200).optional().or(z.literal("")),
  respiratoryRate: z.coerce.number().min(4).max(60).optional().or(z.literal("")),
  temperature: z.coerce.number().min(35).max(42).optional().or(z.literal("")),
  weight: z.coerce.number().min(2).max(300).optional().or(z.literal("")),
  height: z.coerce.number().min(50).max(250).optional().or(z.literal("")),
  physicalExam: z.string().optional(),
  notes: z.string().optional(),
});

export type MedicalExamInput = z.infer<typeof medicalExamSchema>;

/**
 * Schema para estudios
 */
export const studyUploadSchema = z.object({
  studyType: z.enum(["RADIOGRAFIA", "LABORATORIO", "ECG", "ESPIROMETRIA", "AUDIOMETRIA", "OTROS"], {
    errorMap: () => ({ message: "Invalid study type" }),
  }),
  file: typeof window !== "undefined" 
    ? z.instanceof(File).refine((file) => file.size <= 50 * 1024 * 1024, "File size must be < 50MB")
    : z.any(),
});

export type StudyUploadInput = z.infer<typeof studyUploadSchema>;
