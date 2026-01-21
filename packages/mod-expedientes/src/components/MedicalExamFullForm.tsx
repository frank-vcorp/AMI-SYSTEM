/**
 * @impl IMPL-20260121-B3
 * @ref context/Plan-Demo-RD-20260121.md context/Datos y Catálogos - Examen Médico.md
 * 
 * Medical Exam Full Form - Formulario COMPLETO con todos los campos de exploración física
 * Secciones: Vitales, Demográficos, Exploración Física, Agudeza Visual, 
 *            Ginecología (condicional), Antecedentes, Aptitud y Recomendaciones
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@ami/core-ui';
import { Card } from '@ami/core-ui';
import { Input } from '@ami/core-ui';

interface MedicalExamFormProps {
  expedientId: string;
  patientGender?: string;
  onSubmit?: (data: any) => Promise<void>;
}

interface FormData {
  // Vitals
  bloodPressure: string;
  heartRate: string;
  respiratoryRate: string;
  temperature: string;
  weight: string;
  height: string;

  // Demographics
  gender: string;
  maritalStatus: string;
  education: string;
  bloodType: string;

  // Exploration
  neurological: string;
  head: string;
  skin: string;
  ears: string;
  eyes: string;
  mouth: string;
  nose: string;
  pharynx: string;
  neck: string;
  thorax: string;
  heart: string;
  lungs: string;
  abdomen: string;
  genitourinary: string;
  spine: string;
  adamTest: string;
  upperLimbs: string;
  lowerLimbs: string;
  strength: string;
  venousCirculation: string;
  mobilityArc: string;

  // Vision
  farVisionOD: string;
  farVisionOI: string;
  nearVision: string;
  ishihara: string;
  campimetry: string;

  // Gynecology (conditional)
  gestaQuiste: string;
  sexualLife: string;
  contraceptionMethod: string;

  // Background
  heredoFamiliar: string;
  habits: string;
  diet: string;

  // Final
  aptitudeRecommendations: string;
}

const DEFAULT_EXPLORATION_VALUES = {
  neurological: 'Alerta, orientado en tiempo, lugar y persona. Lenguaje y marcha normal.',
  head: 'Normocéfalo, con adecuada implantación de cabello.',
  skin: 'Sin datos de palidez, cianosis, sin tatuajes, sin perforaciones.',
  ears: 'Permeable, MT integra, cono luminoso.',
  eyes: 'Pupilas isocóricas, normorreflexicas, fondo de ojo sin datos patológicos.',
  mouth: 'Sin datos de caries y sarro. Centrada, dentadura completa.',
  nose: 'Simétrica, septum alineado, sin datos patológicos.',
  pharynx: 'Sin datos patológicos.',
  neck: 'Cilíndrico, tráquea central, sin presencia de masas.',
  thorax: 'Mesomórfico, movimientos normales, sin deformidades.',
  heart: 'Precordio sin soplos o ruidos agregados, rítmico.',
  lungs: 'Con adecuada entrada y salida de aire, sin ruidos agregados.',
  abdomen: 'Globoso, blando, depresible, peristalsis presente, sin visceromegalias.',
  genitourinary: 'Giordano Negativo.',
  spine: 'Alineada, sin cifosis o lordosis anormales.',
  adamTest: 'Negativo.',
  upperLimbs: 'Íntegros, sensibilidad conservada, sin artrosis.',
  lowerLimbs: 'Íntegros, sensibilidad conservada, ROTs presentes.',
  strength: '5 de 5.',
  venousCirculation: 'Sin varices.',
  mobilityArc: 'Presentes, normales.',
};

export function MedicalExamFullForm({
  expedientId,
  patientGender = 'FEMENINO',
  onSubmit,
}: MedicalExamFormProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    vitals: true,
    demographics: true,
    exploration: true,
    vision: false,
    gynecology: patientGender === 'FEMENINO',
    background: false,
    aptitude: false,
  });

  const [formData, setFormData] = useState<FormData>({
    bloodPressure: '120/80',
    heartRate: '72',
    respiratoryRate: '16',
    temperature: '36.5',
    weight: '75',
    height: '170',
    gender: patientGender,
    maritalStatus: 'SOLTERO',
    education: 'LICENCIATURA',
    bloodType: 'O+',
    ...DEFAULT_EXPLORATION_VALUES,
    farVisionOD: '20/20',
    farVisionOI: '20/20',
    nearVision: '1.0',
    ishihara: 'NORMAL',
    campimetry: 'NORMAL',
    gestaQuiste: 'NEGATIVO',
    sexualLife: 'NUBIL',
    contraceptionMethod: 'NINGUNO',
    heredoFamiliar: 'Niega antecedentes relevantes',
    habits: 'Niega tabaco, alcohol, drogas',
    diet: 'REGULAR',
    aptitudeRecommendations: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar examen');
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-ami-turquoise/10 to-ami-purple/10 border-l-4 border-ami-turquoise hover:bg-ami-turquoise/20 transition"
    >
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <span className="text-xl">
        {expandedSections[section] ? '▼' : '▶'}
      </span>
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-900">
            Examen Médico Completo
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Formulario de captura de examen médico ocupacional
          </p>
        </div>

        {/* VITALS SECTION */}
        <div className="border-b">
          <SectionHeader title="1. Signos Vitales" section="vitals" />
          {expandedSections.vitals && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Presión Arterial (SIS/DIA)
                  </label>
                  <Input
                    type="text"
                    name="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={handleChange}
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frecuencia Cardíaca (bpm)
                  </label>
                  <Input
                    type="number"
                    name="heartRate"
                    value={formData.heartRate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frecuencia Respiratoria (resp/min)
                  </label>
                  <Input
                    type="number"
                    name="respiratoryRate"
                    value={formData.respiratoryRate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperatura (°C)
                  </label>
                  <Input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso (kg)
                  </label>
                  <Input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Altura (cm)
                  </label>
                  <Input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DEMOGRAPHICS SECTION */}
        <div className="border-b">
          <SectionHeader title="2. Datos Demográficos" section="demographics" />
          {expandedSections.demographics && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sexo
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>MASCULINO</option>
                    <option>FEMENINO</option>
                    <option>OTRO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado Civil
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>SOLTERO</option>
                    <option>CASADO</option>
                    <option>UNION LIBRE</option>
                    <option>DIVORCIADO</option>
                    <option>VIUDO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Escolaridad
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>SIN ESTUDIOS</option>
                    <option>PRIMARIA</option>
                    <option>SECUNDARIA</option>
                    <option>PREPARATORIA</option>
                    <option>TECNICA</option>
                    <option>LICENCIATURA</option>
                    <option>POSGRADO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grupo Sanguíneo
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>O+</option>
                    <option>O-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EXPLORATION SECTION */}
        <div className="border-b">
          <SectionHeader title="3. Exploración Física" section="exploration" />
          {expandedSections.exploration && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'neurological', label: 'Neurológico' },
                  { key: 'head', label: 'Cabeza' },
                  { key: 'skin', label: 'Piel y Faneras' },
                  { key: 'ears', label: 'Oídos' },
                  { key: 'eyes', label: 'Ojos' },
                  { key: 'mouth', label: 'Boca' },
                  { key: 'nose', label: 'Nariz' },
                  { key: 'pharynx', label: 'Faringe' },
                  { key: 'neck', label: 'Cuello' },
                  { key: 'thorax', label: 'Tórax' },
                  { key: 'heart', label: 'Corazón' },
                  { key: 'lungs', label: 'Pulmones' },
                  { key: 'abdomen', label: 'Abdomen' },
                  { key: 'genitourinary', label: 'Genitourinario' },
                  { key: 'spine', label: 'Columna Vertebral' },
                  { key: 'adamTest', label: 'Test de Adam' },
                  { key: 'upperLimbs', label: 'MS Superiores' },
                  { key: 'lowerLimbs', label: 'MS Inferiores' },
                  { key: 'strength', label: 'Fuerza (Daniels)' },
                  { key: 'venousCirculation', label: 'Circulación Venosa' },
                  { key: 'mobilityArc', label: 'Arco de Movilidad' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase">
                      {label}
                    </label>
                    <textarea
                      name={key}
                      value={formData[key as keyof FormData] as string}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* VISION SECTION */}
        <div className="border-b">
          <SectionHeader title="4. Agudeza Visual" section="vision" />
          {expandedSections.vision && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visión Lejana OD (Escala 20/X)
                  </label>
                  <Input
                    type="text"
                    name="farVisionOD"
                    value={formData.farVisionOD}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visión Lejana OI (Escala 20/X)
                  </label>
                  <Input
                    type="text"
                    name="farVisionOI"
                    value={formData.farVisionOI}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visión Cercana (Jaeger)
                  </label>
                  <Input
                    type="text"
                    name="nearVision"
                    value={formData.nearVision}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Ishihara
                  </label>
                  <select
                    name="ishihara"
                    value={formData.ishihara}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>NORMAL</option>
                    <option>ANÓMALO</option>
                    <option>NO REALIZADO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campimetría
                  </label>
                  <select
                    name="campimetry"
                    value={formData.campimetry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>NORMAL</option>
                    <option>ANÓMALA</option>
                    <option>NO REALIZADA</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GYNECOLOGY SECTION (conditional) */}
        {patientGender === 'FEMENINO' && (
          <div className="border-b">
            <SectionHeader title="5. Ginecología" section="gynecology" />
            {expandedSections.gynecology && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quiste / Gesta
                    </label>
                    <select
                      name="gestaQuiste"
                      value={formData.gestaQuiste}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option>POSITIVO</option>
                      <option>NEGATIVO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vida Sexual
                    </label>
                    <select
                      name="sexualLife"
                      value={formData.sexualLife}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option>NUBIL</option>
                      <option>ACTIVA</option>
                      <option>NO ACTIVA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Método de Planificación
                    </label>
                    <select
                      name="contraceptionMethod"
                      value={formData.contraceptionMethod}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option>NINGUNO</option>
                      <option>PRESERVATIVO</option>
                      <option>HORMONAL</option>
                      <option>DIU</option>
                      <option>OTRO</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BACKGROUND SECTION */}
        <div className="border-b">
          <SectionHeader title="6. Antecedentes" section="background" />
          {expandedSections.background && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heredo-Familiares
                  </label>
                  <textarea
                    name="heredoFamiliar"
                    value={formData.heredoFamiliar}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hábitos (Tabaco, Alcohol, Drogas)
                  </label>
                  <textarea
                    name="habits"
                    value={formData.habits}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alimentación
                  </label>
                  <select
                    name="diet"
                    value={formData.diet}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>MALA</option>
                    <option>REGULAR</option>
                    <option>BUENA</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* APTITUDE & RECOMMENDATIONS SECTION */}
        <div className="border-b">
          <SectionHeader title="7. Aptitud y Recomendaciones" section="aptitude" />
          {expandedSections.aptitude && (
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Impresión Diagnóstica y Recomendaciones *
              </label>
              <textarea
                name="aptitudeRecommendations"
                value={formData.aptitudeRecommendations}
                onChange={handleChange}
                rows={5}
                placeholder="Ej: Paciente apto para trabajar en puesto actual. Recomendar evaluación cardiovascular anual."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-ami-turquoise hover:bg-ami-turquoise/90"
        >
          {loading ? 'Guardando...' : '✓ Guardar Examen Médico'}
        </Button>
        <Button type="button" variant="outline" className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
