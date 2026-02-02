"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@ami/core-ui';
import { StudyUploadZone } from './StudyUploadZone';

interface Study {
    id: string;
    studyType: string;
    fileName: string;
    createdAt: string;
}

interface ExpedientReaderProps {
    patientName: string;
    companyName: string;
    folio: string;
    expedientId: string;
    initialStudies?: Study[];
}

const studyTypes = {
    SIM: 'SIM (Clínico)',
    NOVA: 'NOVA (Laboratorio)'
};

const getIconForStudy = (fileName: string): string => {
    const lower = fileName.toLowerCase();
    if (lower.includes('audio')) return 'ear-listen';
    if (lower.includes('espiro')) return 'lungs';
    if (lower.includes('electro') || lower.includes('ecg')) return 'heart-pulse';
    if (lower.includes('rx') || lower.includes('rayos')) return 'x-ray';
    if (lower.includes('lab') || lower.includes('sanguinea') || lower.includes('tox')) return 'vial';
    return 'file-medical';
};

const getTypeForStudy = (fileName: string): string => {
    const lower = fileName.toLowerCase();
    if (lower.includes('lab') || lower.includes('tox')) return studyTypes.NOVA;
    return studyTypes.SIM;
};

export function ExpedientReader({ patientName, companyName, folio, expedientId, initialStudies = [] }: ExpedientReaderProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    // Convert DB studies to View models
    const [studies, setStudies] = useState(initialStudies.map(s => ({
        id: s.id,
        name: s.fileName.replace('.pdf', ''),
        type: getTypeForStudy(s.fileName),
        status: 'PROCESADO',
        icon: getIconForStudy(s.fileName),
        url: `/uploads/studies/${folio}/${s.fileName}` // Asumiendo estructura pública
    })));

    const simulateAIProcessing = (file: File) => {
        setIsProcessing(true);
        // Simulación del "Cerebro" RD-AMI
        setTimeout(() => {
            setIsProcessing(false);
            const newStudy = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name.replace('.pdf', ''),
                type: getTypeForStudy(file.name),
                status: 'PROCESADO',
                icon: getIconForStudy(file.name),
                url: '#'
            };
            setStudies(prev => [newStudy, ...prev]);
        }, 2500);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Banner - Identidad Visual AM-I */}
            <div className="bg-medical-500 text-white rounded-2xl p-6 shadow-premium flex flex-wrap justify-between items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Paciente</p>
                    <h2 className="text-xl font-outfit font-bold">{patientName}</h2>
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Empresa</p>
                    <p className="text-lg font-medium">{companyName}</p>
                </div>
                <div className="relative z-10 text-right">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Folio Único</p>
                    <Badge variant="outline" className="bg-white/20 border-white/30 text-white text-sm py-1 font-mono">
                        {folio}
                    </Badge>
                </div>
            </div>

            {isProcessing && (
                <div className="bg-medical-50 border border-medical-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-medical-500 rounded-lg flex items-center justify-center text-white">
                        <span className="animate-spin">🔄</span>
                    </div>
                    <div>
                        <p className="text-medical-800 font-bold">Residente Digital Procesando...</p>
                        <p className="text-medical-600 text-xs text-balance">Extrayendo matriz de datos clínico-laborales mediante IA.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sección SIM (Clínicos) */}
                <Card variant="premium" className="border-none glass-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-3 text-slate-800">
                            <div className="p-2.5 bg-medical-50 text-medical-600 rounded-xl">
                                <i className="fas fa-stethoscope"></i>
                            </div>
                            <div>
                                <span>Estudios SIM</span>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Clínicos Integrados</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StudyUploadZone
                            expedientId={expedientId}
                            onSuccess={(file) => simulateAIProcessing(file)}
                        />
                    </CardContent>
                </Card>

                {/* Sección NOVA (Laboratorio) */}
                <Card variant="premium" className="border-none glass-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-3 text-slate-800">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                                <i className="fas fa-flask"></i>
                            </div>
                            <div>
                                <span>Estudios NOVA</span>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Análisis de Laboratorio</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StudyUploadZone
                            expedientId={expedientId}
                            onSuccess={(file) => simulateAIProcessing(file)}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Listado de Estudios Procesados */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-outfit font-bold flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-medical-500 rounded-full"></span>
                        Expediente Digital
                    </h3>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500">{studies.length} Documentos</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studies.map((study) => (
                        <div key={study.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-premium hover:border-medical-100 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${study.type === studyTypes.SIM
                                    ? 'bg-medical-50 text-medical-600 group-hover:bg-medical-500 group-hover:text-white'
                                    : 'bg-purple-50 text-purple-600 group-hover:bg-ami-purple group-hover:text-white'
                                    }`}>
                                    <i className={`fas fa-${study.icon}`}></i>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 group-hover:text-medical-700 transition-colors">{study.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        {study.type} • 2.4 MB
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant={study.status === 'PROCESADO' ? 'success' : 'warning'}
                                    className={`border-none ${study.status === 'PROCESADO' ? 'bg-clinical-success/10 text-clinical-success' : 'bg-clinical-warning/10 text-clinical-warning'}`}
                                >
                                    {study.status}
                                </Badge>
                                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-medical-500 transition-all">
                                    <span className="text-lg">👁️</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const studyTypes = {
    SIM: 'Clínico (SIM)',
    NOVA: 'Laboratorio (NOVA)'
};
