'use client';

import { useState, useEffect } from 'react';
import {
  CreateAppointmentRequest,
  AppointmentResponse,
  AvailabilitySlot,
} from '../types/appointment';

interface AppointmentFormProps {
  tenantId: string;
  onSuccess?: (appointment: AppointmentResponse) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateAppointmentRequest>;
  isLoading?: boolean;
}

export function AppointmentForm({
  tenantId,
  onSuccess,
  onCancel,
  initialData,
  isLoading = false,
}: AppointmentFormProps) {
  const defaultFormData: CreateAppointmentRequest = {
    clinicId: '',
    companyId: '',
    employeeId: '',
    appointmentDate: '',
    appointmentTime: '',
    serviceIds: [],
    notes: '',
  };

  const [formData, setFormData] = useState<CreateAppointmentRequest>(
    initialData ? { ...defaultFormData, ...initialData } : defaultFormData
  );

  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch available slots when clinic and date change
  useEffect(() => {
    if (formData.clinicId && formData.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [formData.clinicId, formData.appointmentDate]);

  const fetchAvailableSlots = async () => {
    if (!formData.clinicId || !formData.appointmentDate) return;

    setLoadingSlots(true);
    setError(null);

    try {
      const response = await fetch('/api/citas/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: formData.clinicId,
          dateFrom: formData.appointmentDate,
          dateTo: formData.appointmentDate,
          serviceIds: formData.serviceIds,
          durationMin: 30, // Default duration for searching slots
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tenantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appointment');
      }

      const appointment = await response.json();
      onSuccess?.(appointment);

      // Reset form
      setFormData({
        clinicId: '',
        companyId: '',
        employeeId: '',
        appointmentDate: '',
        appointmentTime: '',
        serviceIds: [],
        notes: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // IMPL-20260120-12: Service selection UI ready for future implementation
  // Handler prepared but not yet integrated in form UI (FASE 2 enhancement)
  // const handleServiceToggle = (serviceId: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     serviceIds: prev.serviceIds.includes(serviceId)
  //       ? prev.serviceIds.filter((id) => id !== serviceId)
  //       : [...prev.serviceIds, serviceId],
  //   }));
  // };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Clinic Selection */}
      <div>
        <label htmlFor="clinicId" className="block text-sm font-medium text-gray-700 mb-2">
          Clínica *
        </label>
        <select
          id="clinicId"
          name="clinicId"
          value={formData.clinicId}
          onChange={handleInputChange}
          required
          disabled={submitting || isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">Selecciona una clínica</option>
          {/* Options populated by parent component or API */}
        </select>
      </div>

      {/* Company Selection */}
      <div>
        <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-2">
          Empresa *
        </label>
        <select
          id="companyId"
          name="companyId"
          value={formData.companyId}
          onChange={handleInputChange}
          required
          disabled={submitting || isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">Selecciona una empresa</option>
        </select>
      </div>

      {/* Employee Selection */}
      <div>
        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
          Empleado / Paciente *
        </label>
        <select
          id="employeeId"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleInputChange}
          required
          disabled={submitting || isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">Selecciona un empleado</option>
        </select>
      </div>

      {/* Date Selection */}
      <div>
        <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
          Fecha *
        </label>
        <input
          id="appointmentDate"
          name="appointmentDate"
          type="date"
          value={formData.appointmentDate}
          onChange={handleInputChange}
          required
          disabled={submitting || isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>

      {/* Time Selection with Available Slots */}
      <div>
        <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-2">
          Hora *
        </label>
        {loadingSlots ? (
          <div className="text-sm text-gray-500">Cargando horarios disponibles...</div>
        ) : availableSlots.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {availableSlots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    appointmentTime: slot.time,
                  }))
                }
                className={`p-2 text-sm font-medium rounded border transition-colors ${
                  formData.appointmentTime === slot.time
                    ? 'bg-cyan-500 text-white border-cyan-500'
                    : slot.available
                    ? 'border-gray-300 hover:border-cyan-500'
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!slot.available || submitting}
              >
                {slot.time}
              </button>
            ))}
          </div>
        ) : (
          <input
            id="appointmentTime"
            name="appointmentTime"
            type="time"
            value={formData.appointmentTime}
            onChange={handleInputChange}
            required
            disabled={submitting || isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
          />
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          disabled={submitting || isLoading}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
          placeholder="Información adicional sobre la cita..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting || isLoading}
          className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || isLoading}
          className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 font-medium"
        >
          {submitting ? 'Guardando...' : 'Agendar Cita'}
        </button>
      </div>
    </form>
  );
}
