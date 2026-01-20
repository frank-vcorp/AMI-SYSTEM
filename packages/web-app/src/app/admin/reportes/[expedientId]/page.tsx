'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CertificateViewer } from '@ami/mod-reportes';
import type { CertificateData } from '@ami/mod-reportes';

/**
 * Página: /admin/reportes/[expedientId]
 * 
 * Muestra el certificado de validación con opciones:
 * - Imprimir a PDF (Print Dialog)
 * - Descargar como archivo
 * - Ver en pantalla
 */

export default function ReportePage() {
  const params = useParams();
  const expedientId = params.expedientId as string;
  
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del expediente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // TODO: Reemplazar con fetch real de BD
        // const response = await fetch(`/api/expedientes/${expedientId}/certificate`);
        // const data = await response.json();
        
        // Datos de ejemplo para MVP
        const mockData: CertificateData = {
          expedientId: expedientId,
          patientName: 'Juan Carlos García López',
          patientDOB: '1985-06-15',
          clinicName: 'Clínica Centro México DF',
          validatorName: 'Dr. Roberto Pérez García',
          validationDate: new Date('2026-01-23').toISOString(),
          status: 'APPROVED',
          medicalFindings: 'Paciente apto para trabajar en puesto actual sin restricciones',
          signature: 'Dr. RPG',
          stampDate: new Date().toISOString(),
        };
        
        setCertificateData(mockData);
        setError(null);
      } catch (err) {
        console.error('Error loading certificate:', err);
        setError('No se pudo cargar el certificado');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [expedientId]);

  const handleDownload = async () => {
    try {
      // TODO: Implementar descarga real
      // const response = await fetch(
      //   `/api/reportes/${expedientId}/export-pdf`,
      //   { method: 'POST' }
      // );
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `Certificado-${certificateData?.expedientFolio}.pdf`;
      // a.click();
      
      // Por ahora, usar print dialog
      window.print();
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Error al descargar el PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando certificado...</p>
        </div>
      </div>
    );
  }

  if (error || !certificateData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'No se encontró el certificado'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Certificado de Validación</h1>
          <p className="text-gray-600">Expediente: {certificateData.expedientId}</p>
        </div>

        {/* Certificate Viewer */}
        <CertificateViewer
          data={certificateData}
          options={{
            format: 'A4',
            includeSignature: true,
          }}
          onDownload={handleDownload}
        />

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información Importante</h3>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>Este certificado fue generado digitalmente y tiene validez legal</li>
            <li>La firma digital garantiza la integridad del documento</li>
            <li>Guarda una copia para tus registros</li>
            <li>En caso de dudas, contacta con {certificateData.clinicName}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
