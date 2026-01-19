/**
 * SemaphoreIndicators - Display clinical values with color-coded status
 */

import React, { useMemo } from "react";
import { SemaphoreStatus } from "../types";
import {
  getSemaphoreColor,
  getSemaphoreDescription,
  CLINICAL_RULES,
} from "../utils/clinical-rules";

export interface SemaphoreIndicatorsProps {
  semaphores: SemaphoreStatus[];
  isCompact?: boolean;
}

/**
 * Individual semaphore badge component
 */
const SemaphoreBadge: React.FC<{
  semaphore: SemaphoreStatus;
  isCompact?: boolean;
}> = ({ semaphore, isCompact }) => {
  const color = getSemaphoreColor(semaphore.status);
  const description = getSemaphoreDescription(semaphore);
  const rule = CLINICAL_RULES[semaphore.field as keyof typeof CLINICAL_RULES];

  const statusIcon = {
    NORMAL: "✓",
    WARNING: "⚠",
    CRITICAL: "✕",
  };

  if (isCompact) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white"
        style={{ backgroundColor: color }}
        title={description}
      >
        <span>{statusIcon[semaphore.status]}</span>
        <span className="font-semibold">{rule?.name || semaphore.field}</span>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-semibold text-sm">{rule?.name || semaphore.field}</span>
        </div>
        <span
          className="text-xs font-bold px-2 py-1 rounded text-white"
          style={{ backgroundColor: color }}
        >
          {semaphore.status}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        <p className="text-gray-900 font-medium">
          {semaphore.value} {rule?.unit || ""}
        </p>
        <p className="text-gray-600">Referencia: {semaphore.reference}</p>
        {semaphore.notes && (
          <p className="text-gray-500 italic text-xs">{semaphore.notes}</p>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded">
        {description}
      </div>
    </div>
  );
};

/**
 * Main semaphore indicators display
 */
export const SemaphoreIndicators: React.FC<SemaphoreIndicatorsProps> = ({
  semaphores,
  isCompact = false,
}) => {
  const stats = useMemo(() => {
    return {
      normal: semaphores.filter((s) => s.status === "NORMAL").length,
      warning: semaphores.filter((s) => s.status === "WARNING").length,
      critical: semaphores.filter((s) => s.status === "CRITICAL").length,
      total: semaphores.length,
    };
  }, [semaphores]);

  if (semaphores.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay valores para mostrar</p>
        <p className="text-sm mt-1">
          Los semáforos aparecerán aquí una vez se extraigan los datos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-700 font-semibold">{stats.normal}</p>
          <p className="text-xs text-green-600">Normal</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-yellow-700 font-semibold">{stats.warning}</p>
          <p className="text-xs text-yellow-600">Advertencia</p>
        </div>
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 font-semibold">{stats.critical}</p>
          <p className="text-xs text-red-600">Crítico</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-700 font-semibold">{stats.total}</p>
          <p className="text-xs text-blue-600">Total</p>
        </div>
      </div>

      {/* Semaphores Display */}
      {isCompact ? (
        <div className="flex flex-wrap gap-2">
          {semaphores.map((semaphore) => (
            <SemaphoreBadge
              key={semaphore.field}
              semaphore={semaphore}
              isCompact={true}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {semaphores.map((semaphore) => (
            <SemaphoreBadge
              key={semaphore.field}
              semaphore={semaphore}
              isCompact={false}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
        <p className="font-semibold mb-2">📋 Interpretación:</p>
        <ul className="space-y-1 text-xs">
          <li>
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <strong>Verde (Normal):</strong> Valor dentro del rango de referencia
          </li>
          <li>
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
            <strong>Amarillo (Advertencia):</strong> Fuera del rango normal, requiere
            seguimiento
          </li>
          <li>
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <strong>Rojo (Crítico):</strong> Valor crítico, requiere atención inmediata
          </li>
        </ul>
      </div>
    </div>
  );
};
