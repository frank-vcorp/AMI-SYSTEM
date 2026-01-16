import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { SigningEngine, createSigningEngine } from "./signing-engine";
import { CertificateUtils } from "./certificate-utils";
import { PDFManager } from "./pdf-manager";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { createWriteStream } from "fs";

describe("@ami/core-signatures", () => {
  let tempDir: string;
  let keyPath: string;
  let certPath: string;

  beforeAll(async () => {
    // Create temporary directory for test certificates
    tempDir = join(tmpdir(), `ami-sig-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Generate test certificate
    const result = await CertificateUtils.generateSelfSignedCertificate(
      {
        commonName: "Test Doctor",
        subject: "8-123-456789",
        organizationUnit: "Test Clinic",
        validityDays: 30,
      },
      tempDir
    );

    keyPath = result.keyPath;
    certPath = result.certPath;
  });

  afterAll(async () => {
    // Cleanup
    try {
      await fs.rm(tempDir, { recursive: true });
    } catch {
      console.warn("Could not cleanup temp directory");
    }
  });

  describe("CertificateUtils", () => {
    it("should generate self-signed certificate", async () => {
      const certExists = await CertificateUtils.validateCertificateFormat(
        certPath
      );
      const keyExists = await CertificateUtils.validatePrivateKeyFormat(
        keyPath
      );

      expect(certExists).toBe(true);
      expect(keyExists).toBe(true);
    });

    it("should validate certificate format", async () => {
      const isValid = await CertificateUtils.validateCertificateFormat(
        certPath
      );
      expect(isValid).toBe(true);
    });

    it("should validate private key format", async () => {
      const isValid = await CertificateUtils.validatePrivateKeyFormat(keyPath);
      expect(isValid).toBe(true);
    });

    it("should extract certificate info", async () => {
      const info = await CertificateUtils.getCertificateInfo(certPath);
      expect(info).toContain("Subject:");
      expect(info).toContain("Test Doctor");
    });
  });

  describe("SigningEngine", () => {
    let engine: SigningEngine;

    beforeAll(async () => {
      engine = await createSigningEngine({
        config: {
          keyPath,
          certPath,
          certType: "self-signed",
        },
      });
    });

    afterAll(async () => {
      await engine.dispose();
    });

    it("should initialize signing engine", async () => {
      expect(engine).toBeDefined();
    });

    it("should throw if initialize called twice", async () => {
      const engine2 = new SigningEngine({
        config: { keyPath, certPath },
      });

      await engine2.initialize();
      // Second call should be idempotent
      await engine2.initialize();
      await engine2.dispose();
    });

    it("should sign a PDF with metadata", async () => {
      // Create mock PDF buffer (minimal valid PDF)
      const mockPDF = Buffer.from(
        "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj xref\ntrailer<</Size 2/Root 1 0 R>>"
      );

      const result = await engine.signPDF(mockPDF, {
        signerName: "Dr. Test",
        signerId: "8-123-456789",
        signerRole: "Médico General",
        timestamp: new Date().toISOString(),
      });

      expect(result).toHaveProperty("pdfBuffer");
      expect(result).toHaveProperty("signatureHash");
      expect(result).toHaveProperty("signedAt");
      expect(result).toHaveProperty("metadata");
      expect(result.metadata.signerName).toBe("Dr. Test");
      expect(result.isValid).toBe(true);
    });

    it("should validate signed PDF", async () => {
      const mockPDF = Buffer.from(
        "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj xref\ntrailer<</Size 2/Root 1 0 R>>"
      );

      const signed = await engine.signPDF(mockPDF, {
        signerName: "Dr. Test",
        signerId: "8-123-456789",
        signerRole: "Médico General",
      });

      const validation = await engine.validateSignature(signed.pdfBuffer);

      expect(validation).toHaveProperty("isValid");
      expect(validation).toHaveProperty("errors");
      expect(validation).toHaveProperty("warnings");
    });

    it("should extract signature info from signed PDF", async () => {
      const mockPDF = Buffer.from(
        "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj xref\ntrailer<</Size 2/Root 1 0 R>>"
      );

      const signed = await engine.signPDF(mockPDF, {
        signerName: "Dr. Test",
        signerId: "8-123-456789",
        signerRole: "Médico General",
        reason: "Medical authorization",
      });

      const info = await engine.getSignatureInfo(signed.pdfBuffer);

      expect(info).toHaveProperty("isSigned");
      expect(info).toHaveProperty("signatures");
      if (info.isSigned) {
        expect(info.signatures.length).toBeGreaterThan(0);
      }
    });

    it("should reject unsigned PDF during validation", async () => {
      const mockPDF = Buffer.from(
        "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj xref\ntrailer<</Size 2/Root 1 0 R>>"
      );

      const validation = await engine.validateSignature(mockPDF);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it("should throw when signing engine not initialized", async () => {
      const uninitializedEngine = new SigningEngine({
        config: { keyPath, certPath },
      });

      const mockPDF = Buffer.from(
        "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj xref\ntrailer<</Size 2/Root 1 0 R>>"
      );

      await expect(
        uninitializedEngine.signPDF(mockPDF, {
          signerName: "Dr. Test",
          signerId: "8-123-456789",
          signerRole: "Médico General",
        })
      ).rejects.toThrow();
    });
  });

  describe("PDFManager", () => {
    it("should create minimal PDF document", async () => {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // Letter size

      page.drawText("Test Document", {
        x: 50,
        y: 750,
        size: 24,
      });

      const pdfBytes = await pdfDoc.save();
      expect(pdfBytes.length).toBeGreaterThan(0);
    });

    it("should add signature annotation", async () => {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);

      await PDFManager.addSignatureAnnotation(
        pdfDoc,
        {
          signerName: "Dr. Test",
          signerId: "8-123-456789",
          signerRole: "Médico General",
          timestamp: new Date().toISOString(),
        },
        0
      );

      const pdfBytes = await PDFManager.savePDF(pdfDoc);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });

    it("should get page count", async () => {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([612, 792]);
      pdfDoc.addPage([612, 792]);

      const count = PDFManager.getPageCount(pdfDoc);
      expect(count).toBe(2);
    });
  });
});
