// CompanyModal - Client Component para crear/editar empresa
'use client';

import { useState, useCallback } from 'react';
import type { CreateCompanyRequest } from '../types/company';

interface CompanyModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCompanyRequest) => Promise<void>;
}

export function CompanyModal({
  isOpen,
  isLoading = false,
  onClose,
  onSubmit
}: CompanyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    rfc: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    email: '',
    contactPerson: '',
    contactPhone: '',
    maxEmployees: '100'
  });

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nombre requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email requerido';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Email inválido';
    }

    if (formData.maxEmployees && isNaN(parseInt(formData.maxEmployees))) {
      newErrors.maxEmployees = 'Debe ser un número';
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
        rfc: formData.rfc || undefined,
        description: formData.description.trim() || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        email: formData.email || undefined,
        contactPerson: formData.contactPerson || undefined,
        contactPhone: formData.contactPhone || undefined,
        maxEmployees: formData.maxEmployees ? parseInt(formData.maxEmployees) : 100
      });

      setFormData({
        name: '',
        rfc: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phoneNumber: '',
        email: '',
        contactPerson: '',
        contactPhone: '',
        maxEmployees: '100'
      });
      onClose();
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-ami-turquoise to-ami-purple text-white p-6 sticky top-0">
          <h2 className="text-2xl font-bold">Crear Nueva Empresa</h2>
          <p className="text-sm opacity-90">Información básica de la empresa cliente</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Empresa *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ej: Constructora ABC"
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* RFC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RFC (México, opcional)
            </label>
            <input
              type="text"
              name="rfc"
              value={formData.rfc}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
              placeholder="ej: ABC123456XYZ"
              disabled={isLoading}
              maxLength={13}
            />
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
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
              placeholder="Calle y número"
              disabled={isLoading}
            />
          </div>

          {/* Ciudad, Estado, CP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
                placeholder="México"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
                placeholder="CDMX"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CP</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
                placeholder="06000"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Teléfono Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono Empresa
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
              placeholder="+52 55 1234 5678"
              disabled={isLoading}
            />
          </div>

          {/* Email **/}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="contacto@empresa.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Persona Contacto
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
                placeholder="Nombre de la persona"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono Contacto
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
                placeholder="+52 55 9876 5432"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Máx Empleados */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de Empleados
            </label>
            <input
              type="number"
              name="maxEmployees"
              value={formData.maxEmployees}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
              min="1"
              disabled={isLoading}
            />
            {errors.maxEmployees && <p className="text-red-500 text-xs mt-1">{errors.maxEmployees}</p>}
          </div>
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
            className="px-4 py-2 bg-ami-turquoise text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Creando...' : 'Crear Empresa'}
          </button>
        </div>
      </div>
    </div>
  );
}
