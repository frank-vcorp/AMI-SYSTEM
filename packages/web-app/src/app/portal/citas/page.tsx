/**
 * 📅 PORTAL DE CLIENTES (RH) - CITAS Y AGENDAMIENTO
 * @impl ARCH-20260202-33
 * @author INTEGRA (Assistant)
 * 
 * Herramientas de programación y altas para el equipo de RH.
 */

"use client";

import React, { useState } from 'react';
import { Button, Card } from '@ami/core-ui';

export default function PortalCitas() {
    const [activeView, setActiveView] = useState<'lista' | 'agenda'>('agenda');

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Agenda Corporativa</h1>
                    <p className="text-slate-500 font-medium italic">Gestione el flujo de ingresos y periódicos de su equipo.</p>
                </div>
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <Button className="flex-1 md:flex-none py-4 px-8 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-200 hover:scale-105 transition-all flex items-center justify-center gap-3 group">
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span>Programar Nueva Cita</span>
                    </Button>
                    <Button className="flex-1 md:flex-none py-4 px-8 bg-cyan-500 text-slate-900 rounded-2xl shadow-xl shadow-cyan-100 font-black hover:scale-105 transition-all text-xs flex items-center justify-center gap-3 group">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span>Alta de Personal (Excel)</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Sidebar de Sucursales y Disponibilidad */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Disponibilidad en Sedes</h3>
                    {[
                        { name: 'AMI - El Marqués', status: 'Alta Demanda', color: 'bg-red-500', availability: '20%' },
                        { name: 'AMI - Paseo del Prado', status: 'Disponible', color: 'bg-green-500', availability: '85%' },
                        { name: 'AMI - Koonol', status: 'Media', color: 'bg-amber-500', availability: '60%' },
                    ].map(sede => (
                        <div key={sede.name} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:border-cyan-200 transition-colors group cursor-pointer">
                            <div className="flex justify-between items-start">
                                <p className="font-bold text-slate-800 group-hover:text-cyan-600 transition-colors leading-tight">{sede.name}</p>
                                <div className={`w-2 h-2 rounded-full ${sede.color} animate-pulse`}></div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                    <span>Cupo General</span>
                                    <span>{sede.availability}</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${sede.color}`} style={{ width: sede.availability }}></div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="p-8 bg-cyan-900 rounded-[2rem] text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-2">Protocolo Empresas</h4>
                            <p className="text-sm font-medium leading-relaxed opacity-80">Recuerde que los ingresos operativos requieren 24h de anticipación para garantizar disponibilidad.</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Calendario / Lista de Citas */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 overflow-hidden">
                        <div className="flex justify-between items-center mb-10 px-4">
                            <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl">
                                <button onClick={() => setActiveView('agenda')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'agenda' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Agenda</button>
                                <button onClick={() => setActiveView('lista')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'lista' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Vista Lista</button>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-slate-600">Febrero 2026</span>
                                <div className="flex gap-1">
                                    <button className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                                    <button className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                                </div>
                            </div>
                        </div>

                        {activeView === 'agenda' ? (
                            <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden animate-in zoom-in duration-300">
                                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                                    <div key={d} className="bg-slate-50 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                                ))}
                                {Array.from({ length: 35 }).map((_, i) => {
                                    const day = i - 4;
                                    const isToday = day === 2;
                                    const hasCitas = [2, 5, 8, 12, 15].includes(day);
                                    return (
                                        <div key={i} className="bg-white min-h-[120px] p-3 hover:bg-slate-50 transition-colors group relative cursor-pointer">
                                            <span className={`text-xs font-bold ${day < 1 || day > 28 ? 'text-slate-200' : isToday ? 'text-cyan-600' : 'text-slate-400'}`}>
                                                {day < 1 ? day + 31 : day > 28 ? day - 28 : day}
                                            </span>
                                            {hasCitas && day > 0 && day <= 28 && (
                                                <div className="mt-2 space-y-1">
                                                    <div className="h-1.5 w-full bg-cyan-500 rounded-full shadow-lg shadow-cyan-100"></div>
                                                    <p className="text-[8px] font-black text-slate-400 group-hover:text-cyan-600 transition-colors">4 PROGRAMADAS</p>
                                                </div>
                                            )}
                                            {isToday && <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                                {[
                                    { time: '08:30', name: 'Roberto Caicero', type: 'Ingreso', sede: 'El Marqués' },
                                    { time: '09:00', name: 'Lucía Méndez', type: 'Periódico', sede: 'Paseo Prado' },
                                    { time: '10:15', name: 'Andrés Gil', type: 'Especialista', sede: 'Koonol' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50/50 border border-slate-100 rounded-3xl group hover:bg-white hover:border-cyan-200 transition-all hover:shadow-lg hover:shadow-cyan-50">
                                        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-center min-w-[80px]">
                                            <p className="text-xs font-black text-slate-800 tracking-tighter">{item.time}</p>
                                            <p className="text-[8px] text-slate-400 uppercase font-black">Hrs</p>
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <p className="text-lg font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">{item.name}</p>
                                            <p className="text-xs font-semibold text-slate-400">{item.type} — <span className="text-cyan-600/80">{item.sede}</span></p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-[10px] font-black text-slate-400 uppercase hover:text-red-500 tracking-widest px-4 py-2">Cancelar</button>
                                            <button className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl shadow-lg hover:bg-slate-800 transition-all">Reagendar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
