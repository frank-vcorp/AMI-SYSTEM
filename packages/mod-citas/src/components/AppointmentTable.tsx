'use client';

import { useState } from 'react';
import { AppointmentResponse, AppointmentStatus } from '../types/appointment';

interface AppointmentTableProps {
  appointments: AppointmentResponse[];
  onCancel?: (id: string) => Promise<void>;
  onEdit?: (appointment: AppointmentResponse) => void;
  onCreateExpedient?: (appointmentId: string, patientId: string) => void;
  isLoading?: boolean;
}

export function AppointmentTable({
  appointments,
  onCancel,
  onEdit,
  onCreateExpedient,
  isLoading = false,
}: AppointmentTableProps) {
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async (appointmentId: string) => {
    if (!onCancel) return;

    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      return;
    }

    setCancelling(appointmentId);
    setError(null);

    try {
      await onCancel(appointmentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar cita');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    const colors: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'bg-amber-100 text-amber-800',
      [AppointmentStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
      [AppointmentStatus.CONFIRMED]: 'bg-green-100 text-green-800',
      [AppointmentStatus.CHECK_IN]: 'bg-yellow-100 text-yellow-800',
      [AppointmentStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
      [AppointmentStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
      [AppointmentStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [AppointmentStatus.NO_SHOW]: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'Pendiente',
      [AppointmentStatus.SCHEDULED]: 'Programada',
      [AppointmentStatus.CONFIRMED]: 'Confirmada',
      [AppointmentStatus.CHECK_IN]: 'Check-in',
      [AppointmentStatus.IN_PROGRESS]: 'En Progreso',
      [AppointmentStatus.COMPLETED]: 'Completada',
      [AppointmentStatus.CANCELLED]: 'Cancelada',
      [AppointmentStatus.NO_SHOW]: 'No Mostrada',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-gray-600 font-medium">No hay citas registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clínica</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicios</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">{appointment.appointmentDate}</div>
                  <div className="text-gray-500">{appointment.appointmentTime}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.clinicId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.patientId || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {getStatusLabel(appointment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="text-xs text-gray-500">
                    {/* IMPL-20260120-12: Services count from appointment.serviceIds array */}
                    {appointment.serviceIds?.length || 0} servicio(s)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {appointment.status !== AppointmentStatus.CANCELLED && (
                    <>
                      {onCreateExpedient && appointment.status === AppointmentStatus.CHECK_IN && (
                        <button
                          onClick={() => onCreateExpedient(appointment.id, appointment.patientId)}
                          className="text-green-600 hover:text-green-800 font-medium px-2 py-1 bg-green-50 rounded hover:bg-green-100"
                          title="Create medical record from this appointment"
                        >
                          📋 Expediente
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(appointment)}
                          className="text-cyan-600 hover:text-cyan-800 font-medium"
                        >
                          Editar
                        </button>
                      )}
                      {onCancel && appointment.status !== AppointmentStatus.COMPLETED && (
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          disabled={cancelling === appointment.id}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        >
                          {cancelling === appointment.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
