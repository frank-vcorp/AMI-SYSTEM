/**
 * 🛰️ VMS ORCHESTRATOR - CENTRO DE OPERACIONES UNIFICADO
 * @impl ARCH-20260202-23
 * @author INTEGRA (Assistant)
 * 
 * Fase 2.3: IA & Validación (Split-Screen).
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Button, Card } from '@ami/core-ui';
import { calculateIMC, IMC_ALERTS, classifyBP, BP_ALERTS } from '@ami/core';

type VMSTab = 'recepcion' | 'examen' | 'estudios' | 'validacion' | 'reporte';

interface ActivePatient {
    id?: string;
    amiId?: string;
    name: string;
    company: string;
    status: string;
    folio?: string;
}

interface ExtractedField {
    label: string;
    value: string;
    unit?: string;
    status: 'normal' | 'alert' | 'warning';
}

export default function VMSOrchestrator() {
    const [activeTab, setActiveTab] = useState<VMSTab>('recepcion');
    const [activePatient, setActivePatient] = useState<ActivePatient | null>(null);

    // --- Signos Vitales ---
    const [vitalSigns, setVitalSigns] = useState({
        weight: 0,
        height: 0,
        systolic: 0,
        diastolic: 0,
        heartRate: 0,
        temp: 36.5
    });

    const [imcData, setImcData] = useState<{ value: number, label: string, color: string } | null>(null);
    const [bpData, setBpData] = useState<{ label: string, color: string } | null>(null);

    // --- IA & Estudios ---
    const [uploading, setUploading] = useState(false);
    const [extractedData, setExtractedData] = useState<Record<string, ExtractedField[]>>({});

    // Efecto para cálculos en tiempo real
    useEffect(() => {
        if (vitalSigns.weight > 0 && vitalSigns.height > 0) {
            const { value, classification } = calculateIMC(vitalSigns.weight, vitalSigns.height);
            setImcData({ value, ...IMC_ALERTS[classification] });
        } else {
            setImcData(null);
        }

        if (vitalSigns.systolic > 0 && vitalSigns.diastolic > 0) {
            const classification = classifyBP(vitalSigns.systolic, vitalSigns.diastolic);
            setBpData(BP_ALERTS[classification]);
        } else {
            setBpData(null);
        }
    }, [vitalSigns]);

    const simulateIAExtraction = () => {
        setUploading(true);
        setTimeout(() => {
            setExtractedData({
                "Biometría Hemática": [
                    { label: "Hemoglobina", value: "11.2", unit: "g/dL", status: 'alert' },
                    { label: "Leucocitos", value: "7.5", unit: "10^3/µL", status: 'normal' },
                    { label: "Plaquetas", value: "240", unit: "10^3/µL", status: 'normal' }
                ],
                "Química Sanguínea": [
                    { label: "Glucosa", value: "105", unit: "mg/dL", status: 'warning' },
                    { label: "Colesterol", value: "210", unit: "mg/dL", status: 'warning' }
                ]
            });
            setUploading(false);
            setActiveTab('validacion');
        }, 2500);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'recepcion':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Recepción y Registro</h2>
                                    <p className="text-slate-500">Emisión de cita y generación de ADN AMI</p>
                                </div>
                                <div className="bg-cyan-50 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold border border-cyan-100 italic">
                                    "El inicio de la trazabilidad vital"
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <section>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Datos del Trabajador</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                                                <input type="text" className="w-full bg-slate-50 border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-cyan-500 transition-all" placeholder="Ej. Roberto Caicero Beltrán" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
                                                <input type="date" className="w-full bg-slate-50 border-slate-200 rounded-lg p-3 text-slate-800" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                                                <select className="w-full bg-slate-50 border-slate-200 rounded-lg p-3 text-slate-800">
                                                    <option>Masculino</option>
                                                    <option>Femenino</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Empresa y Sucursal</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                                                <div className="flex gap-2">
                                                    <select className="flex-1 bg-slate-50 border-slate-200 rounded-lg p-3 text-slate-800">
                                                        <option>Seleccionar empresa...</option>
                                                        <option>PEMEX Monterrey</option>
                                                        <option>Telcel Querétaro</option>
                                                    </select>
                                                    <button className="bg-slate-200 p-3 rounded-lg hover:bg-slate-300 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Sucursal AMI de Atención</label>
                                                <select className="w-full bg-slate-50 border-slate-200 rounded-lg p-3 text-slate-800 font-semibold border-cyan-200 bg-cyan-50/30">
                                                    <option>AMI - El Marqués (Sucursal seeded ✅)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>

                                    <div className="pt-4">
                                        <Button
                                            className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-lg shadow-cyan-200 flex justify-center items-center gap-2 group"
                                            onClick={() => {
                                                setActivePatient({
                                                    name: 'Roberto Caicero Beltrán',
                                                    company: 'PEMEX Monterrey',
                                                    amiId: 'AMI-CABR-700221-M-00',
                                                    status: 'IN_PROGRESS',
                                                    folio: 'EXP-QRO-20260202-001'
                                                });
                                                setActiveTab('examen');
                                            }}
                                        >
                                            <span>Generar ID y Abrir Expediente</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </Button>
                                    </div>
                                </div>

                                {/* Lado Derecho: Preview y Ayuda */}
                                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col justify-center">
                                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-lg font-bold text-slate-300">Esperando registro...</div>
                                            <div className="text-sm text-slate-400">ID Único AMI se generará aquí</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'examen':
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Somatometría y Signos Vitales</h2>
                                    <p className="text-slate-500">Captura base para cálculos clínicos automáticos</p>
                                </div>
                                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Consultorio Digital Activo
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-8">
                                    <section className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Mediciones Básicas</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Peso (kg)</label>
                                                <input type="number" className="w-full bg-white border-slate-200 rounded-lg p-4 text-xl font-bold text-slate-800 outline-none" placeholder="0.0" onChange={(e) => setVitalSigns({ ...vitalSigns, weight: parseFloat(e.target.value) || 0 })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Talla (cm)</label>
                                                <input type="number" className="w-full bg-white border-slate-200 rounded-lg p-4 text-xl font-bold text-slate-800 outline-none" placeholder="0" onChange={(e) => setVitalSigns({ ...vitalSigns, height: parseFloat(e.target.value) || 0 })} />
                                            </div>
                                        </div>
                                    </section>

                                    <section className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Presión Arterial</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Sistólica (mmHg)</label>
                                                <input type="number" className="w-full bg-white border-slate-200 rounded-lg p-4 text-xl font-bold outline-none" placeholder="120" onChange={(e) => setVitalSigns({ ...vitalSigns, systolic: parseFloat(e.target.value) || 0 })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Diastólica (mmHg)</label>
                                                <input type="number" className="w-full bg-white border-slate-200 rounded-lg p-4 text-xl font-bold outline-none" placeholder="80" onChange={(e) => setVitalSigns({ ...vitalSigns, diastolic: parseFloat(e.target.value) || 0 })} />
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-6">
                                    <Card className="p-6 border-slate-200 shadow-sm relative overflow-hidden">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Resultado IMC</h4>
                                        {imcData ? (
                                            <div className="animate-in zoom-in">
                                                <div className="text-4xl font-black text-slate-800 mb-1">{imcData.value}</div>
                                                <div className={`text-sm font-bold ${imcData.color} uppercase`}>{imcData.label}</div>
                                            </div>
                                        ) : (
                                            <div className="text-slate-300 italic text-sm">Ingrese peso y talla</div>
                                        )}
                                    </Card>

                                    <Card className={`p-6 border-slate-200 shadow-sm relative overflow-hidden ${bpData ? 'bg-slate-50' : ''}`}>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Diagnóstico TA</h4>
                                        {bpData ? (
                                            <div>
                                                <div className={`text-xl font-black ${bpData.color} uppercase tracking-tight`}>{bpData.label}</div>
                                                <p className="text-[10px] text-slate-500 mt-2">Guías AMI Aplicadas</p>
                                            </div>
                                        ) : (
                                            <div className="text-slate-300 italic text-sm">Ingrese presión arterial</div>
                                        )}
                                    </Card>

                                    <div className="p-4 bg-slate-900 rounded-xl">
                                        <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-lg" onClick={() => setActiveTab('estudios')}>Ir a Estudios</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'estudios':
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white rounded-2xl shadow-xl p-12 border border-slate-200 text-center">
                            <div className="inline-block p-6 bg-cyan-100 rounded-full text-cyan-600 mb-6">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.638.319a2 2 0 01-1.789 0l-.638-.319a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547m0 0V19a2 2 0 002 2h14a2 2 0 002-2v-3.572M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Digitalización IA de Estudios</h2>
                            <p className="text-slate-500 max-w-lg mx-auto mb-8">Sube los estudios del paciente para iniciar la extracción inteligente de hallazgos médicos.</p>

                            <div
                                className={`border-4 border-dashed rounded-2xl p-20 transition-all cursor-pointer ${uploading ? 'bg-slate-50 border-cyan-400 animate-pulse' : 'border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50'}`}
                                onClick={simulateIAExtraction}
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <span className="text-xl font-bold text-cyan-700 uppercase tracking-widest">Extrayendo Datos con IA...</span>
                                        <p className="text-sm text-slate-500 mt-2 italic font-mono">Procesando Hemoglobina, Glucosa, Perfil Lipídico...</p>
                                    </div>
                                ) : (
                                    <div className="text-slate-400">
                                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        <span className="text-xl font-medium">Soltar PDFs o Imagen de Estudios</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'validacion':
                return (
                    <div className="animate-in slide-in-from-bottom-8 duration-500">
                        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                            {/* Toolbar de Validación */}
                            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <span className="bg-cyan-500 text-slate-900 text-[10px] font-black px-2 py-1 rounded">MODO VALIDACIÓN</span>
                                    <h2 className="text-white font-bold">Split-Screen: IA vs Realidad</h2>
                                </div>
                                <div className="flex gap-2">
                                    <Button className="bg-red-500/10 text-red-500 border border-red-500/20 text-xs px-4" size="sm">Solicitar Re-escaneo</Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-6 font-bold"
                                        size="sm"
                                        onClick={() => setActiveTab('reporte')}
                                    >
                                        Validar y Firmar
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">
                                {/* Columna Izquierda: Documento Original (Simulación) */}
                                <div className="bg-slate-700 p-8 flex flex-col items-center justify-center relative border-r border-slate-600">
                                    <div className="bg-white w-full max-w-md h-full shadow-2xl rounded-sm p-10 flex flex-col space-y-4 opacity-90 scale-95 origin-top">
                                        <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                                        <div className="h-10 w-full border-b border-slate-100 mb-8"></div>
                                        <div className="space-y-4">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
                                                    <div className="h-3 w-1/4 bg-slate-100 rounded"></div>
                                                    <div className="h-3 w-1/6 bg-slate-100 rounded"></div>
                                                    <div className="h-3 w-1/6 bg-slate-100 rounded"></div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-auto h-20 w-32 border-2 border-cyan-100 border-dashed rounded flex flex-col items-center justify-center">
                                            <div className="text-[8px] text-cyan-200 uppercase font-bold">QR DE TRAZABILIDAD</div>
                                        </div>
                                        <div className="absolute inset-0 bg-cyan-500/5 animate-pulse pointer-events-none"></div>
                                        <div className="absolute top-1/4 left-1/4 px-4 py-1 bg-cyan-500 text-white text-[10px] font-black rounded-full shadow-lg">SCANNING hallazgo_ anemia...</div>
                                    </div>
                                </div>

                                {/* Columna Derecha: Hallazgos IA */}
                                <div className="bg-slate-900 p-8 overflow-y-auto custom-scrollbar">
                                    <div className="space-y-8">
                                        {Object.entries(extractedData).map(([category, fields]) => (
                                            <div key={category} className="space-y-4">
                                                <h3 className="text-cyan-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-1 h-3 bg-cyan-500"></div>
                                                    {category}
                                                </h3>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {fields.map((field, idx) => (
                                                        <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center group hover:border-cyan-500/50 transition-colors">
                                                            <div>
                                                                <p className="text-slate-400 text-[10px] font-bold uppercase">{field.label}</p>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-white text-xl font-bold">{field.value}</span>
                                                                    {field.unit && <span className="text-slate-500 text-xs">{field.unit}</span>}
                                                                </div>
                                                            </div>
                                                            {field.status === 'alert' && (
                                                                <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-black animate-pulse">
                                                                    HALLAZGO CRÍTICO
                                                                </div>
                                                            )}
                                                            {field.status === 'warning' && (
                                                                <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-black">
                                                                    FUERA DE RANGO
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-8 border-t border-slate-800">
                                            <h4 className="text-xs font-black text-slate-500 uppercase mb-4">Dictamen Preliminar Sugerido</h4>
                                            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                                <p className="text-red-400 text-sm italic font-serif">"Se detecta Hemoglobina por debajo del rango normal (11.2 g/dL). Sugiere posible cuadro de anemia. Se recomienda biometría complementaria antes de validación final."</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'reporte':
                return (
                    <div className="animate-in zoom-in duration-500">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                            <div className="bg-slate-900 p-12 text-center text-white">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 scale-125">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <h2 className="text-3xl font-black mb-2">VALIDACIÓN EXITOSA</h2>
                                <p className="text-slate-400 font-mono text-sm">El expediente ha sido cerrado y el AMI-ID ha sido actualizado.</p>
                            </div>

                            <div className="p-12 max-w-2xl mx-auto space-y-8">
                                <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">AMI-ID VINCULADO</p>
                                        <p className="text-xl font-bold font-mono text-cyan-600">{activePatient?.amiId}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">FOLIO DE EXPEDIENTE</p>
                                        <p className="text-xl font-bold font-mono text-slate-800">{activePatient?.folio}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Button className="w-full bg-slate-900 text-white py-4 rounded-xl flex items-center justify-center gap-3 group">
                                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        <span>Descargar Certificado Médico (PDF)</span>
                                    </Button>
                                    <Button className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-xl" onClick={() => { setActivePatient(null); setActiveTab('recepcion'); }}>Finalizar Proceso</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div className="p-12 text-center text-slate-400 italic">Próximamente...</div>;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
            {/* Header Unificado */}
            <header className="bg-slate-900 text-white shadow-2xl p-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-cyan-500 p-2 rounded-lg"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight uppercase">VMS - Centro de Mandos</h1>
                            <p className="text-[10px] text-cyan-400 uppercase font-black tracking-tighter">Powered by RD-AMI AI Engine</p>
                        </div>
                    </div>

                    {activePatient ? (
                        <div className="flex items-center gap-6 bg-slate-800/50 px-6 py-2 rounded-xl border border-slate-700 animate-in zoom-in">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Paciente</p>
                                <p className="text-sm font-bold text-white leading-tight">{activePatient.name}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-700"></div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">AMI-ID</p>
                                <p className="text-sm font-mono text-cyan-400">{activePatient.amiId}</p>
                            </div>
                            <button onClick={() => { setActivePatient(null); setActiveTab('recepcion'); }} className="p-1 text-slate-500 hover:text-red-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                        </div>
                    ) : (
                        <div className="text-slate-500 italic text-sm border border-slate-700/50 px-4 py-2 rounded-lg font-mono">STAND-BY: ESPERANDO PACIENTE</div>
                    )}

                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">SUCURSAL AMI</p>
                        <p className="text-xs font-bold text-cyan-500">QRO01 - EL MARQUÉS</p>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <nav className="bg-white border-b border-slate-200 sticky top-[72px] z-40 shadow-sm overflow-x-auto no-scrollbar">
                <div className="max-w-7xl mx-auto flex">
                    {[
                        { id: 'recepcion', label: '1. Recepción', icon: 'M12 4v16m8-8H4' },
                        { id: 'examen', label: '2. Consultorio', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                        { id: 'estudios', label: '3. Digital IA', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
                        { id: 'validacion', label: '4. Validación', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { id: 'reporte', label: '5. Entrega', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as VMSTab)}
                            className={`flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-cyan-500 text-cyan-600 bg-cyan-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={tab.icon} /></svg>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 md:p-10 mb-20">{renderTabContent()}</main>

            {activePatient && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white px-8 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-8 z-50 scale-90 sm:scale-100">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FLUJO VITAL</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-1.5 w-40 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                            <div className={`h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-700 ${activeTab === 'recepcion' ? 'w-1/5' : activeTab === 'examen' ? 'w-2/5' : activeTab === 'estudios' ? 'w-3/5' : activeTab === 'validacion' ? 'w-4/5' : 'w-full'}`}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
