/**
 * @ami/core-signatures - PDF Management
 * Utilities for PDF manipulation using pdf-lib
 */

import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import type { SignatureField, SignatureMetadata } from "./types";

/**
 * PDFManager - Handle PDF-specific operations
 * Uses pdf-lib for safe, pure-JS PDF manipulation
 */
export class PDFManager {
  /**
   * Create a new PDF or load existing
   */
  static async loadPDF(pdfBuffer: Buffer): Promise<PDFDocument> {
    return await PDFDocument.load(pdfBuffer);
  }

  /**
   * Save PDF document to buffer
   */
  static async savePDF(pdfDoc: PDFDocument): Promise<Buffer> {
    return Buffer.from(await pdfDoc.save());
  }

  /**
   * Add signature field (visual placeholder) to PDF
   * Creates AcroForm field for digital signature
   */
  static async addSignatureFieldToPDF(
    pdfDoc: PDFDocument,
    field: SignatureField
  ): Promise<void> {
    if (field.pageIndex >= pdfDoc.getPageCount()) {
      throw new Error(
        `Page index ${field.pageIndex} out of bounds (document has ${pdfDoc.getPageCount()} pages)`
      );
    }

    const page = pdfDoc.getPage(field.pageIndex);

    if (field.visible !== false) {
      // Draw visual rectangle as signature placeholder
      page.drawRectangle({
        x: field.x,
        y: field.y,
        width: field.width,
        height: field.height,
        borderColor: rgb(0.5, 0.5, 0.5),
        borderWidth: 1,
      });

      // Add label text
      page.drawText("Signature Field", {
        x: field.x + 5,
        y: field.y + field.height - 15,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  /**
   * Add signature annotation to PDF
   * Embeds signer information visibly on page
   */
  static async addSignatureAnnotation(
    pdfDoc: PDFDocument,
    metadata: SignatureMetadata,
    pageIndex: number = 0
  ): Promise<void> {
    if (pageIndex >= pdfDoc.getPageCount()) {
      throw new Error(
        `Page index ${pageIndex} out of bounds (document has ${pdfDoc.getPageCount()} pages)`
      );
    }

    const page = pdfDoc.getPage(pageIndex);

    // Default position: bottom right
    const x = page.getWidth() - 250;
    const y = 50;

    // Draw signature box
    page.drawRectangle({
      x,
      y,
      width: 240,
      height: 100,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Add signer information
    const timestamp = metadata.timestamp
      ? new Date(metadata.timestamp).toISOString()
      : new Date().toISOString();

    const lines = [
      `Firmado por: ${metadata.signerName}`,
      `Cédula: ${metadata.signerId}`,
      `Rol: ${metadata.signerRole}`,
      `Fecha: ${timestamp.split("T")[0]}`,
      `Hora: ${timestamp.split("T")[1]?.split(".")[0] || ""}`,
    ];

    let currentY = y + 80;
    for (const line of lines) {
      page.drawText(line, {
        x: x + 5,
        y: currentY,
        size: 8,
        color: rgb(0, 0, 0),
      });
      currentY -= 15;
    }
  }

  /**
   * Get page dimensions
   */
  static getPageDimensions(page: PDFPage): { width: number; height: number } {
    return {
      width: page.getWidth(),
      height: page.getHeight(),
    };
  }

  /**
   * Get number of pages in document
   */
  static getPageCount(pdfDoc: PDFDocument): number {
    return pdfDoc.getPageCount();
  }

  /**
   * Merge multiple PDFs into one
   */
  static async mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
    const mergedPdf = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
      const pdf = await PDFDocument.load(buffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      for (const page of pages) {
        mergedPdf.addPage(page);
      }
    }

    return Buffer.from(await mergedPdf.save());
  }

  /**
   * Extract text content from PDF (basic)
   * Note: pdf-lib doesn't support text extraction natively
   * For production, consider pdfjs-dist or similar
   */
  static async extractMetadata(pdfDoc: PDFDocument): Promise<Record<string, any>> {
    return {
      pageCount: pdfDoc.getPageCount(),
      createdAt: pdfDoc.getCreationDate()?.toISOString(),
      modifiedAt: pdfDoc.getModificationDate()?.toISOString(),
      title: pdfDoc.getTitle(),
      author: pdfDoc.getAuthor(),
      subject: pdfDoc.getSubject(),
    };
  }
}
