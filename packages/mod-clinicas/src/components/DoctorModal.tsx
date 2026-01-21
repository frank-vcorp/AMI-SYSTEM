/**
 * @impl IMPL-20260121-B4
 * @ref context/Plan-Demo-RD-20260121.md
 * 
 * Doctor Modal - CRUD para gestión de médicos
 * Campos: nombre, cedula, especialidad, clínica, firma digital (canvas)
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@ami/core-ui';
import { Input } from '@ami/core-ui';
import { Card } from '@ami/core-ui';

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
      const signatureDataUrl = signatureCanvas?.toDataURL();
      await onSave({
        ...formData,
        signature: signatureDataUrl,
      });
      onClose();
    } catch (error) {
      console.error('Error saving doctor:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-ami-turquoise to-ami-purple p-6 text-white sticky top-0">
          <h2 className="text-xl font-bold">
            {doctor ? 'Editar Médico' : 'Nuevo Médico'}
          </h2>
          <p className="text-sm opacity-90">Gestión de personal médico</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos Personales */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Datos Personales</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. Juan Pérez García"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula Profesional *
                </label>
                <Input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  placeholder="12345678"
                  className={errors.cedula ? 'border-red-500' : ''}
                />
                {errors.cedula && (
                  <p className="text-red-500 text-sm mt-1">{errors.cedula}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidad *
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ami-turquoise ${
                    errors.specialty
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar especialidad</option>
                  {SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                {errors.specialty && (
                  <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clínica *
                </label>
                <select
                  name="clinicId"
                  value={formData.clinicId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ami-turquoise ${
                    errors.clinicId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar clínica</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
                {errors.clinicId && (
                  <p className="text-red-500 text-sm mt-1">{errors.clinicId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Firma Digital */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold text-slate-900">Firma Digital</h3>
            <p className="text-sm text-gray-600">
              Dibuje su firma en el recuadro inferior
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                onMouseDown={handleSignatureStart}
                onMouseMove={handleSignatureMove}
                onMouseUp={handleSignatureEnd}
                onMouseLeave={handleSignatureEnd}
                className="w-full bg-white cursor-crosshair"
              />
            </div>

            {errors.signature && (
              <p className="text-red-500 text-sm">{errors.signature}</p>
            )}

            <Button
              type="button"
              onClick={clearSignature}
              variant="outline"
              className="w-full"
            >
              Limpiar Firma
            </Button>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 border-t pt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-ami-turquoise hover:bg-ami-turquoise/90"
            >
              {isLoading ? 'Guardando...' : doctor ? 'Actualizar' : 'Crear Médico'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
