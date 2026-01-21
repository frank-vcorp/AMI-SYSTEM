/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * Admin Layout - Navigation sidebar with all modules
 */

import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-lg">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            AMI
          </h1>
          <p className="text-sm text-slate-400 mt-1">Sistema Médico Integral</p>
        </div>

        <nav className="p-4 space-y-2">
          {/* Dashboard */}
          <Link
            href="/admin"
            className="flex items-center px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>

          {/* Gestión Operativa */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2 mb-2">
              Gestión Operativa
            </h3>
            
            {/* Citas */}
            <Link
              href="/admin/citas"
              className="flex items-center px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Citas
            </Link>

            {/* Expedientes */}
            <Link
              href="/admin/expedientes"
              className="flex items-center px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Expedientes
            </Link>

            {/* Pacientes */}
            <Link
              href="/admin/pacientes"
              className="flex items-center px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Pacientes
            </Link>
          </div>

          {/* Catálogos */}
          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2 mb-2">
              Catálogos
            </h3>
            
            {/* Clínicas */}
            <Link
              href="/admin/clinicas"
              className="flex items-center px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Clínicas
            </Link>

            {/* Empresas */}
            <Link
              href="/admin/empresas"
              className="flex items-center px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
              </svg>
              Empresas
            </Link>

            {/* Servicios */}
            <Link
              href="/admin/servicios"
              className="flex items-center px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Servicios y Baterías
            </Link>
          </div>

          {/* Herramientas */}
          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2 mb-2">
              Herramientas
            </h3>
            
            {/* Upload */}
            <Link
              href="/admin/upload"
              className="flex items-center px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Carga de Archivos
            </Link>

            {/* Reportes */}
            <Link
              href="/admin/reportes"
              className="flex items-center px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reportes
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            AMI-SYSTEM v2.0
          </p>
          <p className="text-xs text-slate-500 mt-1">
            MVP Demo • INTEGRA Methodology
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
