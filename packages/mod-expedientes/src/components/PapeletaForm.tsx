/**
 * @impl IMPL-20260121-B2
 * @ref context/Plan-Demo-RD-20260121.md
 * 
 * Papeleta Form - Creación de papeleta con generación de folio + QR
 * Campos: Datos paciente (pre-llenado), Estudios a Realizar (checkboxes)
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@ami/core-ui';
import { Card } from '@ami/core-ui';
import { Input } from '@ami/core-ui';
import { Badge } from '@ami/core-ui';

interface Study {
  id: string;
  name: string;
  selected: boolean;
}

interface PapeletaFormProps {
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  clinic?: string;
  company?: string;
  onSubmit?: (data: any) => Promise<void>;
}

const AVAILABLE_STUDIES: Study[] = [
  { id: 'medical_exam', name: 'Examen Médico (Obligatorio)', selected: true },
  { id: 'laboratory', name: 'Laboratorio (BH, EGO, QS)', selected: false },
  { id: 'radiography', name: 'Radiografías', selected: false },
  { id: 'spirometry', name: 'Espirometría', selected: false },
  { id: 'audiometry', name: 'Audiometría', selected: false },
  { id: 'ecg', name: 'Electrocardiograma', selected: false },
  { id: 'campimetry', name: 'Campimetría', selected: false },
  { id: 'toxicology', name: 'Toxicológico', selected: false },
];

export function PapeletaForm({
  appointmentId,
  patientId,
  patientName = 'PACIENTE NOMBRE',
  clinic = 'CLÍNICA',
  company = 'EMPRESA',
  onSubmit,
}: PapeletaFormProps) {
  const [studies, setStudies] = useState<Study[]>(AVAILABLE_STUDIES);
  const [folio, setFolio] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStudyToggle = (studyId: string) => {
    // Medical exam cannot be deselected
    if (studyId === 'medical_exam') return;

    setStudies(
      studies.map((study) =>
        study.id === studyId ? { ...study, selected: !study.selected } : study
      )
    );
  };

  const handleGeneratePapeleta = async () => {
    setLoading(true);
    setError('');

    try {
      // Generate folio via API
      const response = await fetch('/api/papeletas/folio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: process.env.NEXT_PUBLIC_TENANT_ID || 'default-tenant',
          clinicId: 'default-clinic', // Would come from context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate folio');
      }

      const { folio: generatedFolio, qr } = await response.json();
      setFolio(generatedFolio);
      setQrDataUrl(qr);

      // Notify parent if callback provided
      if (onSubmit) {
        await onSubmit({
          folio: generatedFolio,
          studies: studies.filter((s) => s.selected),
          qr,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error generating papeleta';
      setError(message);
      console.error('Papeleta generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedStudiesCount = studies.filter((s) => s.selected).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-ami-turquoise to-ami-purple p-6 text-white rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Crear Nueva Papeleta</h2>
        <p className="text-sm opacity-90">
          Registro inicial del paciente y asignación de estudios
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Datos del Paciente */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Datos del Paciente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <Input
                type="text"
                value={patientName}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Paciente
              </label>
              <Input
                type="text"
                value={patientId || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clínica
              </label>
              <Input
                type="text"
                value={clinic}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <Input
                type="text"
                value={company}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Estudios a Realizar */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Estudios a Realizar ({selectedStudiesCount} seleccionados)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {studies.map((study) => (
              <label
                key={study.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
              >
                <input
                  type="checkbox"
                  checked={study.selected}
                  onChange={() => handleStudyToggle(study.id)}
                  disabled={study.id === 'medical_exam'}
                  className="w-4 h-4 text-ami-turquoise rounded"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {study.name}
                </span>
                {study.id === 'medical_exam' && (
                  <Badge variant="default" className="ml-auto text-xs">
                    Obligatorio
                  </Badge>
                )}
              </label>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El Examen Médico es obligatorio. Otros estudios
              pueden agregarse según lo requiera la batería de servicios contratada.
            </p>
          </div>
        </div>
      </Card>

      {/* Botón Generar */}
      <div className="flex gap-3">
        <Button
          onClick={handleGeneratePapeleta}
          disabled={loading}
          className="flex-1 bg-ami-turquoise hover:bg-ami-turquoise/90"
        >
          {loading ? 'Generando...' : '+ Generar Papeleta'}
        </Button>
      </div>

      {/* Preview Papeleta Generada */}
      {folio && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              ✓ Papeleta Generada
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Folio Info */}
              <div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 uppercase mb-1">
                    Folio
                  </label>
                  <p className="text-2xl font-bold text-ami-turquoise font-mono">
                    {folio}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 uppercase mb-2">
                    Estudios Seleccionados
                  </label>
                  <div className="space-y-1">
                    {studies
                      .filter((s) => s.selected)
                      .map((study) => (
                        <p key={study.id} className="text-sm text-gray-700">
                          ✓ {study.name}
                        </p>
                      ))}
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  <p>
                    <strong>Fecha Emisión:</strong>{' '}
                    {new Date().toLocaleDateString('es-MX')}
                  </p>
                  <p>
                    <strong>Vigencia:</strong> 30 días
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="w-40 h-40"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Código QR de identificación
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3 border-t pt-4">
              <Button variant="outline" className="flex-1">
                📋 Imprimir Papeleta
              </Button>
              <Button variant="default" className="flex-1">
                ➜ Siguiente: Examen Médico
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
