/**
 * @ami/core-signatures - Type definitions
 * Digital signature and validation types for medical documents
 */

/**
 * Configuration for the signing engine
 * Includes paths to certificate and private key
 */
export interface SignatureConfig {
  /**
   * Path to private key file (PEM format)
   * @example "./certs/private.pem"
   */
  keyPath: string;

  /**
   * Path to certificate file (PEM format, X.509)
   * @example "./certs/cert.pem"
   */
  certPath: string;

  /**
   * Password for encrypted private key (optional)
   * If not provided, key must be unencrypted
   */
  password?: string;

  /**
   * Certificate type: "self-signed" or "official"
   * Used for metadata and validation rules
   * @default "self-signed"
   */
  certType?: "self-signed" | "official";

  /**
   * Digest algorithm for signature
   * @default "sha256"
   */
  digestAlgorithm?: "sha256" | "sha384" | "sha512";
}

/**
 * Metadata about who is signing and when
 */
export interface SignatureMetadata {
  /**
   * Full name of the signer (medical professional)
   * @example "Dr. Juan Carlos Pérez"
   */
  signerName: string;

  /**
   * ID number (cédula) of the signer
   * @example "8-123-456789"
   */
  signerId: string;

  /**
   * Professional role
   * @example "Médico Especialista", "Clínico", "Radiologist"
   */
  signerRole: string;

  /**
   * License/registration number if applicable
   * @example "MED-2024-123456"
   */
  licenseNumber?: string;

  /**
   * Timestamp of signature (ISO 8601)
   * If not provided, will use current timestamp
   */
  timestamp?: Date | string;

  /**
   * Additional signature reason/purpose
   * @example "Autorización de estudios complementarios"
   */
  reason?: string;

  /**
   * Signature field location on page
   * Page 0-indexed
   */
  pageNumber?: number;
}

/**
 * Result of PDF signing operation
 */
export interface SignedDocument {
  /**
   * Signed PDF as Buffer
   */
  pdfBuffer: Buffer;

  /**
   * Signature verification hash
   */
  signatureHash: string;

  /**
   * ISO timestamp when document was signed
   */
  signedAt: string;

  /**
   * Signer information
   */
  metadata: SignatureMetadata;

  /**
   * Whether signature is valid (for validation results)
   */
  isValid?: boolean;

  /**
   * Error message if validation failed
   */
  validationError?: string;
}

/**
 * Signature field definition for PDF
 */
export interface SignatureField {
  /**
   * Unique field name in PDF
   * @example "signature_1"
   */
  fieldName: string;

  /**
   * X coordinate (points)
   */
  x: number;

  /**
   * Y coordinate (points)
   */
  y: number;

  /**
   * Width of signature area (points)
   */
  width: number;

  /**
   * Height of signature area (points)
   */
  height: number;

  /**
   * Page index (0-based)
   */
  pageIndex: number;

  /**
   * Whether field is visible
   * @default true
   */
  visible?: boolean;
}

/**
 * Information extracted from signed PDF
 */
export interface SignatureInfo {
  /**
   * Whether PDF has at least one signature
   */
  isSigned: boolean;

  /**
   * Number of signatures in document
   */
  signatureCount: number;

  /**
   * Array of signature metadata if available
   */
  signatures: Array<{
    signerName: string;
    signerId: string;
    signerRole: string;
    timestamp: string;
    reason?: string;
    isValid: boolean;
  }>;

  /**
   * Signer certificate details if extractable
   */
  certificate?: {
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    fingerprint?: string;
  };
}

/**
 * Signature validation result
 */
export interface ValidationResult {
  /**
   * Overall validation result
   */
  isValid: boolean;

  /**
   * Detailed validation messages
   */
  errors: string[];

  /**
   * Warnings (non-fatal issues)
   */
  warnings: string[];

  /**
   * Signature information if found
   */
  signatureInfo?: SignatureInfo;

  /**
   * Certificate validation details
   */
  certificateValid?: boolean;

  /**
   * Certificate chain verification
   */
  chainValid?: boolean;
}

/**
 * Signing engine initialization options
 */
export interface SigningEngineOptions {
  /**
   * Configuration from environment or files
   */
  config: SignatureConfig;

  /**
   * Whether to validate certificate on init
   * @default true
   */
  validateOnInit?: boolean;

  /**
   * Cache signing configuration in memory
   * @default false (always reload from filesystem for security)
   */
  cacheConfig?: false;
}
