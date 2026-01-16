/**
 * @ami/core-signatures
 * Digital signature engine for medical reports
 *
 * Main entry point exporting public API
 */

export {
  // Signing engine
  SigningEngine,
  createSigningEngine,
} from "./signing-engine";

export { PDFManager } from "./pdf-manager";

export { CertificateUtils } from "./certificate-utils";

// Re-export all types
export type {
  SignatureConfig,
  SignatureMetadata,
  SignedDocument,
  SignatureField,
  SignatureInfo,
  ValidationResult,
  SigningEngineOptions,
} from "./types";

export type { CertificateGenerationOptions } from "./certificate-utils";
