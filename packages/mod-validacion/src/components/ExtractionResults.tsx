/**
 * ExtractionResults - Display extracted data in editable table format
 */

import React, { useState, useCallback } from "react";
import { ExtractedDataSet } from "../types";

export interface ExtractionResultsProps {
  extractedData: ExtractedDataSet;
  onDataChange?: (newData: ExtractedDataSet) => void;
  isEditable?: boolean;
}

interface EditingCell {
  field: string;
  dataType: string;
}

export const ExtractionResults: React.FC<ExtractionResultsProps> = ({
  extractedData,
  onDataChange,
  isEditable = true,
}) => {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleCellClick = useCallback(
    (field: string, value: any, dataType: string) => {
      if (isEditable) {
        setEditingCell({ field, dataType });
        setEditValue(String(value || ""));
      }
    },
    [isEditable]
  );

  const handleSaveEdit = useCallback(
    (field: string, dataType: string) => {
      if (!editingCell || !onDataChange) return;

      const newData = { ...extractedData };
      const numValue = parseFloat(editValue);

      if (dataType === "laboratorio") {
        newData.laboratorio = {
          ...(newData.laboratorio || {}),
          [field]: isNaN(numValue) ? editValue : numValue,
        };
      } else if (dataType === "radiografia") {
        newData.radiografia = {
          ...(newData.radiografia || {}),
          [field]: editValue,
        };
      }

      onDataChange(newData);
      setEditingCell(null);
    },
    [editingCell, editValue, extractedData, onDataChange]
  );

  const renderTable = (
    title: string,
    data: Record<string, any> | undefined,
    dataType: string
  ) => {
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return (
      <div className="mb-8 last:mb-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-medical-500 rounded-full"></div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">{title}</h3>
        </div>

        <div className="overflow-hidden border border-slate-100 rounded-xl shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parámetro</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Reportado</th>
                {isEditable && (
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acción</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {Object.entries(data).map(([field, value]) => (
                <tr
                  key={field}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-5 py-3.5 font-medium text-slate-700">
                    {humanizeFieldName(field)}
                  </td>
                  <td
                    className={`px-5 py-3.5 transition-all ${isEditable ? 'cursor-pointer' : ''}`}
                    onClick={() => handleCellClick(field, value, dataType)}
                  >
                    {editingCell?.field === field &&
                      editingCell?.dataType === dataType ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="border-2 border-medical-500 bg-white px-3 py-1.5 rounded-lg w-full shadow-inner focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(field, dataType);
                          if (e.key === 'Escape') setEditingCell(null);
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{formatValue(value)}</span>
                        {isEditable && (
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] text-medical-500 font-bold uppercase tracking-tighter">Click para editar</span>
                        )}
                      </div>
                    )}
                  </td>
                  {isEditable && (
                    <td className="px-5 py-3.5 text-right">
                      {editingCell?.field === field &&
                        editingCell?.dataType === dataType ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              handleSaveEdit(field, dataType)
                            }
                            className="p-1.5 bg-clinical-success text-white rounded-lg hover:bg-clinical-success/90 transition-colors shadow-sm"
                            title="Confirmar"
                          >
                            <span className="text-xs font-bold px-1">✓</span>
                          </button>
                          <button
                            onClick={() => setEditingCell(null)}
                            className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors shadow-sm"
                            title="Cancelar"
                          >
                            <span className="text-xs font-bold px-1">✕</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleCellClick(field, value, dataType)
                          }
                          className="p-2 text-slate-300 hover:text-medical-500 hover:bg-medical-50 rounded-lg transition-all"
                        >
                          <span className="text-xs">✏️</span>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-br from-medical-500 to-medical-600 rounded-2xl p-5 text-white shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm">💡</div>
          <div>
            <p className="font-bold text-sm uppercase tracking-widest mb-1">Verificación RD-AMI</p>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {isEditable
                ? "Los valores resaltados fueron extraídos automáticamente. Por favor, verifica la correspondencia con el PDF original antes de firmar."
                : "Visualizando matriz de datos clínicos consolidada."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {renderTable(
          "Laboratorio Clínico",
          extractedData.laboratorio,
          "laboratorio"
        )}
        {renderTable(
          "Radiografía / Imagenología",
          extractedData.radiografia,
          "radiografia"
        )}
        {renderTable("Electrocardiograma (ECG)", extractedData.ecg, "ecg")}
        {renderTable(
          "Espirometría / Función Pulmonar",
          extractedData.spirometry,
          "spirometry"
        )}
        {renderTable(
          "Audiometría / Salud Auditiva",
          extractedData.audiometry,
          "audiometry"
        )}
      </div>

      {Object.keys(extractedData).length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-4xl mb-4 opacity-20">📂</div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin datos extraídos para este estudio</p>
          <p className="text-slate-300 text-[10px] mt-1 max-w-[200px] mx-auto">Sube un archivo compatible para iniciar la extracción RD-AMI.</p>
        </div>
      )}
    </div>
  );
};

/**
 * Helper: Format field name to human-readable
 */
function humanizeFieldName(field: string): string {
  const map: Record<string, string> = {
    hemoglobina: "Hemoglobina (g/dL)",
    hematocrito: "Hematocrito (%)",
    glucosa: "Glucosa (mg/dL)",
    creatinina: "Creatinina (mg/dL)",
    urea: "Urea (mg/dL)",
    sodio: "Sodio (mEq/L)",
    potasio: "Potasio (mEq/L)",
    colesterolTotal: "Colesterol Total (mg/dL)",
    trigliceridos: "Triglicéridos (mg/dL)",
    hdl: "HDL (mg/dL)",
    ldl: "LDL (mg/dL)",
    ast: "AST (U/L)",
    alt: "ALT (U/L)",
    location: "Ubicación",
    findings: "Hallazgos",
    impression: "Impresión",
    normalFindings: "Hallazgos Normales",
    heartRate: "Frecuencia Cardíaca (bpm)",
    rhythm: "Ritmo",
    interpretation: "Interpretación",
    fvc: "Capacidad Vital Forzada (L)",
    fev1: "Volumen Espirado Forzado 1seg (L)",
    fev1Fvc: "FEV1/FVC Ratio (%)",
    pef: "Peak Flow (L/min)",
  };
  return map[field] || field;
}

/**
 * Helper: Format value for display
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return String(value);
}
