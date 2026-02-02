/**
 * ExpedientStatusBadge Component
 * Displays expedient status with appropriate colors and icons
 * 
 * @impl IMPL-20260202-03
 * @author SOFIA
 */

import React from 'react';

type ExpedientStatus =
    | 'SCHEDULED' | 'DRAFT' | 'CHECKED_IN' | 'IN_PHYSICAL_EXAM' | 'EXAM_COMPLETED'
    | 'AWAITING_STUDIES' | 'STUDIES_UPLOADED' | 'DATA_EXTRACTED'
    | 'READY_FOR_REVIEW' | 'IN_VALIDATION' | 'VALIDATED' | 'DELIVERED'
    | 'ARCHIVED' | 'CANCELLED';

interface ExpedientStatusBadgeProps {
    status: ExpedientStatus;
    size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<ExpedientStatus, { label: string; color: string; icon: string }> = {
    // Pre-atención
    SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: '📅' },
    DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: '📝' },

    // Atención
    CHECKED_IN: { label: 'Checked In', color: 'bg-green-100 text-green-800', icon: '✅' },
    IN_PHYSICAL_EXAM: { label: 'In Exam', color: 'bg-cyan-100 text-cyan-800', icon: '🩺' },
    EXAM_COMPLETED: { label: 'Exam Done', color: 'bg-teal-100 text-teal-800', icon: '✔️' },

    // Procesamiento
    AWAITING_STUDIES: { label: 'Awaiting Studies', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    STUDIES_UPLOADED: { label: 'Studies Uploaded', color: 'bg-amber-100 text-amber-800', icon: '📄' },
    DATA_EXTRACTED: { label: 'Data Extracted', color: 'bg-orange-100 text-orange-800', icon: '🤖' },

    // Validación
    READY_FOR_REVIEW: { label: 'Ready for Review', color: 'bg-purple-100 text-purple-800', icon: '👀' },
    IN_VALIDATION: { label: 'In Validation', color: 'bg-indigo-100 text-indigo-800', icon: '🔍' },

    // Finalizado
    VALIDATED: { label: 'Validated', color: 'bg-emerald-100 text-emerald-800', icon: '✅' },
    DELIVERED: { label: 'Delivered', color: 'bg-lime-100 text-lime-800', icon: '📦' },
    ARCHIVED: { label: 'Archived', color: 'bg-slate-100 text-slate-800', icon: '📁' },

    // Otros
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

const SIZE_CLASSES = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
};

export function ExpedientStatusBadge({ status, size = 'md' }: ExpedientStatusBadgeProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-medium ${config.color} ${SIZE_CLASSES[size]}`}
        >
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}

// Export helper function to get status phase
export function getStatusPhase(status: ExpedientStatus): string {
    if (['SCHEDULED', 'DRAFT'].includes(status)) return 'Pre-atención';
    if (['CHECKED_IN', 'IN_PHYSICAL_EXAM', 'EXAM_COMPLETED'].includes(status)) return 'Atención';
    if (['AWAITING_STUDIES', 'STUDIES_UPLOADED', 'DATA_EXTRACTED'].includes(status)) return 'Procesamiento';
    if (['READY_FOR_REVIEW', 'IN_VALIDATION'].includes(status)) return 'Validación';
    if (['VALIDATED', 'DELIVERED', 'ARCHIVED'].includes(status)) return 'Finalizado';
    return 'Otros';
}
