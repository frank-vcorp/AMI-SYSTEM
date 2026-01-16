/**
 * ExtractionResults - Display extracted data in editable table format
 */

import React, { useState, useCallback } from "react";
import { ExtractedDataSet, LaboratoryData } from "../types";

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
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Campo</th>
                <th className="px-4 py-2 text-left font-semibold">Valor</th>
                {isEditable && (
                  <th className="px-4 py-2 text-left font-semibold">Acción</th>
                )}
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([field, value], idx) => (
                <tr
                  key={field}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2 font-medium text-gray-700">
                    {humanizeFieldName(field)}
                  </td>
                  <td
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleCellClick(field, value, dataType)}
                  >
                    {editingCell?.field === field &&
                    editingCell?.dataType === dataType ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="border border-blue-500 px-2 py-1 rounded w-full"
                        autoFocus
                      />
                    ) : (
                      <span>{formatValue(value)}</span>
                    )}
                  </td>
                  {isEditable && (
                    <td className="px-4 py-2">
                      {editingCell?.field === field &&
                      editingCell?.dataType === dataType ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleSaveEdit(field, dataType)
                            }
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingCell(null)}
                            className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleCellClick(field, value, dataType)
                          }
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                        >
                          Editar
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
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
        <p className="font-semibold mb-1">💡 Datos Extraídos</p>
        <p className="text-xs">
          {isEditable
            ? "Puedes editar los valores si la extracción IA necesita correcciones"
            : "Revisa los datos extraídos del PDF"}
        </p>
      </div>

      {renderTable(
        "📋 Laboratorio",
        extractedData.laboratorio,
        "laboratorio"
      )}
      {renderTable(
        "🫁 Radiografía",
        extractedData.radiografia,
        "radiografia"
      )}
      {renderTable("❤️ ECG", extractedData.ecg, "ecg")}
      {renderTable(
        "🫁 Espirometría",
        extractedData.spirometry,
        "spirometry"
      )}
      {renderTable(
        "👂 Audiometría",
        extractedData.audiometry,
        "audiometry"
      )}

      {Object.keys(extractedData).length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Sin datos extraídos</p>
          <p className="text-sm mt-2">
            Los datos aparecerán aquí una vez se procese el PDF
          </p>
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
