import { Metadata } from "next";
import { headers } from "next/headers";
import { CertificateViewer } from "@ami/mod-reportes";
import { prisma } from "@ami/core-database";
import { getTenantIdFromRequest } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Reportes | AMI-SYSTEM",
  description: "Generación y descarga de reportes y certificados de validación",
};

interface ReportPageProps {
  params: {
    id: string;
  };
}

/**
 * Reporte / Certificado Page
 * 
 * Muestra el certificado de validación de un expediente.
 * Permite impresión y descarga de PDF.
 */
export default async function ReportPage({ params }: ReportPageProps) {
  const headersList = await headers();
  const tenantId = await getTenantIdFromRequest(headersList as any);

  if (!tenantId) {
    return <div>Acceso denegado</div>;
  }

  // Obtener expediente con validación
  const expedient = await prisma.expedient.findFirst({
    where: {
      id: params.id,
      tenantId,
    },
    include: {
      patient: true,
      clinic: true,
      validationTask: true,
    },
  });

  if (!expedient) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Reporte no encontrado</h1>
        <p className="text-gray-600 mt-2">El expediente solicitado no existe o no fue aprobado.</p>
      </div>
    );
  }

  const validation = expedient.validationTask;
  if (!validation) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-yellow-600">Expediente no validado</h1>
        <p className="text-gray-600 mt-2">Este expediente aún no ha sido validado.</p>
      </div>
    );
  }

  // Preparar datos para el certificado
  const certificateData = {
    expedientId: expedient.id,
    patientName: expedient.patient?.name || "N/A",
    patientDOB: expedient.patient?.dateOfBirth?.toLocaleDateString("es-ES") || "N/A",
    clinicName: expedient.clinic?.name || "N/A",
    validatorName: validation.validatedBy || "Sistema",
    validationDate: validation.updatedAt?.toLocaleDateString("es-ES") || new Date().toLocaleDateString("es-ES"),
    status: validation.status as "APPROVED" | "REJECTED" | "CONDITIONAL",
    medicalFindings: validation.medicalOpinion || undefined,
    stampDate: validation.createdAt.toISOString(),
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <CertificateViewer
        data={certificateData}
        options={{
          format: "A4",
          includeSignature: true,
          includeImages: true,
        }}
        onDownload={() => {
          // Aquí irá la lógica de descarga a PDF si se implementa
          console.log("Download PDF:", expedient.id);
        }}
      />
    </div>
  );
}
