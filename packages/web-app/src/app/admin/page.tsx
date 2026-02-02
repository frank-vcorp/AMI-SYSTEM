'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@ami/core-ui';
import { Badge } from '@ami/core-ui';
import { Card, CardHeader, CardTitle, CardContent } from '@ami/core-ui';

interface DashboardMetrics {
  patientsInProcess: number;
  dictamesHoy: number;
  averageTAT: string;
  iaAccuracy: number;
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
    status: 'success' | 'warning' | 'info' | 'error';
  }>;
}

export default function AdminDashboard() {
  const [metrics] = useState<DashboardMetrics>({
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
        patient: 'CONTADOR FRANCO, YERALDIN',
        clinic: 'ABBOTT MEDICAL MEXICO',
        folio: '#RD-2025-001',
        timestamp: 'Hace 4 min',
        status: 'success'
      },
      {
        id: '1.5',
        action: 'IA detectó anemia',
        user: 'SISTEMA RD-AMI',
        patient: 'JUAREZ GARCIA, MARIA',
        clinic: 'CENTRO MEDICO NORTE',
        folio: '#RD-2025-042',
        timestamp: 'Hace 8 min',
        status: 'error'
      },
      {
        id: '2',
        action: 'Estudios cargados',
        user: 'ENF. LUCIA ROSALES',
        patient: 'MARTINEZ LOPEZ, CARLOS',
        clinic: 'CLINICA MOVIL 1',
        folio: '#RD-2025-002',
        timestamp: 'Hace 12 min',
        status: 'info'
      },
      {
        id: '3',
        action: 'Paciente en Check-in',
        user: 'RECEPCIÓN',
        patient: 'ORTEGA RUIZ, PEDRO',
        clinic: 'SEDE CENTRAL',
        folio: '#RD-2025-089',
        timestamp: 'Hace 18 min',
        status: 'info'
      },
    ],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-inter">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto"></div>
          <p className="text-slate-600 font-medium">Sincronizando Residente Digital...</p>
        </div>
      </div>
    );
  }

  const totalExpedients = Object.values(metrics.expedientsByStatus).reduce((a, b) => a + b, 0);

  const expedientsByStatusArray = [
    { status: 'Recepción', count: metrics.expedientsByStatus.PENDING, color: 'bg-clinical-info' },
    { status: 'Examen Médico', count: metrics.expedientsByStatus.IN_PROGRESS, color: 'bg-clinical-warning' },
    { status: 'Estudios (SIM/NOVA)', count: metrics.expedientsByStatus.STUDIES, color: 'bg-ami-purple' },
    { status: 'Validación IA', count: metrics.expedientsByStatus.VALIDATED, color: 'bg-clinical-info' },
    { status: 'Dictamen Final', count: metrics.expedientsByStatus.COMPLETED, color: 'bg-clinical-success' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-inter">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Top Navigation / Stats Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
          <div>
            <Badge variant="info" className="mb-3">Sistema de Gestión Médica</Badge>
            <h1 className="text-4xl font-outfit font-bold text-slate-900 tracking-tight">Dashboard General</h1>
            <p className="text-slate-500 mt-1 max-w-xl text-balance">
              Panel de control operativo para el Residente Digital con IA. Monitoreo de flujo de pacientes y precisión diagnóstica.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-200 text-slate-600">Reporte Diario</Button>
            <Button className="btn-primary shadow-premium">Exportar Data</Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="premium" className="overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Pacientes en Proceso</p>
                  <p className="text-4xl font-outfit font-bold text-slate-900 leading-none">{metrics.patientsInProcess}</p>
                </div>
                <div className="p-3 bg-medical-50 text-medical-500 rounded-xl group-hover:bg-medical-500 group-hover:text-white transition-colors duration-300">
                  <span className="text-xl">👥</span>
                </div>
              </div>
              <p className="text-clinical-success text-xs font-semibold mt-4 flex items-center gap-1">
                ↑ +12% <span className="text-slate-400 font-normal">vrs. ayer</span>
              </p>
            </CardContent>
          </Card>

          <Card variant="premium" className="overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Dictámenes (Hoy)</p>
                  <p className="text-4xl font-outfit font-bold text-slate-900 leading-none">{metrics.dictamesHoy}</p>
                </div>
                <div className="p-3 bg-green-50 text-clinical-success rounded-xl group-hover:bg-clinical-success group-hover:text-white transition-colors duration-300">
                  <span className="text-xl">📄</span>
                </div>
              </div>
              <p className="text-clinical-success text-xs font-semibold mt-4 flex items-center gap-1">
                85% <span className="text-slate-400 font-normal">de la meta diaria</span>
              </p>
            </CardContent>
          </Card>

          <Card variant="premium" className="overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">TAT Promedio</p>
                  <p className="text-4xl font-outfit font-bold text-slate-900 leading-none">{metrics.averageTAT}</p>
                </div>
                <div className="p-3 bg-amber-50 text-clinical-warning rounded-xl group-hover:bg-clinical-warning group-hover:text-white transition-colors duration-300">
                  <span className="text-xl">⏱️</span>
                </div>
              </div>
              <p className="text-clinical-error text-xs font-semibold mt-4 flex items-center gap-1">
                +1.2h <span className="text-slate-400 font-normal">vrs. meta</span>
              </p>
            </CardContent>
          </Card>

          <Card variant="premium" className="overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Precisión IA</p>
                  <p className="text-4xl font-outfit font-bold text-slate-900 leading-none">{metrics.iaAccuracy}%</p>
                </div>
                <div className="p-3 bg-purple-50 text-ami-purple rounded-xl group-hover:bg-ami-purple group-hover:text-white transition-colors duration-300">
                  <span className="text-xl">🤖</span>
                </div>
              </div>
              <p className="text-clinical-success text-xs font-semibold mt-4 flex items-center gap-1">
                ↑ +0.4% <span className="text-slate-400 font-normal">vrs. semana pasada</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Visual Charts & State Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Operations Funnel */}
          <Card variant="premium" className="lg:col-span-2 overflow-hidden border-none glass-card">
            <CardHeader className="bg-slate-50/50">
              <CardTitle>Flujo Operacional del Paciente</CardTitle>
              <p className="text-xs text-slate-500">Distribución de expedientes por etapa del proceso digital.</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {expedientsByStatusArray.map((item) => {
                  const percentage = totalExpedients > 0 ? Math.round((item.count / totalExpedients) * 100) : 0;
                  return (
                    <div key={item.status} className="relative group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-slate-700">{item.status}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{item.count}</span>
                          <span className="text-xs text-slate-400 font-medium">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out shadow-sm`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center text-slate-500 text-sm">
                <span className="font-medium">Total en flujo activo: <span className="text-slate-900 font-bold ml-1">{totalExpedients}</span></span>
                <span className="text-xs">Ultima actualización: 2 min ago</span>
              </div>
            </CardContent>
          </Card>

          {/* Productivity / Performance Card */}
          <Card variant="premium" className="bg-slate-900 text-white border-none shadow-2xl">
            <CardHeader className="border-slate-800">
              <CardTitle className="text-white">Rendimiento por Sede</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8 mt-4">
                {metrics.productivityByClinic.map((clinic, idx) => {
                  const maxCount = Math.max(...metrics.productivityByClinic.map((c) => c.count));
                  const percentage = (clinic.count / maxCount) * 100;
                  return (
                    <div key={idx} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-medical-400' : 'bg-slate-500'}`}></div>
                          <span className="text-sm font-medium text-slate-300">{clinic.clinicName}</span>
                        </div>
                        <span className="text-sm font-bold">{clinic.count} <span className="text-slate-500 font-normal">certs</span></span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className={`bg-gradient-to-r from-medical-500 to-medical-400 h-full rounded-full transition-all duration-700`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  💡 <span className="text-slate-200">Tip Operativo:</span> La sede "Centro" está operando al 95% de su capacidad. Considere derivar a "Norte".
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Feed / Recent Activity */}
        <div className="grid grid-cols-1 gap-8">
          <Card variant="premium" className="glass-card overflow-hidden">
            <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle>Actividad del Sistema en Tiempo Real</CardTitle>
                <p className="text-xs text-slate-500">Log detallado de acciones médicas, administrativas e IA.</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs">Filtros Avanzados</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {metrics.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border 
                      ${activity.status === 'success' ? 'bg-clinical-success/10 text-clinical-success border-clinical-success/10' :
                        activity.status === 'error' ? 'bg-clinical-error/10 text-clinical-error border-clinical-error/10' :
                          'bg-clinical-info/10 text-clinical-info border-clinical-info/10'}`}>
                      {activity.status === 'error' ? '🚨' : activity.action.includes('Dictamen') ? '🖋️' : '📑'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-medical-600 transition-colors">
                          {activity.action}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{activity.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <span className="font-bold text-slate-700">{activity.user}</span>
                        <span className="text-slate-300">•</span>
                        <span>Paciente: {activity.patient}</span>
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          🏢 {activity.clinic}
                        </span>
                        <span className="text-[10px] font-bold text-medical-600 bg-medical-50 px-2 py-0.5 rounded-full">
                          {activity.folio}
                        </span>
                      </div>
                    </div>

                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-medical-500">
                      <span className="text-xl">→</span>
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
              <Button variant="link" className="text-medical-600 font-bold text-xs uppercase tracking-widest">
                Ver historial de auditoría completo
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
