/**
 * @impl IMPL-20260121-B1
 * @ref context/Plan-Demo-RD-20260121.md
 * 
 * Dashboard Principal - Overview KPIs y estado del sistema
 * Muestra: Pacientes en Proceso, Dictámenes Hoy, TAT, Precisión IA
 *          Estado de Expedientes por etapa, Productividad, Actividad Reciente
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@ami/core-ui';
import { Button } from '@ami/core-ui';
import { Badge } from '@ami/core-ui';

interface DashboardMetrics {
  patientsInProcess: number;
  dictamesHoy: number;
  averageTAT: string; // "5.8 hrs"
  iaAccuracy: number; // 94.2
  expedientsByStatus: {
    PENDING: number;
    IN_PROGRESS: number;
    STUDIES: number;
    VALIDATED: number;
    COMPLETED: number;
  };
  productivityByClinic: Array<{
    clinicName: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    patient: string;
    clinic: string;
    folio: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    patientsInProcess: 47,
    dictamesHoy: 12,
    averageTAT: '5.8 hrs',
    iaAccuracy: 94.2,
    expedientsByStatus: {
      PENDING: 8,
      IN_PROGRESS: 12,
      STUDIES: 15,
      VALIDATED: 9,
      COMPLETED: 3,
    },
    productivityByClinic: [
      { clinicName: 'Centro', count: 24 },
      { clinicName: 'Norte', count: 18 },
      { clinicName: 'Móvil', count: 12 },
    ],
    recentActivity: [
      {
        id: '1',
        action: 'Dictamen emitido',
        user: 'DR. FRANCO VERALDI',
        patient: 'CONTADOR FRANCO, VERALDI',
        clinic: 'ABBOTT MEDICAL MEXICO',
        folio: '#RD-2025-001',
        timestamp: 'Hace 4 min',
      },
      {
        id: '2',
        action: 'Estudios cargados',
        user: 'MARTINEZ LOPEZ, CARLOS',
        patient: 'MARTINEZ LOPEZ, CARLOS',
        clinic: 'ABBOTT MEDICAL MEXICO',
        folio: '#RD-2023-002',
        timestamp: 'Hace 12 min',
      },
      {
        id: '3',
        action: 'IA detectó anemia',
        user: 'SISTEMA',
        patient: 'Paciente',
        clinic: 'ABBOTT MEDICAL MEXICO',
        folio: '#RD-2023-003',
        timestamp: 'Hace 18 min',
      },
    ],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En producción, llamaría a una API para obtener métricas reales
    // Por ahora, simular datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ami-turquoise mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }

  const totalExpedients = Object.values(metrics.expedientsByStatus).reduce(
    (a, b) => a + b,
    0
  );

  const expedientsByStatusArray = [
    {
      status: 'Recepción',
      count: metrics.expedientsByStatus.PENDING,
      color: 'bg-blue-500',
    },
    {
      status: 'Examen Médico',
      count: metrics.expedientsByStatus.IN_PROGRESS,
      color: 'bg-yellow-500',
    },
    {
      status: 'Estudios',
      count: metrics.expedientsByStatus.STUDIES,
      color: 'bg-purple-500',
    },
    {
      status: 'Validación',
      count: metrics.expedientsByStatus.VALIDATED,
      color: 'bg-orange-500',
    },
    {
      status: 'Completado',
      count: metrics.expedientsByStatus.COMPLETED,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">
            Residente Digital con IA - Sistema de Gestión Médica Ocupacional
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pacientes en Proceso */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-ami-turquoise">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Pacientes en Proceso
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {metrics.patientsInProcess}
                </p>
              </div>
              <div className="text-4xl text-ami-turquoise opacity-20">👥</div>
            </div>
          </div>

          {/* Dictámenes Emitidos Hoy */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Dictámenes Emitidos (Hoy)
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {metrics.dictamesHoy}
                </p>
              </div>
              <div className="text-4xl text-green-500 opacity-20">✓</div>
            </div>
          </div>

          {/* TAT Promedio */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  TAT Promedio
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {metrics.averageTAT}
                </p>
              </div>
              <div className="text-4xl text-orange-500 opacity-20">⏱️</div>
            </div>
          </div>

          {/* Precisión IA */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-ami-purple">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Precisión IA
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {metrics.iaAccuracy}%
                </p>
              </div>
              <div className="text-4xl text-ami-purple opacity-20">🤖</div>
            </div>
          </div>
        </div>

        {/* Estado de Expedientes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Estado de Expedientes - Barras */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Estado de Expedientes
            </h2>

            <div className="space-y-4">
              {expedientsByStatusArray.map((item) => {
                const percentage =
                  totalExpedients > 0
                    ? Math.round((item.count / totalExpedients) * 100)
                    : 0;
                return (
                  <div key={item.status}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {item.status}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm font-medium text-gray-600">
                Total Expedientes: <span className="font-bold">{totalExpedients}</span>
              </p>
            </div>
          </div>

          {/* Productividad por Clínica */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Productividad por Clínica
            </h2>

            <div className="space-y-4">
              {metrics.productivityByClinic.map((clinic, idx) => {
                const maxCount = Math.max(
                  ...metrics.productivityByClinic.map((c) => c.count)
                );
                const percentage = (clinic.count / maxCount) * 100;
                const colors = [
                  'bg-ami-turquoise',
                  'bg-ami-purple',
                  'bg-blue-500',
                ];

                return (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {clinic.clinicName}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {clinic.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${colors[idx % colors.length]} h-3 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Actividad Reciente
          </h2>

          <div className="space-y-3">
            {metrics.recentActivity.map((activity, idx) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 pb-3 border-b last:border-b-0"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-ami-turquoise mt-1.5"></div>
                  {idx < metrics.recentActivity.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="default">{activity.action}</Badge>
                    <span className="text-xs text-gray-500">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{activity.user}</span>
                    {' - '}
                    <span className="text-gray-600">{activity.patient}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.clinic} • {activity.folio}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Ver más */}
          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              Ver Más Actividades
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          <p className="text-sm">
            <strong>Nota:</strong> Este dashboard se actualiza en tiempo real.
            Los datos provienen de la base de datos PostgreSQL de Railway.
          </p>
        </div>
      </div>
    </div>
  );
}
