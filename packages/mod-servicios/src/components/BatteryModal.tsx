// BatteryModal - Client Component
'use client';

import { useState, useCallback } from 'react';
import type { CreateBatteryRequest, ServiceResponse } from '../types/service';

interface BatteryModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  availableServices: ServiceResponse[];
  onClose: () => void;
  onSubmit: (data: CreateBatteryRequest) => Promise<void>;
}

export function BatteryModal({
  isOpen,
  isLoading = false,
  availableServices,
  onClose,
  onSubmit
}: BatteryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalPrice: ''
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleServiceToggle = useCallback((serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
    if (errors.services) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.services;
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nombre requerido';
    }

    if (selectedServices.length === 0) {
      newErrors.services = 'Debe seleccionar al menos un servicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCostTotal = () => {
    const selectedData = availableServices.filter(s => selectedServices.includes(s.id));
    return selectedData.reduce((sum, s) => sum + Number(s.costPrice || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const costTotal = calculateCostTotal();

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        services: selectedServices.map(id => ({ serviceId: id, quantity: 1 })),
        totalPrice: formData.totalPrice ? parseFloat(formData.totalPrice) : costTotal
      } as unknown as CreateBatteryRequest);

      // Reset form
      setFormData({ name: '', description: '', totalPrice: '' });
      setSelectedServices([]);
      onClose();
    } catch (error) {
      console.error('Error creating battery:', error);
    }
  };

  if (!isOpen) return null;

  const costTotal = calculateCostTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-ami-purple to-ami-turquoise text-white p-6 sticky top-0">
          <h2 className="text-2xl font-bold">Crear Nueva Batería</h2>
          <p className="text-sm opacity-90">Define servicios incluidos en la batería</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Batería *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ej: Batería Completa"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
              placeholder="Descripción de la batería (opcional)"
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Servicios *
            </label>
            {errors.services && <p className="text-red-500 text-xs mb-2">{errors.services}</p>}

            <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
              {availableServices.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay servicios disponibles</p>
              ) : (
                availableServices.map((service) => (
                  <label key={service.id} className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      disabled={isLoading}
                      className="mt-1 cursor-pointer accent-ami-turquoise"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {service.code} - {service.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${Number(service.costPrice || 0).toFixed(2)} · {service.durationMin} min
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Precio Total (Preview) */}
          {selectedServices.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Servicios Seleccionados</p>
                  <p className="text-lg font-bold text-ami-turquoise">{selectedServices.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Costo Total (Auto)</p>
                  <p className="text-lg font-bold text-ami-turquoise">${costTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Precio Venta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Total (opcional, por defecto = costo total)
            </label>
            <input
              type="number"
              name="totalPrice"
              value={formData.totalPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
              placeholder={`ej: ${costTotal.toFixed(2)}`}
              min="0"
              step="0.01"
              disabled={isLoading}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-ami-purple to-ami-turquoise text-white rounded-lg hover:shadow-lg transform transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Crear Batería'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
