/**
 * 📊 PORTAL DE CLIENTES (RH) - DASHBOARD
 * @impl ARCH-20260202-31
 * @author INTEGRA (Assistant)
 * 
 * Visión estratégica para el área de RH.
 */

"use client";

import React from 'react';
import { Card } from '@ami/core-ui';

export default function PortalDashboard() {
    const stats = [
        { label: 'Colaboradores Atendidos', value: '1,248', change: '+12%', color: 'bg-cyan-500' },
        { label: 'Exámenes en Proceso', value: '42', change: '8 pendientes', color: 'bg-amber-500' },
        { label: 'Certificados Listos', value: '1,206', change: '100% verificado', color: 'bg-green-500' },
        { label: 'Índice de Aptitud', value: '94.2%', change: '+0.5% vs dic', color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Saludo y Headlight */}
            <section className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
                    <div className="space-y-4">
                        <span className="bg-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-cyan-500/30">
                            Resumen Ejecutivo Feb 2026
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                            Hola, RH Team <br />
                            <span className="text-cyan-400">AutoSoluciones</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md font-medium">
                            Su fuerza de trabajo está siendo monitoreada bajo los más altos estándares clínicos de AMI.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all">
                            Descargar Corte Mensual
                        </button>
                    </div>
                </div>

                {/* Abstract shapes for premium feel */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full -ml-10 -mb-10"></div>
            </section>

            {/* Grid de KPIs */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className={`w-12 h-12 ${stat.color} rounded-2xl mb-6 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform`}></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                        <p className="text-[10px] font-black text-cyan-600 mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            {stat.change}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </p>
                    </div>
                ))}
            </section>

            {/* Secciones de Datos */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xl font-bold text-slate-800">Resultados Recientes</h3>
                        <button className="text-cyan-600 text-xs font-black uppercase tracking-widest hover:underline">Ver todos</button>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Servicio</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estatus</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dictamen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[
                                    { name: 'Roberto Caicero', service: 'Ingreso Operativo', status: 'Finalizado', fit: 'APTO', color: 'text-green-600 bg-green-50' },
                                    { name: 'Elena Villar', service: 'Periódico Anual', status: 'Finalizado', fit: 'APTO C/R', color: 'text-amber-600 bg-amber-50' },
                                    { name: 'Marcos Ruiz', service: 'Ingreso Administrativo', status: 'Validando', fit: 'PENDIENTE', color: 'text-slate-400 bg-slate-50' },
                                    { name: 'Sofía Castro', service: 'Especializado Alturas', status: 'Finalizado', fit: 'APTO', color: 'text-green-600 bg-green-50' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">{row.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">AMI-ID: AS-2026-00{i + 1}</p>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-slate-500 font-medium">{row.service}</td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500">{row.status}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right lg:text-left">
                                            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${row.color}`}>
                                                {row.fit}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Mini-Analítica */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-800 px-2">Análisis de Perfil</h3>
                    <Card className="p-8 rounded-[2rem] border-slate-100 shadow-sm space-y-8">
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Distribución de Aptitud</p>
                                <p className="text-xl font-black text-slate-800">94% <span className="text-[10px] text-green-500 font-bold">OPTIMO</span></p>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                <div className="h-full bg-green-500" style={{ width: '85%' }}></div>
                                <div className="h-full bg-amber-500" style={{ width: '10%' }}></div>
                                <div className="h-full bg-red-400" style={{ width: '5%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hallazgos Frecuentes</p>
                            {[
                                { label: 'Hipertensión G1', count: 12, color: 'bg-amber-100 text-amber-600' },
                                { label: 'Sobrepeso', count: 45, color: 'bg-cyan-100 text-cyan-600' },
                                { label: 'Agudeza Visual', count: 8, color: 'bg-purple-100 text-purple-600' },
                            ].map(h => (
                                <div key={h.label} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                    <span className="text-sm font-bold text-slate-700">{h.label}</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${h.color}`}>{h.count} casos</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
}
