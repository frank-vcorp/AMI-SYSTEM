/**
 * ⚙️ IMPL REFERENCE: IMPL-20260202-LAYOUT-FIX
 * 📄 SEE: context/RD/index.html (The Truth)
 * 🤖 AUTHOR: SOFIA (Builder)
 * 
 * Admin Layout - RESKIN COMPLETO
 * Reemplazando Sidebar vertical con Header Horizontal + Tabs
 * para coincidir 100% con el diseño Mock.
 */

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Función helper para clases de tabs activas
  // En mock: border-b-2 border-ami-blue text-ami-blue
  // Inactiva: border-b-2 border-transparent text-gray-500 hover:text-gray-700
  const getTabClass = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(`${path}/`);
    return isActive
      ? "flex items-center space-x-2 py-4 px-1 border-b-2 border-ami-blue text-ami-blue font-medium text-sm whitespace-nowrap"
      : "flex items-center space-x-2 py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm whitespace-nowrap";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* 
        ========================================
        HEADER (Idéntico visualmente al Mock)
        ========================================
      */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Logo AMI (Simulado con Texto/Icono si no hay imagen) */}
              <div className="flex items-center space-x-3">
                {/* <img src="logo-ami.png" alt="AMI" class="h-12 w-auto"> (Reemplazo con placeholder SVG estilizado) */}
                <div className="w-10 h-10 bg-gradient-to-br from-ami-turquoise to-ami-blue rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
                  A
                </div>
                <div className="border-l border-gray-300 pl-3">
                  <h1 className="text-xl font-bold text-ami-purple">RD-AMI</h1>
                  <p className="text-xs text-ami-turquoise font-medium">Residente Digital con IA</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="font-medium">Usuario: <span className="text-ami-blue">Dra. Ana López</span></span>
              <span className="text-gray-300">|</span>
              <span id="fechaActual">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 
        ========================================
        NAVIGATION TABS (Horizontal Scroll)
        ========================================
      */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto no-scrollbar">
            {/* 1. Dashboard */}
            <Link href="/admin" className={getTabClass('/admin')}>
              <i className="fas fa-chart-dashboard"></i>
              <span>Dashboard</span>
            </Link>

            {/* 2. Recepción (Agenda y Check-in) */}
            <Link href="/admin/citas" className={getTabClass('/admin/citas')}>
              <i className="fas fa-clipboard-list"></i>
              <span>Recepción</span>
            </Link>

            {/* 3. Examen Médico */}
            <Link href="/admin/expedientes?status=CHECKED_IN" className={getTabClass('/admin/examen')}>
              <i className="fas fa-stethoscope"></i>
              <span>Examen Médico</span>
            </Link>

            {/* 4. Estudios (Carga) */}
            <Link href="/admin/expedientes?status=AWAITING_STUDIES" className={getTabClass('/admin/expedientes')}>
              <i className="fas fa-upload"></i>
              <span>Estudios</span>
            </Link>

            {/* 5. Validación */}
            <Link href="/admin/validaciones" className={getTabClass('/admin/validaciones')}>
              <i className="fas fa-user-md"></i>
              <span>Validación</span>
            </Link>

            {/* 6. Reportes */}
            <Link href="/admin/reportes" className={getTabClass('/admin/reportes')}>
              <i className="fas fa-file-pdf"></i>
              <span>Reportes</span>
            </Link>

            {/* 7. Empresas */}
            <Link href="/admin/empresas" className={getTabClass('/admin/empresas')}>
              <i className="fas fa-building"></i>
              <span>Empresas</span>
            </Link>

            {/* 8. Expedientes (Principal) */}
            <Link href="/admin/expedientes" className={getTabClass('/admin/expedientes-master')}>
              <i className="fas fa-folder-open"></i>
              <span>Expedientes</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 
        ========================================
        MAIN CONTENT
        ========================================
      */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
