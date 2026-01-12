/**
 * /admin layout
 * Provides navigation and structure for admin section
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
          <p className="text-sm text-slate-400 mt-1">Admin Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          {/* FASE 0 Modules */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2 mb-2">
              FASE 0 – Cimientos
            </h3>
            {/* MOD-CLINICAS */}
            <Link
              href="/admin/clinicas"
              className="flex items-center px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              </svg>
              Clínicas
            </Link>

            {/* MOD-CITAS */}
            <Link
              href="/admin/citas"
              className="flex items-center px-4 py-2 rounded-lg text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Citas
            </Link>

            {/* MOD-SERVICIOS (Coming Soon) */}
            <Link
              href="/admin/servicios"
              className="flex items-center px-4 py-2 rounded-lg text-slate-400 opacity-50 cursor-not-allowed"
              title="Coming Soon"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Servicios
              <span className="ml-auto text-xs bg-yellow-600 px-2 py-0.5 rounded">Soon</span>
            </Link>

            {/* MOD-EMPRESAS (Coming Soon) */}
            <Link
              href="/admin/empresas"
              className="flex items-center px-4 py-2 rounded-lg text-slate-400 opacity-50 cursor-not-allowed"
              title="Coming Soon"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
              </svg>
              Empresas
              <span className="ml-auto text-xs bg-yellow-600 px-2 py-0.5 rounded">Soon</span>
            </Link>
          </div>

          {/* FASE 1+ Modules */}
          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2 mb-2">
              FASE 1+ (Próximamente)
            </h3>
            <p className="text-xs text-slate-500 px-3 py-2">
              Expedientes, Validación IA, Reportes...
            </p>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            FASE 0.5 – Integración
          </p>
          <p className="text-xs text-slate-500 mt-1">
            v2.0 | INTEGRA Methodology
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
