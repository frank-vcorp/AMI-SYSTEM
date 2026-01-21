/**
 * @impl IMPL-20260121-B5
 * @ref context/Plan-Demo-RD-20260121.md
 * Modal para crear/editar clínicas con horarios
 */
'use client';

import { useState } from 'react';
import type { ClinicResponse } from '../types/clinic';

interface ClinicModalProps {
  clinic?: ClinicResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

interface Schedule {
  dayOfWeek: number; // 0-6: Lun-Dom
  openingTime: string;
  closingTime: string;
  lunchStart?: string;
  lunchEnd?: string;
  isOpen: boolean;
  maxAppointmentsDay: number;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function ClinicModal({
  clinic,
  isOpen,
  onClose,
  onSave,
  isLoading = false
}: ClinicModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'schedule'>('general');

  const [formData, setFormData] = useState({
    name: clinic?.name || '',
    description: clinic?.description || '',
    address: clinic?.address || '',
    city: clinic?.city || '',
    state: clinic?.state || '',
    zipCode: clinic?.zipCode || '',
    phoneNumber: clinic?.phoneNumber || '',
    email: clinic?.email || '',
    totalBeds: clinic?.totalBeds || 1
  });

  const [schedules, setSchedules] = useState<Schedule[]>([
    { dayOfWeek: 0, openingTime: '08:00', closingTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', isOpen: true, maxAppointmentsDay: 50 },
    { dayOfWeek: 1, openingTime: '08:00', closingTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', isOpen: true, maxAppointmentsDay: 50 },
    { dayOfWeek: 2, openingTime: '08:00', closingTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', isOpen: true, maxAppointmentsDay: 50 },
    { dayOfWeek: 3, openingTime: '08:00', closingTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', isOpen: true, maxAppointmentsDay: 50 },
    { dayOfWeek: 4, openingTime: '08:00', closingTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', isOpen: true, maxAppointmentsDay: 50 },
    { dayOfWeek: 5, openingTime: '09:00', closingTime: '14:00', lunchStart: undefined, lunchEnd: undefined, isOpen: true, maxAppointmentsDay: 30 },
    { dayOfWeek: 6, openingTime: '00:00', closingTime: '00:00', isOpen: false, maxAppointmentsDay: 0 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalBeds' ? parseInt(value, 10) : value
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nombre requerido';
    if (!formData.address.trim()) newErrors.address = 'Dirección requerida';
    if (!formData.city.trim()) newErrors.city = 'Ciudad requerida';
    if (!formData.state.trim()) newErrors.state = 'Estado requerido';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Código postal requerido';
    if (formData.totalBeds < 1) newErrors.totalBeds = 'Mínimo 1 cama';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalBeds' ? parseInt(value, 10) : value
    }));
  };

  const handleScheduleChange = (dayOfWeek: number, field: string, value: any) => {
    setSchedules(prev =>
      prev.map(s =>
        s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
      )
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nombre requerido';
    if (!formData.address.trim()) newErrors.address = 'Dirección requerida';
    if (!formData.city.trim()) newErrors.city = 'Ciudad requerida';
    if (!formData.state.trim()) newErrors.state = 'Estado requerido';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Código postal requerido';
    if (formData.totalBeds < 1) newErrors.totalBeds = 'Mínimo 1 cama';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSave({
        ...formData,
        schedules
      });
      onClose();
    } catch (error) {
      console.error('Error saving clinic:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-ami-turquoise to-ami-purple p-6 text-white">
          <h2 className="text-xl font-bold">
            {clinic ? 'Editar Clínica' : 'Nueva Clínica'}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === 'general'
                ? 'border-b-2 border-ami-turquoise text-ami-turquoise'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Información General
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === 'schedule'
                ? 'border-b-2 border-ami-turquoise text-ami-turquoise'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Horarios
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === 'general' && (
            <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Clínica Central"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
              placeholder="Detalles de la clínica..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Calle y número"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="México"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="CDMX"
              />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CP *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="28001"
              />
              {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
              placeholder="+55 1234 5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise"
              placeholder="info@clinica.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total de Camas *
            </label>
            <input
              type="number"
              name="totalBeds"
              value={formData.totalBeds}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ami-turquoise ${
                errors.totalBeds ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.totalBeds && <p className="text-red-500 text-sm mt-1">{errors.totalBeds}</p>}
          </div>
            </div>
          )}

          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 mb-4">Horarios de Atención</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Día</th>
                    <th className="text-center py-2 font-medium">Abierto</th>
                    <th className="text-center py-2 font-medium">Apertura</th>
                    <th className="text-center py-2 font-medium">Cierre</th>
                    <th className="text-center py-2 font-medium">Receso</th>
                    <th className="text-center py-2 font-medium">Max Citas</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.dayOfWeek} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{DAYS[schedule.dayOfWeek]}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={schedule.isOpen}
                          onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'isOpen', e.target.checked)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="time"
                          value={schedule.openingTime}
                          onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'openingTime', e.target.value)}
                          disabled={!schedule.isOpen}
                          className="w-20 px-2 py-1 border rounded text-xs"
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="time"
                          value={schedule.closingTime}
                          onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'closingTime', e.target.value)}
                          disabled={!schedule.isOpen}
                          className="w-20 px-2 py-1 border rounded text-xs"
                        />
                      </td>
                      <td className="text-center text-xs text-gray-600">
                        {schedule.lunchStart && schedule.lunchEnd ? `${schedule.lunchStart}-${schedule.lunchEnd}` : '-'}
                      </td>
                      <td className="text-center">
                        <input
                          type="number"
                          value={schedule.maxAppointmentsDay}
                          onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'maxAppointmentsDay', parseInt(e.target.value))}
                          disabled={!schedule.isOpen}
                          className="w-16 px-2 py-1 border rounded text-xs text-center"
                          min="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-ami-turquoise text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : clinic ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
