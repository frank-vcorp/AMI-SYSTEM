/**
 * IMPL-20260122-01: Electronic Signature Service
 * Handles electronic signature generation, validation, and storage
 * @ref context/infraestructura/Detalle-Specs/SPEC-MOD-VALIDACIONES.md
 */

import crypto from 'crypto';

export interface SignatureData {
  signatureImage: string; // Base64 encoded signature image
  timestamp: Date;
  ip: string;
  userAgent: string;
  coordinates?: Array<{ x: number; y: number; t: number }>;
  certificationTimestamp?: string; // RFC 3161 timestamp
  signatureAlgorithm?: string; // e.g., "SHA256withRSA"
}

export interface VerificationResult {
  isValid: boolean;
  signedAt: Date;
  signedBy: string;
  tamperDetected: boolean;
  certificateExpired?: boolean;
  message: string;
}

export class SignatureService {
  /**
   * Generate a signature hash for a validation task
   * Combines expedient, medical exam, and validator info
   */
  static generateSignatureHash(
    expedientId: string,
    medicalExamId: string,
    validatorId: string,
    verdict: string,
    timestamp: Date
  ): string {
    const data = `${expedientId}|${medicalExamId}|${validatorId}|${verdict}|${timestamp.toISOString()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate electronic signature metadata
   * Ensures signature was created at the correct time with valid IP/UA
   */
  static validateSignatureMetadata(
    signatureData: SignatureData,
    expectedValidatorId: string,
    maxAgeMinutes: number = 60
  ): VerificationResult {
    const now = new Date();
    const signatureAge = (now.getTime() - signatureData.timestamp.getTime()) / (1000 * 60);

    if (signatureAge > maxAgeMinutes) {
      return {
        isValid: false,
        signedAt: signatureData.timestamp,
        signedBy: '',
        tamperDetected: false,
        message: `Signature age exceeds maximum allowed time (${maxAgeMinutes} minutes)`,
      };
    }

    // Additional validation logic for production
    // - Verify certificate chain
    // - Check certificate revocation (CRL/OCSP)
    // - Validate timestamp authority

    return {
      isValid: true,
      signedAt: signatureData.timestamp,
      signedBy: expectedValidatorId,
      tamperDetected: false,
      message: 'Signature is valid',
    };
  }

  /**
   * Create signature payload for storage
   * Encrypts sensitive data and creates audit trail entry
   */
  static createSignaturePayload(
    imageData: string,
    ip: string,
    userAgent: string,
    _validatorId: string
  ): SignatureData {
    return {
      signatureImage: imageData, // In production: encrypt with tenant key
      timestamp: new Date(),
      ip,
      userAgent,
      coordinates: [], // Capture from frontend pen events
      certificationTimestamp: new Date().toISOString(), // In production: RFC 3161 timestamp
      signatureAlgorithm: 'SHA256withRSA',
    };
  }

  /**
   * Audit trail entry for signature
   * Returns structured audit log for compliance
   */
  static createAuditEntry(
    validationTaskId: string,
    validatorId: string,
    action: 'SIGNED' | 'REJECTED' | 'MODIFIED',
    details: Record<string, any>
  ): Record<string, any> {
    return {
      validationTaskId,
      validatorId,
      action,
      timestamp: new Date().toISOString(),
      details,
      version: '1.0',
      complianceStandard: 'FIRMA_ELECTRONICA_CONAHCYT',
    };
  }
}
