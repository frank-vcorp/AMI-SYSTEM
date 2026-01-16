/**
 * @ami/core-signatures - Ejemplo de Uso Completo
 * Demostración de flujo de firma y validación de documentos médicos
 */

import { promises as fs } from "fs";
import {
  createSigningEngine,
  CertificateUtils,
  PDFManager,
} from "@ami/core-signatures";
import { PDFDocument, rgb } from "pdf-lib";

/**
 * Ejemplo 1: Generar certificado autofirmado (DESARROLLO)
 */
async function example1_generateCertificate() {
  console.log("\n=== Ejemplo 1: Generar Certificado Autofirmado ===\n");

  const { keyPath, certPath } = await CertificateUtils.generateSelfSignedCertificate(
    {
      commonName: "Dr. Juan Carlos Pérez",
      subject: "8-123-456789",
      organizationUnit: "Departamento de Medicina",
      organization: "Clínica Integral de Salud",
      validityDays: 365,
    },
    "./certs"
  );

  console.log(`✅ Certificado generado:`);
  console.log(`   Clave privada: ${keyPath}`);
  console.log(`   Certificado: ${certPath}`);

  // Obtener información del certificado
  const info = await CertificateUtils.getCertificateInfo(certPath);
  console.log(`\n📄 Información del certificado:`);
  console.log(info.split("\n").slice(0, 15).join("\n"));

  return { keyPath, certPath };
}

/**
 * Ejemplo 2: Crear PDF y firmarlo
 */
async function example2_signPDF(keyPath: string, certPath: string) {
  console.log("\n=== Ejemplo 2: Crear y Firmar PDF ===\n");

  // Inicializar motor de firmas
  const engine = await createSigningEngine({
    config: {
      keyPath,
      certPath,
      certType: "self-signed",
    },
  });

  console.log("✅ Motor de firmas inicializado");

  // Crear un PDF de ejemplo
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Tamaño carta

  page.drawText("PAPELETA MÉDICA", {
    x: 50,
    y: 750,
    size: 24,
    color: rgb(0, 0, 0),
  });

  page.drawText("Paciente: Juan Rodríguez García", {
    x: 50,
    y: 700,
    size: 12,
  });

  page.drawText("Diagnóstico: Síndrome viral", {
    x: 50,
    y: 670,
    size: 12,
  });

  page.drawText("Recomendaciones: Reposo 5 días, fluidos", {
    x: 50,
    y: 640,
    size: 12,
  });

  const pdfBuffer = Buffer.from(await pdfDoc.save());
  console.log("✅ PDF de ejemplo creado");

  // Agregar campo de firma visual
  const pdfDocWithField = await PDFDocument.load(pdfBuffer);
  await PDFManager.addSignatureFieldToPDF(pdfDocWithField, {
    fieldName: "signature_1",
    x: 350,
    y: 100,
    width: 200,
    height: 80,
    pageIndex: 0,
    visible: true,
  });

  const pdfWithField = Buffer.from(await PDFManager.savePDF(pdfDocWithField));
  console.log("✅ Campo de firma agregado al PDF");

  // Firmar el PDF
  const signedDocument = await engine.signPDF(pdfWithField, {
    signerName: "Dr. Juan Carlos Pérez",
    signerId: "8-123-456789",
    signerRole: "Médico Especialista",
    licenseNumber: "MED-2024-123456",
    reason: "Autorización de papeleta médica",
    pageNumber: 0,
  });

  console.log("✅ PDF firmado exitosamente");
  console.log(`   Hash de firma: ${signedDocument.signatureHash.substring(0, 32)}...`);
  console.log(`   Firma realizada: ${signedDocument.signedAt}`);

  // Guardar PDF firmado
  await fs.writeFile("papeleta-firmada.pdf", signedDocument.pdfBuffer);
  console.log("💾 PDF guardado en: papeleta-firmada.pdf");

  await engine.dispose();
  return "papeleta-firmada.pdf";
}

