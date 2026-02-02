/**
 * 🏢 PORTAL DE CLIENTES (RH) - LAYOUT PRINCIPAL
 * @impl ARCH-20260202-30
 * @author INTEGRA (Assistant)
 * 
 * Interfaz limpia y ejecutiva para los clientes corporativos de AMI.
 */

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Mock de Empresa Activa
    const activeCompany = {
        name: 'AutoSoluciones México S.A.',
        logo: 'AS',
        tenant: 'CDMX-01'
    };

    const menuItems = [
        { name: 'Dashboard', href: '/portal', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Expedientes', href: '/portal/expedientes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Citas y Altas', href: '/portal/citas', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Facturación', href: '/portal/facturacion', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-screen sticky top-0 shadow-sm">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-200">
                            {activeCompany.logo}
                        </div>
                        <div>
                            <h1 className="font-black text-slate-800 tracking-tighter text-lg leading-tight">AMI PORTAL</h1>
                            <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest leading-none">RH Excellence</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all ${pathname === item.href
                                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                            RH
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-slate-800 truncate">{activeCompany.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Cliente Corporativo</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Header Mobile */}
            <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                        {activeCompany.logo}
                    </div>
                    <h1 className="font-black text-slate-800 tracking-tighter">AMI PORTAL</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
