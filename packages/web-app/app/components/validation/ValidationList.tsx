'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * IMPL-20260122-02: Validation Tasks List Component
 * Displays pending validation tasks for medical exams
 */

interface ValidationTask {
  id: string;
  expedientId: string;
  status: string;
  verdict?: string;
  diagnosis?: string;
  expedient?: {
    folio: string;
    patient?: {
      name: string;
    };
    clinic?: {
      name: string;
    };
  };
  createdAt: string;
  startedAt?: string;
}

export function ValidationList() {
  const [tasks, setTasks] = useState<ValidationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('PENDING');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/validaciones?status=${filter}`);

      if (!response.ok) {
        throw new Error('Failed to load validation tasks');
      }

      const data = await response.json();
      setTasks(data.validationTasks || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_REVIEW':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerdictBadgeColor = (verdict?: string) => {
    switch (verdict) {
      case 'APTO':
        return 'bg-green-100 text-green-800';
      case 'APTO_CON_RESTRICCIONES':
        return 'bg-yellow-100 text-yellow-800';
      case 'NO_APTO':
        return 'bg-red-100 text-red-800';
      case 'REFERENCIA':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          onClick={fetchTasks}
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
        {['PENDING', 'ASSIGNED', 'IN_REVIEW', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'PENDING'
              ? 'Pendientes'
              : status === 'ASSIGNED'
                ? 'Asignadas'
                : status === 'IN_REVIEW'
                  ? 'En Revisión'
                  : 'Completadas'}
          </button>
        ))}
      </div>

      {/* Tabla de tareas */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Folio Expediente</th>
              <th className="px-4 py-3 text-left font-semibold">Paciente</th>
              <th className="px-4 py-3 text-left font-semibold">Clínica</th>
              <th className="px-4 py-3 text-left font-semibold">Estado</th>
              <th className="px-4 py-3 text-left font-semibold">Veredicto</th>
              <th className="px-4 py-3 text-left font-semibold">Creada</th>
              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay tareas de validación en este estado
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono">{task.expedient?.folio || task.expedientId}</td>
                  <td className="px-4 py-3">{task.expedient?.patient?.name || 'N/A'}</td>
                  <td className="px-4 py-3">{task.expedient?.clinic?.name || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {task.verdict ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVerdictBadgeColor(task.verdict)}`}>
                        {task.verdict === 'APTO_CON_RESTRICCIONES'
                          ? 'APTO C/ RESTRICT.'
                          : task.verdict}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(task.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/validation/${task.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-700">
            {tasks.filter((t) => t.status === 'PENDING').length}
          </div>
          <div className="text-sm text-yellow-600">Pendientes</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">
            {tasks.filter((t) => t.status === 'ASSIGNED').length}
          </div>
          <div className="text-sm text-blue-600">Asignadas</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-700">
            {tasks.filter((t) => t.status === 'IN_REVIEW').length}
          </div>
          <div className="text-sm text-purple-600">En Revisión</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">
            {tasks.filter((t) => t.status === 'COMPLETED').length}
          </div>
          <div className="text-sm text-green-600">Completadas</div>
        </div>
      </div>
    </div>
  );
}
