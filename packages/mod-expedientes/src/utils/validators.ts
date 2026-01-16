/**
 * Validators for MOD-EXPEDIENTES
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Simple international phone validation - at least 10 digits
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateDocumentId = (documentId: string): boolean => {
  // At least 5 characters, alphanumeric + dashes
  return /^[a-zA-Z0-9\-]{5,}$/.test(documentId);
};

export const validateVitalSigns = (
  bloodPressure?: string,
  heartRate?: number,
  respiratoryRate?: number,
  temperature?: number,
  weight?: number,
  height?: number
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (bloodPressure) {
    // Format: "SYS/DIA" e.g., "120/80"
    const bpRegex = /^\d{1,3}\/\d{1,3}$/;
    if (!bpRegex.test(bloodPressure)) {
      errors.push("Invalid blood pressure format. Use SYS/DIA (e.g., 120/80)");
    } else {
      const [sys, dia] = bloodPressure.split("/").map(Number);
      if (sys < 0 || sys > 300 || dia < 0 || dia > 300) {
        errors.push("Blood pressure values out of reasonable range (0-300)");
      }
      if (sys <= dia) {
        errors.push("Systolic pressure should be higher than diastolic");
      }
    }
  }

  if (heartRate !== undefined) {
    if (heartRate < 30 || heartRate > 200) {
      errors.push("Heart rate out of range (30-200 bpm)");
    }
  }

  if (respiratoryRate !== undefined) {
    if (respiratoryRate < 10 || respiratoryRate > 60) {
      errors.push("Respiratory rate out of range (10-60 bpm)");
    }
  }

  if (temperature !== undefined) {
    if (temperature < 35 || temperature > 42) {
      errors.push("Temperature out of range (35-42 °C)");
    }
  }

  if (weight !== undefined) {
    if (weight < 20 || weight > 300) {
      errors.push("Weight out of range (20-300 kg)");
    }
  }

  if (height !== undefined) {
    if (height < 100 || height > 250) {
      errors.push("Height out of range (100-250 cm)");
    }
  }

  return { isValid: errors.length === 0, errors };
};

export const validateFileUpload = (
  mimeType: string,
  fileSizeBytes: number
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const maxSizeBytes = 50 * 1024 * 1024; // 50MB
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

  if (!allowedMimeTypes.includes(mimeType)) {
    errors.push(
      "Invalid file type. Allowed: PDF, JPEG, PNG"
    );
  }

  if (fileSizeBytes > maxSizeBytes) {
    errors.push(`File size exceeds 50MB limit (${(fileSizeBytes / 1024 / 1024).toFixed(2)}MB)`);
  }

  return { isValid: errors.length === 0, errors };
};
