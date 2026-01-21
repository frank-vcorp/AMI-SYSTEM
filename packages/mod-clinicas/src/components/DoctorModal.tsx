'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Doctor {
  id: string;
  name: string;
  cedula: string;
  specialty: string;
  clinicId: string;
  signature?: string;
  createdAt: string;
}

interface DoctorModalProps {
  isOpen: boolean;
  doctor?: Doctor | null;
  clinics?: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const SPECIALTIES = [
  'Medicina General',
  'Cardiología',
  'Oftalmología',
  'Neumología',
  'Gastroenterología',
  'Dermatología',
  'Neurología',
  'Ortopedia',
  'Ginecología',
  'Otro',
];

export function DoctorModal({
  isOpen,
  doctor,
  clinics = [],
  onClose,
  onSave,
  isLoading = false,
}: DoctorModalProps) {
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    cedula: doctor?.cedula || '',
    specialty: doctor?.specialty || '',
    clinicId: doctor?.clinicId || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signatureCanvas, setSignatureCanvas] = useState<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSignature, setHasSignature] = useState(!!doctor?.signature);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
      }
      setSignatureCanvas(canvas);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signatureCanvas) return;
    setIsDrawing(true);
    const rect = signatureCanvas.getBoundingClientRect();
    const ctx = signatureCanvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    }
  };

  const handleSignatureMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureCanvas) return;
    const rect = signatureCanvas.getBoundingClientRect();
    const ctx = signatureCanvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(
        e.clientX - rect.left,
        e.clientY - rect.top
      );
      ctx.stroke();
    }
  };

  const handleSignatureEnd = () => {
    setIsDrawing(false);
    if (signatureCanvas) {
      setHasSignature(true);
    }
  };

  const clearSignature = () => {
    if (signatureCanvas) {
      const ctx = signatureCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      }
      setHasSignature(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nombre requerido';
    if (!formData.cedula.trim())
      newErrors.cedula = 'Cédula profesional requerida';
    if (!formData.specialty) newErrors.specialty = 'Especialidad requerida';
    if (!formData.clinicId) newErrors.clinicId = 'Clínica requerida';
    if (!hasSignature) newErrors.signature = 'Firma digital requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const signatureDataUrl = signatureCanvas?.toDataURL().split(',')[1]; // Base64 sin prefijo
      
      // Conexión a API
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tenantId: 'default-tenant',
          signatureCanvas: signatureDataUrl,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al guardar médico');
      }

      await onSave({
        ...formData,
        signature: signatureDataUrl,
      });
      onClose();
    } catch (error) {
      console.error('Error saving doctor:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '640px', width: '100%', margin: '16px', maxHeight: '600px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ backgroundImage: 'linear-gradient(to right, rgb(16, 185, 129), rgb(139, 92, 246))', padding: '24px', color: 'white', position: 'sticky', top: 0 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
            {doctor ? 'Editar Médico' : 'Nuevo Médico'}
          </h2>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>Gestión de personal médico</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'grid', gap: '24px' }}>
          {/* Datos Personales */}
          <div style={{ display: 'grid', gap: '16px' }}>
            <h3 style={{ fontWeight: '600', color: '#1e293b' }}>Datos Personales</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. Juan Pérez García"
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: errors.name ? '1px solid #ef4444' : '1px solid #d1d5db', 
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.name && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Cédula Profesional *
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  placeholder="12345678"
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: errors.cedula ? '1px solid #ef4444' : '1px solid #d1d5db', 
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.cedula && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.cedula}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Especialidad *
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: errors.specialty ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleccionar especialidad</option>
                  {SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                {errors.specialty && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.specialty}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Clínica *
                </label>
                <select
                  name="clinicId"
                  value={formData.clinicId}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: errors.clinicId ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleccionar clínica</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
                {errors.clinicId && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.clinicId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Firma Digital */}
          <div style={{ display: 'grid', gap: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
            <h3 style={{ fontWeight: '600', color: '#1e293b' }}>Firma Digital</h3>
            <p style={{ fontSize: '14px', color: '#4b5563' }}>
              Dibuje su firma en el recuadro inferior
            </p>

            <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                onMouseDown={handleSignatureStart}
                onMouseMove={handleSignatureMove}
                onMouseUp={handleSignatureEnd}
                onMouseLeave={handleSignatureEnd}
                style={{ width: '100%', backgroundColor: 'white', cursor: 'crosshair', display: 'block' }}
              />
            </div>

            {errors.signature && (
              <p style={{ color: '#ef4444', fontSize: '12px' }}>{errors.signature}</p>
            )}

            <button
              type="button"
              onClick={clearSignature}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Limpiar Firma
            </button>
          </div>

          {/* Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                backgroundColor: isLoading ? '#ccc' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'wait' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {isLoading ? 'Guardando...' : doctor ? 'Actualizar' : 'Crear Médico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
