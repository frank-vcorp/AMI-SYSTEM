/**
 * Página inicial del dashboard
 * Updated: 2026-01-16 Auth Flow Implementation
 */
'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Esperar a que el componente se monte en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gradient-to-br from-slate-50 via-cyan-50 to-purple-50">
      <div className="w-full max-w-5xl">
        {/* Header con Auth Status */}
        <div className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              AMI-SYSTEM v2.0
            </h1>
            <p className="text-xl text-slate-600">Atención Médica Integrada - Residente Digital con IA</p>
          </div>
          {isAuthenticated && !loading && (
            <div className="text-right">
              <p className="text-sm text-slate-600">Bienvenido,</p>
              <p className="text-lg font-semibold text-slate-900">{user?.email || 'Usuario'}</p>
            </div>
          )}
        </div>

        {/* Quick Access Card */}
        <div className="mb-12 bg-white rounded-xl shadow-xl p-8 border-l-4 border-cyan-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🚀 Comenzar</h2>
          <p className="text-slate-600 mb-6">
            {isAuthenticated
              ? 'Accede al panel de administración para gestionar clínicas, servicios y empresas.'
              : 'Inicia sesión para acceder al panel de administración.'}
          </p>
          <div className="flex gap-4">
            {isAuthenticated && !loading ? (
              <Link
                href="/admin/clinicas"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ir al Admin Panel
              </Link>
            ) : loading ? (
              <button disabled className="inline-flex items-center px-6 py-3 bg-slate-300 text-slate-600 font-semibold rounded-lg cursor-not-allowed">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cargando...
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2m14-4V7a2 2 0 00-2-2H7a2 2 0 00-2 2v2" />
                </svg>
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-cyan-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3">
              <span className="text-2xl">✅</span>
              <h2 className="text-lg font-bold text-gray-900 ml-2">MOD-CLINICAS</h2>
            </div>
            <p className="text-sm text-gray-600">Schema + Service + UI Components</p>
            <p className="text-xs text-green-600 mt-2">FASE 0 – Completada</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3">
              <span className="text-2xl">✅</span>
              <h2 className="text-lg font-bold text-gray-900 ml-2">MOD-SERVICIOS</h2>
            </div>
            <p className="text-sm text-gray-600">10 métodos + Multi-select UI</p>
            <p className="text-xs text-green-600 mt-2">FASE 0 – Completada</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-cyan-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3">
              <span className="text-2xl">✅</span>
              <h2 className="text-lg font-bold text-gray-900 ml-2">MOD-EMPRESAS</h2>
            </div>
            <p className="text-sm text-gray-600">11 métodos + Job Profiles</p>
            <p className="text-xs text-green-600 mt-2">FASE 0 – Completada</p>
          </div>
        </div>

        {/* Authentication Status */}
        <div className={`rounded-lg p-6 mb-6 ${isAuthenticated ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isAuthenticated ? 'text-green-900' : 'text-blue-900'}`}>
            🔐 Estado de Autenticación
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className={isAuthenticated ? 'text-green-800' : 'text-blue-800'}>Firebase Client SDK</span>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${isAuthenticated ? 'bg-green-200 text-green-800' : 'bg-blue-300 text-blue-900'}`}>
                {isAuthenticated ? '✓ Integrado' : 'En Progreso'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isAuthenticated ? 'text-green-800' : 'text-blue-800'}>Auth Context (useAuth Hook)</span>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${isAuthenticated ? 'bg-green-200 text-green-800' : 'bg-blue-300 text-blue-900'}`}>
                {isAuthenticated ? '✓ Integrado' : 'En Progreso'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isAuthenticated ? 'text-green-800' : 'text-blue-800'}>Login Page</span>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${isAuthenticated ? 'bg-green-200 text-green-800' : 'bg-blue-300 text-blue-900'}`}>
                {isAuthenticated ? '✓ Integrado' : 'Disponible'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isAuthenticated ? 'text-green-800' : 'text-blue-800'}>Route Protection (Middleware)</span>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${isAuthenticated ? 'bg-green-200 text-green-800' : 'bg-blue-300 text-blue-900'}`}>
                {isAuthenticated ? '✓ Integrado' : 'En Progreso'}
              </span>
            </div>
          </div>
        </div>

        {/* Infrastructure Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">🔧 Estado de Infraestructura</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">PostgreSQL Setup</span>
              <span className="px-3 py-1 bg-green-200 text-green-800 rounded text-xs font-semibold">✓ LIVE (Railway)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Firebase Auth</span>
              <span className="px-3 py-1 bg-blue-300 text-blue-900 rounded text-xs font-semibold">En Configuración</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Web-app Auth Integration</span>
              <span className="px-3 py-1 bg-green-200 text-green-800 rounded text-xs font-semibold">✓ Completada</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
