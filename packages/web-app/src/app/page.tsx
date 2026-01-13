/**
 * Página inicial del dashboard
 * Updated: 2026-01-13 DATABASE_URL live
 */
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gradient-to-br from-slate-50 via-cyan-50 to-purple-50">
      <div className="w-full max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            AMI-SYSTEM v2.0
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Atención Médica Integrada - Residente Digital con IA
          </p>
          <p className="text-sm text-slate-500">
            FASE 0 – Cimientos completada | FASE 0.5 – Integración en progreso
          </p>
        </div>

        {/* Quick Access Card */}
        <div className="mb-12 bg-white rounded-xl shadow-xl p-8 border-l-4 border-cyan-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🚀 Comenzar</h2>
          <p className="text-slate-600 mb-6">
            Accede al panel de administración para gestionar clínicas, servicios y empresas.
          </p>
          <Link
            href="/admin/clinicas"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Ir al Admin Panel
          </Link>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-cyan-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3">
              <span className="text-2xl">✅</span>
              <h2 className="text-lg font-bold text-gray-900 ml-2">MOD-CLINICAS</h2>
            </div>
            <p className="text-sm text-gray-600">Schema + Service + UI Components</p>
            <p className="text-xs text-green-600 mt-2">FASE 0 – En Integración</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3">
              <span className="text-2xl">✅</span>
              <h2 className="text-lg font-bold text-gray-900 ml-2">MOD-SERVICIOS</h2>
            </div>
            <p className="text-sm text-gray-600">10 métodos + Multi-select UI</p>
            <p className="text-xs text-yellow-600 mt-2">FASE 0 – Próximamente</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-cyan-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3">
              <span className="text-2xl">✅</span>
              <h2 className="text-lg font-bold text-gray-900 ml-2">MOD-EMPRESAS</h2>
            </div>
            <p className="text-sm text-gray-600">11 métodos + Job Profiles</p>
            <p className="text-xs text-yellow-600 mt-2">FASE 0 – Próximamente</p>
          </div>
        </div>

        {/* Infrastructure Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">🔧 Estado de Infraestructura</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">PostgreSQL Setup</span>
              <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-semibold">Pendiente (GEMINI)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Firebase Auth</span>
              <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-semibold">Pendiente (GEMINI)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Web-app Integration</span>
              <span className="px-3 py-1 bg-blue-300 text-blue-900 rounded text-xs font-semibold">En Progreso (SOFIA)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
// Force Vercel rebuild without cache - Tue Jan 13 01:07:42 AM UTC 2026
