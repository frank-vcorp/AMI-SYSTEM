/**
 * 📑 PORTAL DE CLIENTES (RH) - LISTADO DE EXPEDIENTES
 * @impl ARCH-20260202-32
 * @author INTEGRA (Assistant)
 * 
 * Acceso directo a los resultados y certificados de los trabajadores.
 */

"use client";

import React, { useState } from 'react';
import { Button } from '@ami/core-ui';

export default function PortalExpedientes() {
    const [search, setSearch] = useState('');

    const expedientes = [
        { id: '1', name: 'Roberto Caicero Beltrán', amiId: 'AMI-CABE-700221-M-00', service: 'Ingreso Operativo', date: '2026-02-01', status: 'VALIDATED', result: 'APTO', folio: 'EXP-QRO-20260201-001' },
        { id: '2', name: 'Elena Villar Jiménez', amiId: 'AMI-VIJI-850512-F-00', service: 'Periódico Anual', date: '2026-01-28', status: 'VALIDATED', result: 'APTO C/R', folio: 'EXP-QRO-20260128-045' },
        { id: '3', name: 'Marcos Ruiz Esparza', amiId: 'AMI-RUES-920315-M-00', service: 'Especializado Alturas', date: '2026-02-02', status: 'IN_PROGRESS', result: '---', folio: 'EXP-QRO-20260202-012' },
        { id: '4', name: 'Adriana Luna Portillo', amiId: 'AMI-LUPO-881102-F-01', service: 'Cambio de Puesto', date: '2026-01-30', status: 'VALIDATED', result: 'APTO', folio: 'EXP-QRO-20260130-089' },
        { id: '5', name: 'Jorge Méndez Solís', amiId: 'AMI-MESO-740825-M-00', service: 'Seguimiento Crónico', date: '2026-01-25', status: 'VALIDATED', result: 'NO APTO', folio: 'EXP-QRO-20260125-021' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Sección */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Gestión de Expedientes</h1>
                    <p className="text-slate-500 font-medium">Consulte el estatus clínico y descargue certificados de su personal.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <input
                            type="text"
                            placeholder="Buscar por Nombre o AMI-ID..."
                            className="w-full bg-white border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-cyan-500 transition-all shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                </div>
            </div>

            {/* Grid de Filtros Rápidos */}
            <div className="flex flex-wrap gap-4">
                {['Todos', 'Finalizados', 'En Proceso', 'No Aptos', 'Especiales'].map((filter, i) => (
                    <button key={filter} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-cyan-200'}`}>
                        {filter}
                    </button>
                ))}
            </div>

            {/* Tabla de Resultados */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Colaborador e Identidad</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Servicio AMI</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estatus</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Veredicto</th>
                                <th className="px-10 py-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {expedientes.map((exp) => (
                                <tr key={exp.id} className="hover:bg-cyan-50/20 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors">
                                                {exp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-lg tracking-tight group-hover:text-cyan-700 transition-colors">{exp.name}</p>
                                                <p className="text-xs font-mono font-bold text-slate-400 mt-1">{exp.amiId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-bold text-slate-600">{exp.service}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Folio: {exp.folio}</p>
                                    </td>
                                    <td className="px-10 py-8 text-sm font-medium text-slate-500 italic">
                                        {exp.date}
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${exp.status === 'VALIDATED' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400 animate-pulse'
                                            }`}>
                                            {exp.status === 'VALIDATED' ? 'Verificado' : 'En Proceso'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-2 rounded-xl text-xs font-black ${exp.result === 'APTO' ? 'bg-green-500 text-white shadow-lg shadow-green-100' :
                                                exp.result === 'APTO C/R' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' :
                                                    exp.result === 'NO APTO' ? 'bg-red-500 text-white shadow-lg shadow-red-100' :
                                                        'bg-slate-100 text-slate-400'
                                            }`}>
                                            {exp.result}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        {exp.status === 'VALIDATED' && (
                                            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-cyan-600 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-50 transition-all" title="Descargar Certificado">
                                                <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400">Mostrando 5 de 1,248 expedientes</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>Anterior</button>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
