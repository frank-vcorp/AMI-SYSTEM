'use client';

import { useState } from 'react';

interface VitalsData {
  weight: number;
  height: number;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
}

interface ExamData {
  vitals: VitalsData;
  demographics: {
    age: number;
    gender: string;
    bloodType: string;
  };
  physicalExam: {
    generalAppearance: string;
    abdomen: string;
    lungs: string;
    heart: string;
  };
  vision: {
    leftEye: number;
    rightEye: number;
    colorBlindness: boolean;
  };
  gyno?: {
    lastMenstruation: string;
    contraceptionMethod: string;
  };
  background: {
    surgeries: string;
    medications: string;
    allergies: string;
  };
  aptitude: {
    recommendations: string;
    restrictions: string;
    approved: boolean;
  };
}

interface MedicalExamFullFormProps {
  onSubmit?: (data: ExamData) => Promise<void>;
}

export function MedicalExamFullForm({
  onSubmit,
}: MedicalExamFullFormProps) {
  const [data, setData] = useState<ExamData>({
    vitals: { weight: 0, height: 0, bloodPressure: '', heartRate: 0, temperature: 0, respiratoryRate: 0 },
    demographics: { age: 0, gender: '', bloodType: '' },
    physicalExam: { generalAppearance: '', abdomen: '', lungs: '', heart: '' },
    vision: { leftEye: 0, rightEye: 0, colorBlindness: false },
    background: { surgeries: '', medications: '', allergies: '' },
    aptitude: { recommendations: '', restrictions: '', approved: false },
  });

  const [activeSection, setActiveSection] = useState('vitals');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleVitalsChange = (field: keyof VitalsData, value: any) => {
    setData({
      ...data,
      vitals: { ...data.vitals, [field]: value },
    });
  };

  const handleDemographicsChange = (field: string, value: any) => {
    setData({
      ...data,
      demographics: { ...data.demographics, [field]: value },
    });
  };

  const handlePhysicalExamChange = (field: string, value: any) => {
    setData({
      ...data,
      physicalExam: { ...data.physicalExam, [field]: value },
    });
  };

  const handleVisionChange = (field: string, value: any) => {
    setData({
      ...data,
      vision: { ...data.vision, [field]: value },
    });
  };

  const handleBackgroundChange = (field: string, value: any) => {
    setData({
      ...data,
      background: { ...data.background, [field]: value },
    });
  };

  const handleAptitudeChange = (field: string, value: any) => {
    setData({
      ...data,
      aptitude: { ...data.aptitude, [field]: value },
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit?.(data);
      setCompleted(true);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div style={{ border: '2px solid rgb(34, 197, 94)', borderRadius: '8px', padding: '24px', backgroundColor: 'rgb(240, 253, 244)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'rgb(22, 163, 74)', marginBottom: '8px' }}>✅ Examen Completado</h2>
        <p>El examen médico ha sido guardado exitosamente</p>
      </div>
    );
  }

  const sections = [
    { id: 'vitals', name: '💊 Vitales', icon: '🌡️' },
    { id: 'demographics', name: '👤 Demografía', icon: '📊' },
    { id: 'physical', name: '👨‍⚕️ Examen Físico', icon: '🔍' },
    { id: 'vision', name: '👀 Visión', icon: '👁️' },
    { id: 'background', name: '📜 Antecedentes', icon: '📋' },
    { id: 'aptitude', name: '✅ Aptitud', icon: '✔️' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ backgroundImage: 'linear-gradient(to right, rgb(59, 130, 246), rgb(139, 92, 246))', padding: '24px', borderRadius: '8px', color: 'white' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Examen Médico Completo</h2>
        <p>Evaluación integral del paciente - 7 secciones</p>
      </div>

      {/* Secciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: '12px',
              backgroundColor: activeSection === section.id ? '#2563eb' : '#f3f4f6',
              color: activeSection === section.id ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: activeSection === section.id ? 'bold' : 'normal',
              fontSize: '14px',
            }}
          >
            {section.icon} {section.name}
          </button>
        ))}
      </div>

      {/* Contenido Secciones */}
      <div style={{ border: '1px solid rgb(209, 213, 219)', borderRadius: '8px', padding: '24px' }}>
        {/* Vitales */}
        {activeSection === 'vitals' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Peso (kg)</label>
              <input type="number" value={data.vitals.weight} onChange={(e) => handleVitalsChange('weight', parseFloat(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Altura (cm)</label>
              <input type="number" value={data.vitals.height} onChange={(e) => handleVitalsChange('height', parseFloat(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>PA (mmHg)</label>
              <input type="text" value={data.vitals.bloodPressure} onChange={(e) => handleVitalsChange('bloodPressure', e.target.value)} placeholder="120/80" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>FC (bpm)</label>
              <input type="number" value={data.vitals.heartRate} onChange={(e) => handleVitalsChange('heartRate', parseFloat(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Temperatura (°C)</label>
              <input type="number" step="0.1" value={data.vitals.temperature} onChange={(e) => handleVitalsChange('temperature', parseFloat(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>FR (rpm)</label>
              <input type="number" value={data.vitals.respiratoryRate} onChange={(e) => handleVitalsChange('respiratoryRate', parseFloat(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
          </div>
        )}

        {/* Demografía */}
        {activeSection === 'demographics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Edad</label>
              <input type="number" value={data.demographics.age} onChange={(e) => handleDemographicsChange('age', parseInt(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Género</label>
              <select value={data.demographics.gender} onChange={(e) => handleDemographicsChange('gender', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Tipo de Sangre</label>
              <select value={data.demographics.bloodType} onChange={(e) => handleDemographicsChange('bloodType', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">Seleccionar</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        )}

        {/* Examen Físico */}
        {activeSection === 'physical' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Apariencia General</label>
              <textarea value={data.physicalExam.generalAppearance} onChange={(e) => handlePhysicalExamChange('generalAppearance', e.target.value)} rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Abdomen</label>
              <textarea value={data.physicalExam.abdomen} onChange={(e) => handlePhysicalExamChange('abdomen', e.target.value)} rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Pulmones</label>
              <textarea value={data.physicalExam.lungs} onChange={(e) => handlePhysicalExamChange('lungs', e.target.value)} rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Corazón</label>
              <textarea value={data.physicalExam.heart} onChange={(e) => handlePhysicalExamChange('heart', e.target.value)} rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
          </div>
        )}

        {/* Visión */}
        {activeSection === 'vision' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Ojo Izquierdo (20/x)</label>
                <input type="number" value={data.vision.leftEye} onChange={(e) => handleVisionChange('leftEye', parseFloat(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Ojo Derecho (20/x)</label>
                <input type="number" value={data.vision.rightEye} onChange={(e) => handleVisionChange('rightEye', parseFloat(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={data.vision.colorBlindness} onChange={(e) => handleVisionChange('colorBlindness', e.target.checked)} />
              <span>Daltonismo Detectado</span>
            </label>
          </div>
        )}

        {/* Antecedentes */}
        {activeSection === 'background' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Cirugías Previas</label>
              <textarea value={data.background.surgeries} onChange={(e) => handleBackgroundChange('surgeries', e.target.value)} rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Medicamentos Actuales</label>
              <textarea value={data.background.medications} onChange={(e) => handleBackgroundChange('medications', e.target.value)} rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Alergias</label>
              <textarea value={data.background.allergies} onChange={(e) => handleBackgroundChange('allergies', e.target.value)} rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
          </div>
        )}

        {/* Aptitud */}
        {activeSection === 'aptitude' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Recomendaciones</label>
              <textarea value={data.aptitude.recommendations} onChange={(e) => handleAptitudeChange('recommendations', e.target.value)} rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Restricciones Laborales</label>
              <textarea value={data.aptitude.restrictions} onChange={(e) => handleAptitudeChange('restrictions', e.target.value)} rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '4px', border: '1px solid #86efac', cursor: 'pointer' }}>
              <input type="checkbox" checked={data.aptitude.approved} onChange={(e) => handleAptitudeChange('approved', e.target.checked)} />
              <span style={{ fontWeight: '600' }}>✅ Paciente APTO para laborar</span>
            </label>
          </div>
        )}
      </div>

      {/* Botón Guardar */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? '⏳ Guardando examen...' : '💾 Guardar Examen Médico Completo'}
      </button>
    </div>
  );
}
