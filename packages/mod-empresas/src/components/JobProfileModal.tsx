// JobProfileModal - Client Component
'use client';

import { useState, useCallback } from 'react';
import type { CreateJobProfileRequest } from '../types/company';

interface JobProfileModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  companyName: string;
  availableBatteries: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSubmit: (data: CreateJobProfileRequest) => Promise<void>;
}

export function JobProfileModal({
  isOpen,
  isLoading = false,
  companyName,
  availableBatteries,
  onClose,
  onSubmit
}: JobProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    riskLevel: 'MEDIO' as const
  });

  const [selectedBatteries, setSelectedBatteries] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBatteryToggle = useCallback((batteryId: string) => {
    setSelectedBatteries(prev => {
      if (prev.includes(batteryId)) {
        return prev.filter(id => id !== batteryId);
      } else {
        return [...prev, batteryId];
      }
    });
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nombre del perfil requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        riskLevel: formData.riskLevel as any,
        requiredBatteryIds: selectedBatteries
      });

      setFormData({ name: '', description: '', riskLevel: 'MEDIO' });
      setSelectedBatteries([]);
      onClose();
    } catch (error) {
      console.error('Error creating job profile:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-ami-purple to-ami-turquoise text-white p-6 sticky top-0">
          <h2 className="text-2xl font-bold">Crear Nuevo Perfil de Puesto</h2>
          <p className="text-sm opacity-90">Empresa: {companyName}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Perfil *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-purple ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ej: Operario, Gerente, Chofer"
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-purple"
              placeholder="Descripción de funciones y responsabilidades"
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de Riesgo
            </label>
            <select
              name="riskLevel"
              value={formData.riskLevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-purple"
              disabled={isLoading}
            >
              <option value="BAJO">Bajo</option>
              <option value="MEDIO">Medio</option>
              <option value="ALTO">Alto</option>
            </select>
          </div>

          {/* Baterías Requeridas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Baterías de Exámenes Requeridas
            </label>

            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
              {availableBatteries.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay baterías contratadas por esta empresa</p>
              ) : (
                availableBatteries.map((battery) => (
                  <label key={battery.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBatteries.includes(battery.id)}
                      onChange={() => handleBatteryToggle(battery.id)}
                      disabled={isLoading}
                      className="cursor-pointer accent-ami-purple"
                    />
                    <span className="ml-3 font-medium text-gray-900 text-sm">{battery.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Preview */}
          {selectedBatteries.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">Baterías seleccionadas</p>
              <p className="text-lg font-bold text-ami-purple">{selectedBatteries.length}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-2 justify-end sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-ami-purple text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Creando...' : 'Crear Perfil'}
          </button>
        </div>
      </div>
    </div>
  );
}
