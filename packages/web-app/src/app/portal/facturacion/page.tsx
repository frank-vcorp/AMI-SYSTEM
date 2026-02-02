/**
 * 🧾 PORTAL DE CLIENTES (RH) - FACTURACIÓN Y PAGOS
 * @impl ARCH-20260202-34
 * @author INTEGRA (Assistant)
 * 
 * Gestión financiera transparente para clientes corporativos.
 */

"use client";

import React from 'react';
import { Card } from '@ami/core-ui';

export default function PortalFacturacion() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Facturación y Pagos</h1>
                <p className="text-slate-500 font-medium">Consulte sus CFDI, estados de cuenta y saldos pendientes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tarjeta de Saldo */}
                <Card className="lg:col-span-1 p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-slate-300">
                    <div className="relative z-10 space-y-8">
                        <div className="space-y-1">
                            <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em]">Saldo Pendiente</p>
                            <h2 className="text-5xl font-black tracking-tighter">$42,500.00 <span className="text-xl font-medium opacity-50">MXN</span></h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Próximo Vencimiento</span>
                                <span className="font-bold">15 Feb, 2026</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Total Mes Anterior</span>
                                <span className="font-bold underline">$128,400.00</span>
                            </div>
                        </div>
                        <button className="w-full py-5 bg-cyan-500 text-slate-900 text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-cyan-900/50 hover:scale-[1.02] transition-all">Pagar Ahora</button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[60px] rounded-full -mr-20 -mt-20"></div>
                </Card>

                {/* Lista de Facturas */}
                <div className="lg:col-span-2 space-y-4">
                    {[
                        { folio: 'A-2489', date: '01 Feb 2026', amount: '$12,400.00', status: 'PAID' },
                        { folio: 'A-2342', date: '15 Ene 2026', amount: '$85,200.00', status: 'PAID' },
                        { folio: 'A-2120', date: '01 Ene 2026', amount: '$43,200.00', status: 'PAID' },
                        { folio: 'A-1980', date: '15 Dic 2025', amount: '$12,500.00', status: 'PAID' },
                    ].map((f, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-cyan-200 transition-all hover:shadow-lg hover:shadow-slate-100/50">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 tracking-tight group-hover:text-cyan-700 transition-colors">Factura {f.folio}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <p className="text-lg font-black text-slate-800 italic">{f.amount}</p>
                                <button className="p-2 text-slate-300 hover:text-cyan-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all">Ver Historial Completo</button>
                </div>
            </div>
        </div>
    );
}
