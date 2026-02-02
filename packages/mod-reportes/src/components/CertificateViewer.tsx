"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { AptitudePDF } from "./AptitudePDF";
import { CertificateData, PDFExportOptions } from "../types";
import { Button } from "@ami/core-ui";

interface CertificateViewerProps {
  data: CertificateData;
  options?: Partial<PDFExportOptions>;
  onDownload?: () => void;
}

/**
 * CertificateViewer Component
 */
export function CertificateViewer({
  data,
  options = {},
  onDownload,
}: CertificateViewerProps) {
  const { format = "A4", includeSignature = true } = options;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="certificate-container p-8 bg-white">
      {/* Print Controls */}
      <div className="no-print flex gap-4 mb-8">
        <Button
          onClick={handlePrint}
          variant="outline"
          className="border-slate-200"
        >
          🖨️ Imprimir
        </Button>

        <PDFDownloadLink
          document={<AptitudePDF data={data} />}
          fileName={`Certificado_${data.folio || data.expedientId}.pdf`}
        >
          {({ loading }) => (
            <Button
              className="btn-primary"
              isLoading={loading}
              onClick={onDownload}
            >
              📥 Descargar PDF Real
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* Certificate Content */}
      <div
        className={`certificate-content ${format === "A4" ? "w-full max-w-4xl" : ""}`}
        style={{
          width: format === "A4" ? "210mm" : "216mm",
          height: format === "A4" ? "297mm" : "279mm",
          margin: "0 auto",
          padding: "40px",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
        }}
      >
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            CERTIFICADO DE VALIDACIÓN
          </h1>
          <p className="text-gray-600 mt-2">Atención Médica Integrada (AMI)</p>
        </div>

        {/* Content Section */}
        <div className="certificate-body space-y-6">
          {/* Expedient Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-700">ID Expediente</p>
              <p className="text-lg font-mono text-gray-900">{data.expedientId}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Fecha de Validación</p>
              <p className="text-lg text-gray-900">{data.validationDate}</p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-sm font-semibold text-gray-700">Paciente</p>
            <p className="text-lg font-semibold text-gray-900">{data.patientName}</p>
            <p className="text-sm text-gray-600">Fecha de Nacimiento: {data.patientDOB}</p>
          </div>

          {/* Clinic Info */}
          <div>
            <p className="text-sm font-semibold text-gray-700">Clínica</p>
            <p className="text-lg text-gray-900">{data.clinicName}</p>
          </div>

          {/* Medical Findings */}
          {data.medicalFindings && (
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Hallazgos Médicos
              </p>
              <p className="text-gray-900">{data.medicalFindings}</p>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold text-gray-700">Estado:</p>
            <span
              className={`px-4 py-2 rounded font-semibold ${data.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : data.status === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
                }`}
            >
              {data.status === "APPROVED"
                ? "✓ APROBADO"
                : data.status === "REJECTED"
                  ? "✗ RECHAZADO"
                  : "⚠ CONDICIONAL"}
            </span>
          </div>

          {/* Signature Section */}
          {includeSignature && (
            <div className="mt-12 grid grid-cols-3 gap-8 text-center">
              <div className="border-t-2 border-gray-400 pt-4">
                <p className="text-xs text-gray-600">Validador</p>
                <p className="font-semibold text-gray-900 mt-2">
                  {data.validatorName}
                </p>
              </div>
              <div className="border-t-2 border-gray-400 pt-4">
                <p className="text-xs text-gray-600">Sello Digital</p>
                <p className="text-xs text-gray-600 mt-2 font-mono">
                  {data.stampDate}
                </p>
              </div>
              <div className="border-t-2 border-gray-400 pt-4">
                <p className="text-xs text-gray-600">Autoridad</p>
                <p className="font-semibold text-gray-900 mt-2">AMI-RD</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center border-t-2 border-gray-300 pt-4">
          <p className="text-xs text-gray-500">
            Este documento es generado automáticamente por el sistema AMI-SYSTEM.
            Válido sin firma adicional.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Generado: {new Date().toLocaleString("es-ES")}
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .certificate-content {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