/**
 * Ejemplo 3: Validar firma de PDF
 */
async function example3_validateSignature(
  signedPdfPath: string,
  keyPath: string,
  certPath: string
) {
  console.log("\n=== Ejemplo 3: Validar Firma de PDF ===\n");

  const engine = await createSigningEngine({
    config: {
      keyPath,
      certPath,
      certType: "self-signed",
    },
  });

  const pdfBuffer = await fs.readFile(signedPdfPath);

  // Validar firma
  const validation = await engine.validateSignature(pdfBuffer);

  console.log(`✅ Validación completada:`);
  console.log(`   ¿Es válido? ${validation.isValid}`);
  console.log(`   Errores: ${validation.errors.length}`);
  console.log(`   Advertencias: ${validation.warnings.length}`);

  if (validation.signatureInfo) {
    console.log(`\n📄 Información de firma:`);
    console.log(`   Cantidad de firmas: ${validation.signatureInfo.signatureCount}`);

    validation.signatureInfo.signatures.forEach((sig, idx) => {
      console.log(`\n   Firma ${idx + 1}:`);
      console.log(`     Firmante: ${sig.signerName}`);
      console.log(`     Cédula: ${sig.signerId}`);
      console.log(`     Rol: ${sig.signerRole}`);
      console.log(`     Timestamp: ${sig.timestamp}`);
      console.log(`     Razón: ${sig.reason}`);
      console.log(`     ¿Válida? ${sig.isValid}`);
    });
  }

  // Extraer información de firma
  const signatureInfo = await engine.getSignatureInfo(pdfBuffer);
  console.log(`\n🔍 Información extraída del PDF:`);
  console.log(`   ¿Tiene firmas? ${signatureInfo.isSigned}`);
  console.log(`   Total de firmas: ${signatureInfo.signatureCount}`);

  await engine.dispose();
}

/**
 * Ejemplo 4: Agregar anotación visible a PDF
 */
async function example4_addAnnotation(keyPath: string, certPath: string) {
  console.log("\n=== Ejemplo 4: Agregar Anotación de Firma Visible ===\n");

  // Crear PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);

  page.drawText("REPORTE MÉDICO", {
    x: 50,
    y: 750,
    size: 20,
  });

  // Agregar anotación de firma
  await PDFManager.addSignatureAnnotation(
    pdfDoc,
    {
      signerName: "Dr. María González López",
      signerId: "8-987-654321",
      signerRole: "Médico Internista",
      timestamp: new Date().toISOString(),
      reason: "Validación de resultados de laboratorio",
    },
    0
  );

  const pdfBuffer = Buffer.from(await PDFManager.savePDF(pdfDoc));
  await fs.writeFile("reporte-con-anotacion.pdf", pdfBuffer);

  console.log("✅ Anotación de firma agregada");
  console.log("💾 PDF guardado en: reporte-con-anotacion.pdf");
}

/**
 * Ejecutar todos los ejemplos
 */
async function runAllExamples() {
  try {
    console.log("╔═══════════════════════════════════════════════════════╗");
    console.log("║  @ami/core-signatures - Ejemplos de Uso Completo      ║");
    console.log("╚═══════════════════════════════════════════════════════╝");

    // Ejemplo 1: Generar certificado
    const { keyPath, certPath } = await example1_generateCertificate();

    // Ejemplo 2: Crear y firmar PDF
    const signedPdfPath = await example2_signPDF(keyPath, certPath);

    // Ejemplo 3: Validar firma
    await example3_validateSignature(signedPdfPath, keyPath, certPath);

    // Ejemplo 4: Agregar anotación
    await example4_addAnnotation(keyPath, certPath);

    console.log("\n╔═══════════════════════════════════════════════════════╗");
    console.log("║  ✅ Todos los ejemplos completados exitosamente      ║");
    console.log("╚═══════════════════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("❌ Error durante la ejecución:", error);
    process.exit(1);
  }
}

// Ejecutar
runAllExamples();
