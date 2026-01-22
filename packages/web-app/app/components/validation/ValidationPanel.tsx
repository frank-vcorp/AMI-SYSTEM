'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * IMPL-20260122-02: Validation Panel Component
 * Main interface for validator to review exams and issue verdict
 */

interface ValidationPanel {
  validationTaskId: string;
  expedientId: string;
  patientName: string;
  clinicName: string;
  extractedFindings: Record<string, any>;
  vitalSigns: Record<string, any>;
  verdictRecommendation: {
    suggested: string;
    confidence: number;
    reasoning: string[];
  };
  preValidationChecks: {
    isValid: boolean;
    missingFields: string[];
    warnings: string[];
  };
}

interface FormState {
  verdict: string;
  diagnosis: string;
  restrictions: string;
  signature: string | null;
}

export function ValidationPanel({ taskId }: { taskId: string }) {
  const [data, setData] = useState<ValidationPanel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    verdict: '',
    diagnosis: '',
    restrictions: '',
    signature: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchValidationContext();
  }, [taskId]);

  const fetchValidationContext = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/validaciones/${taskId}`);

      if (!response.ok) {
        throw new Error('Failed to load validation context');
      }

      const data = await response.json();
      setData(data.validationTask);
      setForm((prev) => ({
        ...prev,
        verdict: data.verdictRecommendation?.suggested || 'APTO',
      }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        verdict: form.verdict,
        diagnosis: form.diagnosis,
        restrictions: form.restrictions.split('\n').filter((r) => r.trim()),
        signatureData: form.signature ? { imageData: form.signature } : null,
        ipAddress: '127.0.0.1', // Will be captured server-side
        userAgent: navigator.userAgent,
      };

      const response = await fetch(`/api/validaciones/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit validation');
      }

      alert('✅ Validación guardada exitosamente');

      // Generate PDF if signature provided
      if (form.signature) {
        await generatePDF();
      }
    } catch (err) {
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = async () => {
    try {
      const response = await fetch(`/api/validaciones/${taskId}/generate-pdf`, {
        method: 'POST',
      });

      if (response.ok) {
        const pdfData = await response.json();
        alert(`📄 PDF generado: ${pdfData.fileName}`);
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error || 'No se pudo cargar la validación'}</p>
        <button
          onClick={fetchValidationContext}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Información del Paciente */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-lg mb-3">Información del Paciente</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-semibold text-gray-600">Expediente</dt>
              <dd className="text-gray-800 font-mono">{data.expedientId}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-600">Paciente</dt>
              <dd className="text-gray-800">{data.patientName}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-600">Clínica</dt>
              <dd className="text-gray-800">{data.clinicName}</dd>
            </div>
          </dl>
        </div>

        {/* Signos Vitales */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-lg mb-3">Signos Vitales</h3>
          <dl className="space-y-2 text-sm">
            {Object.entries(data.vitalSigns).map(([key, value]) => (
              <div key={key}>
                <dt className="font-semibold text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </dt>
                <dd className="text-gray-800 font-bold text-lg">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Pre-validación */}
        {data.preValidationChecks.missingFields.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-800 mb-2">⚠️ Campos Faltantes</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {data.preValidationChecks.missingFields.map((field, idx) => (
                <li key={idx}>• {field}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Columna Central: Hallazgos */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-lg mb-3">Hallazgos Extraídos</h3>
          <div className="space-y-3">
            {Object.entries(data.extractedFindings).map(([key, finding]) => (
              <div key={key} className="pb-3 border-b last:border-b-0">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      finding.severity === 'NORMAL'
                        ? 'bg-green-100 text-green-800'
                        : finding.severity === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {finding.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {finding.value} {finding.unit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recomendación IA */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">💡 Recomendación IA</h3>
          <div className="mb-2">
            <div className="text-sm text-blue-700">
              <strong>Veredicto Sugerido:</strong> {data.verdictRecommendation.suggested}
            </div>
            <div className="text-sm text-blue-700">
              <strong>Confianza:</strong> {(data.verdictRecommendation.confidence * 100).toFixed(0)}%
            </div>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            {data.verdictRecommendation.reasoning.map((reason, idx) => (
              <li key={idx}>• {reason}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Validación */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white border rounded-lg p-4 shadow-sm space-y-4">
            <h3 className="font-bold text-lg">Veredicto y Diagnóstico</h3>

            {/* Veredicto */}
            <div>
              <label className="block font-semibold text-sm mb-2">Veredicto Final</label>
              <select
                value={form.verdict}
                onChange={(e) => setForm((prev) => ({ ...prev, verdict: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="APTO">APTO - Apto para trabajar</option>
                <option value="APTO_CON_RESTRICCIONES">
                  APTO CON RESTRICCIONES - Requiere limitaciones
                </option>
                <option value="NO_APTO">NO APTO - No apto para trabajar</option>
                <option value="PENDIENTE">PENDIENTE - Requiere más estudios</option>
                <option value="REFERENCIA">REFERENCIA - Derivar a especialista</option>
              </select>
            </div>

            {/* Diagnóstico */}
            <div>
              <label className="block font-semibold text-sm mb-2">Diagnóstico</label>
              <textarea
                value={form.diagnosis}
                onChange={(e) => setForm((prev) => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Ingrese el diagnóstico médico después de la evaluación..."
                rows={4}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Restricciones */}
            <div>
              <label className="block font-semibold text-sm mb-2">Restricciones (si aplica)</label>
              <textarea
                value={form.restrictions}
                onChange={(e) => setForm((prev) => ({ ...prev, restrictions: e.target.value }))}
                placeholder="Lista de restricciones en el trabajo (una por línea)"
                rows={3}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Firma */}
            <div>
              <label className="block font-semibold text-sm mb-2">Firma Electrónica</label>
              <div className="border-2 border-dashed rounded-lg p-4 bg-gray-50">
                <canvas
                  id="signatureCanvas"
                  className="border rounded bg-white w-full h-32 cursor-crosshair"
                  onClick={() => {
                    // Stub: En producción, integrar con librería de firma (e.g., signature_pad)
                    alert(
                      'Funcionalidad de firma electrónica requiere biblioteca externa (signature_pad)'
                    );
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Haga clic para firmar digitalmente (requiere implementación completa)
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                {submitting ? 'Guardando...' : '✅ Guardar Validación'}
              </button>
              <Link
                href="/validation"
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-center hover:bg-gray-300"
              >
                ← Volver
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
