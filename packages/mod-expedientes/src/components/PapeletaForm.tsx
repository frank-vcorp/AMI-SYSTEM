'use client';

import { useState } from 'react';

interface Study {
  id: string;
  name: string;
  selected: boolean;
}

interface PapeletaFormProps {
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
  patientName = 'PACIENTE NOMBRE',
  clinic = 'CLÍNICA',
  company = 'EMPRESA',
  onSubmit,
}: PapeletaFormProps) {
  const [studies, setStudies] = useState<Study[]>(AVAILABLE_STUDIES);
  const [loading, setLoading] = useState(false);
  const [folio, setFolio] = useState<string | null>(null);

  const handleStudyToggle = (id: string) => {
    if (id === 'medical_exam') return; // Obligatorio, no puede deseleccionarse
    setStudies(studies.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const handleGeneratePapeleta = async () => {
    setLoading(true);
    try {
      // Generar folio único
      const generatedFolio = `EXP-${clinic.substring(0, 4).toUpperCase()}-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-001`;
      setFolio(generatedFolio);
      
      // Llamar a onSubmit si existe
      const selectedStudies = studies.filter(s => s.selected).map(s => s.id);
      await onSubmit?.({ folio: generatedFolio, studies: selectedStudies });
      
      alert(`✅ Papeleta generada: ${generatedFolio}`);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = studies.filter(s => s.selected).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ backgroundImage: 'linear-gradient(to right, rgb(34, 197, 94), rgb(139, 92, 246))', padding: '24px', borderRadius: '8px', color: 'white' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Crear Nueva Papeleta</h2>
        <p>Generación de papeleta de admisión para exámenes ocupacionales</p>
      </div>

      {/* Datos del Paciente */}
      <div style={{ border: '1px solid rgb(209, 213, 219)', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>📋 Datos del Paciente</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Nombre</label>
            <input type="text" value={patientName} readOnly style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px', width: '100%', backgroundColor: '#f3f4f6' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>ID Paciente</label>
            <input type="text" value="P-001234" readOnly style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px', width: '100%', backgroundColor: '#f3f4f6' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Clínica</label>
            <input type="text" value={clinic} readOnly style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px', width: '100%', backgroundColor: '#f3f4f6' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Empresa</label>
            <input type="text" value={company} readOnly style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px', width: '100%', backgroundColor: '#f3f4f6' }} />
          </div>
        </div>
      </div>

      {/* Selección de Estudios */}
      <div style={{ border: '1px solid rgb(209, 213, 219)', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>🔬 Estudios a Realizar ({selectedCount}/{studies.length})</h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {studies.map(study => (
            <label key={study.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: '#f9fafb', cursor: study.id === 'medical_exam' ? 'not-allowed' : 'pointer' }}>
              <input
                type="checkbox"
                checked={study.selected}
                onChange={() => handleStudyToggle(study.id)}
                disabled={study.id === 'medical_exam'}
                style={{ width: '18px', height: '18px' }}
              />
              <span>{study.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Folio Preview */}
      {folio && (
        <div style={{ border: '2px solid rgb(34, 197, 94)', borderRadius: '8px', padding: '16px', backgroundColor: 'rgb(240, 253, 244)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'rgb(22, 163, 74)' }}>✅ Papeleta Generada</h3>
          <p style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: 'bold', color: 'rgb(22, 163, 74)' }}>{folio}</p>
          <p style={{ fontSize: '14px', color: 'rgb(74, 107, 74)', marginTop: '8px' }}>Papeleta lista para procedimiento de examen médico</p>
        </div>
      )}

      {/* Acciones */}
      <button
        onClick={handleGeneratePapeleta}
        disabled={loading || folio !== null}
        style={{
          padding: '12px 24px',
          backgroundColor: folio ? '#ccc' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: folio ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Generando...' : folio ? '✅ Papeleta Generada' : '🎫 Generar Papeleta'}
      </button>
    </div>
  );
}
