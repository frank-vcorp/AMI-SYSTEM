'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * IMPL-20260122-03: Appointments List Component
 * Display clinic appointments with occupancy tracking
 */

interface Appointment {
  id: string;
  appointmentFolio: string;
  status: string;
  scheduledAt: string;
  patient?: {
    name: string;
  };
  clinic?: {
    name: string;
  };
  occupancySlot?: number;
  maxOccupancy?: number;
}

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('CHECK_IN');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/citas?status=${filter}`);

      if (!response.ok) {
        throw new Error('Failed to load appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'CHECK_IN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyColor = (occupancy: number | undefined, max: number | undefined) => {
    if (!occupancy || !max) return 'bg-gray-50';
    const percentage = (occupancy / max) * 100;
    if (percentage >= 80) return 'bg-red-50';
    if (percentage >= 50) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
        <button
          onClick={fetchAppointments}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {['CHECK_IN', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'CHECK_IN'
              ? 'Check-In'
              : status === 'IN_PROGRESS'
                ? 'En Curso'
                : 'Completadas'}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Papeleta</th>
              <th className="px-4 py-3 text-left font-semibold">Paciente</th>
              <th className="px-4 py-3 text-left font-semibold">Clínica</th>
              <th className="px-4 py-3 text-left font-semibold">Hora</th>
              <th className="px-4 py-3 text-left font-semibold">Estado</th>
              <th className="px-4 py-3 text-left font-semibold">Ocupancia</th>
              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay citas en este estado
                </td>
              </tr>
            ) : (
              appointments.map((apt) => (
                <tr key={apt.id} className={`border-b hover:bg-gray-50 transition ${getOccupancyColor(apt.occupancySlot, apt.maxOccupancy)}`}>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">
                    {apt.appointmentFolio}
                  </td>
                  <td className="px-4 py-3">{apt.patient?.name || 'N/A'}</td>
                  <td className="px-4 py-3">{apt.clinic?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(apt.scheduledAt).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: apt.maxOccupancy
                              ? `${(((apt.occupancySlot || 0) / apt.maxOccupancy) * 100).toFixed(0)}%`
                              : '0%',
                            backgroundColor:
                              apt.occupancySlot && apt.maxOccupancy
                                ? ((apt.occupancySlot / apt.maxOccupancy) * 100) >= 80
                                  ? '#dc2626'
                                  : ((apt.occupancySlot / apt.maxOccupancy) * 100) >= 50
                                    ? '#eab308'
                                    : '#22c55e'
                                : '#9ca3af',
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {apt.occupancySlot || 0}/{apt.maxOccupancy || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/appointments/${apt.id}/check-in`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Procesar →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">
            {appointments.filter((a) => a.status === 'CHECK_IN').length}
          </div>
          <div className="text-sm text-blue-600">Check-In</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-700">
            {appointments.filter((a) => a.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-sm text-yellow-600">En Curso</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">
            {appointments.filter((a) => a.status === 'COMPLETED').length}
          </div>
          <div className="text-sm text-green-600">Completadas</div>
        </div>
      </div>
    </div>
  );
}
