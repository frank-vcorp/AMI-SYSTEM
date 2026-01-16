/**
 * @ami/core-signatures - Certificate Utilities
 * Helpers for certificate generation and validation
 */

import { execSync } from "child_process";
import { promises as fs } from "fs";
import { resolve } from "path";

/**
 * Certificate generation options
 */
export interface CertificateGenerationOptions {
  /**
   * Common name (usually full name)
   */
  commonName: string;

  /**
   * ID number (cédula, passport, etc.)
   */
  subject: string;

  /**
   * Organization name
   * @default "AMI-SYSTEM"
   */
  organization?: string;

  /**
   * Organization unit (role/department)
   */
  organizationUnit?: string;

  /**
   * Country code
   * @default "CR"
   */
  countryCode?: string;

  /**
   * State/Province
   * @default "San José"
   */
  state?: string;

  /**
   * City
   * @default "San José"
   */
  city?: string;

  /**
   * Validity in days
   * @default 365
   */
  validityDays?: number;

  /**
   * Key size in bits
   * @default 2048
   */
  keySize?: number;
}

/**
 * CertificateUtils - Handle certificate operations
 * For development, can generate self-signed certificates
 * For production, load official certificates from secure storage
 */
export class CertificateUtils {
  /**
   * Generate a self-signed certificate (DEV ONLY)
   * Uses OpenSSL via system command
   * @returns {keyPath, certPath} paths to generated files
   */
  static async generateSelfSignedCertificate(
    options: CertificateGenerationOptions,
    outputDir: string
  ): Promise<{ keyPath: string; certPath: string }> {
    const {
      commonName,
      subject,
      organization = "AMI-SYSTEM",
      organizationUnit = "Medical Department",
      countryCode = "CR",
      state = "San José",
      city = "San José",
      validityDays = 365,
      keySize = 2048,
    } = options;

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const keyPath = resolve(outputDir, "private.pem");
    const certPath = resolve(outputDir, "cert.pem");

    // OpenSSL command to generate self-signed certificate
    const subjectString = `/C=${countryCode}/ST=${state}/L=${city}/O=${organization}/OU=${organizationUnit}/CN=${commonName}/UID=${subject}`;

    try {
      // Generate private key and certificate in one command
      const command = `openssl req -x509 -newkey rsa:${keySize} -keyout "${keyPath}" -out "${certPath}" -days ${validityDays} -nodes -subj "${subjectString}"`;

      execSync(command, { stdio: "pipe" });

      // Verify files were created
      await fs.access(keyPath);
      await fs.access(certPath);

      return { keyPath, certPath };
    } catch (error) {
      throw new Error(
        `Failed to generate certificate: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validate certificate file format
   */
  static async validateCertificateFormat(certPath: string): Promise<boolean> {
    try {
      const cert = await fs.readFile(certPath, "utf-8");
      return (
        cert.includes("BEGIN CERTIFICATE") &&
        cert.includes("END CERTIFICATE")
      );
    } catch {
      return false;
    }
  }

  /**
   * Validate private key file format
   */
  static async validatePrivateKeyFormat(keyPath: string): Promise<boolean> {
    try {
      const key = await fs.readFile(keyPath, "utf-8");
      return (
        (key.includes("BEGIN PRIVATE KEY") ||
          key.includes("BEGIN RSA PRIVATE KEY")) &&
        (key.includes("END PRIVATE KEY") || key.includes("END RSA PRIVATE KEY"))
      );
    } catch {
      return false;
    }
  }

  /**
   * Extract certificate information (DEV utility)
   * Returns certificate details as text
   */
  static async getCertificateInfo(certPath: string): Promise<string> {
    try {
      const command = `openssl x509 -in "${certPath}" -text -noout`;
      return execSync(command, { encoding: "utf-8" });
    } catch (error) {
      throw new Error(
        `Failed to read certificate: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check certificate expiration (DEV utility)
   */
  static async getCertificateExpiration(certPath: string): Promise<Date> {
    try {
      const command = `openssl x509 -in "${certPath}" -noout -enddate`;
      const output = execSync(command, { encoding: "utf-8" });
      const dateStr = output.replace("notAfter=", "").trim();
      return new Date(dateStr);
    } catch (error) {
      throw new Error(
        `Failed to check expiration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Clean up certificate files (for testing)
   */
  static async removeCertificates(keyPath: string, certPath: string): Promise<void> {
    try {
      await fs.rm(keyPath, { force: true });
      await fs.rm(certPath, { force: true });
    } catch (error) {
      console.warn(
        `Warning: Could not remove certificate files: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
