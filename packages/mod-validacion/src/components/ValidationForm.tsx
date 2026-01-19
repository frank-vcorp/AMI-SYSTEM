/**
 * ValidationForm - Form for medical opinion, verdict, restrictions, and signing
 */

import React, { useState, useCallback } from "react";
import {
  ValidationTask,
  SemaphoreStatus,
  PatientSummary,
} from "../types";

export interface ValidationFormProps {
  task: ValidationTask;
  patient?: PatientSummary;
  semaphores: SemaphoreStatus[];
  onSubmit: (task: ValidationTask, signature: string) => Promise<void>;
  isLoading?: boolean;
  suggestedVerdict?: "APTO" | "APTO_CON_RESTRICCIONES" | "NO_APTO";
}

export const ValidationForm: React.FC<ValidationFormProps> = ({
  task,
  onSubmit,
  isLoading = false,
  suggestedVerdict,
}) => {
  const [formData, setFormData] = useState({
    medicalOpinion: task.medicalOpinion || "",
    verdict: task.verdict || "APTO",
    restrictions: task.restrictions || [""],
    recommendations: task.recommendations || [""],
  });

  const [signatureBase64, setSignatureBase64] = useState<string>("");
  const [isSigning, setIsSigning] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Canvas reference for signature
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const handleSignatureStart = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(
        e.clientX - canvas.getBoundingClientRect().left,
        e.clientY - canvas.getBoundingClientRect().top
      );
    },
    []
  );

  const handleSignatureMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.buttons !== 1) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.lineTo(
        e.clientX - canvas.getBoundingClientRect().left,
        e.clientY - canvas.getBoundingClientRect().top
      );
      ctx.stroke();
    },
    []
  );

  const handleClearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureBase64("");
  }, []);

  const handleSaveSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSignatureBase64(canvas.toDataURL("image/png"));
    setIsSigning(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors: string[] = [];

      if (!formData.medicalOpinion.trim()) {
        errors.push("El dictamen médico es requerido");
      } else if (formData.medicalOpinion.trim().length < 20) {
        errors.push("El dictamen debe tener al menos 20 caracteres");
      }

      if (!formData.verdict) {
        errors.push("Debes seleccionar un veredicto");
      }

      if (
        formData.verdict === "APTO_CON_RESTRICCIONES" &&
        formData.restrictions.every((r) => !r.trim())
      ) {
        errors.push(
          "Debe especificar al menos una restricción para este veredicto"
        );
      }

      if (!signatureBase64) {
        errors.push("La firma digital es requerida");
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      const updatedTask: ValidationTask = {
        ...task,
        medicalOpinion: formData.medicalOpinion,
        verdict: formData.verdict as any,
        restrictions: formData.restrictions.filter((r) => r.trim()),
        recommendations: formData.recommendations.filter((r) => r.trim()),
        status: "SIGNED",
        signedAt: new Date().toISOString(),
      };

      try {
        await onSubmit(updatedTask, signatureBase64);
      } catch (error) {
        setValidationErrors([
          `Error al guardar: ${error instanceof Error ? error.message : "Error desconocido"}`,
        ]);
      }
    },
    [formData, signatureBase64, task, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-sm font-semibold text-red-900 mb-2">
            Errores de validación:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx} className="text-sm text-red-800">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Verdict */}
      {suggestedVerdict && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            💡 Sugerencia de IA:
          </p>
          <p className="text-sm text-blue-800">
            Basado en los semáforos, se sugiere veredicto:{" "}
            <span className="font-bold">{translateVerdict(suggestedVerdict)}</span>
          </p>
        </div>
      )}

      {/* Medical Opinion */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📝 Dictamen Médico <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.medicalOpinion}
          onChange={(e) =>
            setFormData({ ...formData, medicalOpinion: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={6}
          placeholder="Ingresa tu dictamen médico. Considere los hallazgos clínicos, laboratorio, estudios especiales y restricciones si aplican..."
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.medicalOpinion.length} / 5000 caracteres
        </p>
      </div>

      {/* Verdict */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ✓ Veredicto <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.verdict}
          onChange={(e) =>
            setFormData({ ...formData, verdict: e.target.value as "APTO" | "APTO_CON_RESTRICCIONES" | "NO_APTO" })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="">Selecciona un veredicto</option>
          <option value="APTO">✓ APTO</option>
          <option value="APTO_CON_RESTRICCIONES">
            ⚠ APTO CON RESTRICCIONES
          </option>
          <option value="NO_APTO">✕ NO APTO</option>
        </select>
      </div>

      {/* Restrictions */}
      {formData.verdict === "APTO_CON_RESTRICCIONES" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ⚠ Restricciones
          </label>
          <div className="space-y-2">
            {formData.restrictions.map((restriction, idx) => (
              <input
                key={idx}
                type="text"
                value={restriction}
                onChange={(e) => {
                  const newRestrictions = [...formData.restrictions];
                  newRestrictions[idx] = e.target.value;
                  setFormData({ ...formData, restrictions: newRestrictions });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Restricción ${idx + 1}...`}
                disabled={isLoading}
              />
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  restrictions: [...formData.restrictions, ""],
                })
              }
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Agregar restricción
            </button>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📌 Recomendaciones (opcional)
        </label>
        <div className="space-y-2">
          {formData.recommendations.map((rec, idx) => (
            <input
              key={idx}
              type="text"
              value={rec}
              onChange={(e) => {
                const newRecs = [...formData.recommendations];
                newRecs[idx] = e.target.value;
                setFormData({ ...formData, recommendations: newRecs });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Recomendación ${idx + 1}...`}
              disabled={isLoading}
            />
          ))}
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                recommendations: [...formData.recommendations, ""],
              })
            }
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Agregar recomendación
          </button>
        </div>
      </div>

      {/* Signature */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ✍️ Firma Digital <span className="text-red-500">*</span>
        </label>

        {!isSigning ? (
          <div className="flex items-center gap-4">
            {signatureBase64 ? (
              <div className="flex items-center gap-2">
                <img
                  src={signatureBase64}
                  alt="Firma"
                  className="h-16 border border-gray-300 rounded px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => setIsSigning(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  disabled={isLoading}
                >
                  ✏️ Volver a firmar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSigning(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                disabled={isLoading}
              >
                ✍️ Firmar ahora
              </button>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-3">Firma en el área de abajo:</p>
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              onMouseDown={handleSignatureStart}
              onMouseMove={handleSignatureMove}
              className="border border-gray-400 rounded bg-white cursor-crosshair w-full"
              style={{ touchAction: "none" }}
            />
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleClearSignature}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                🗑️ Limpiar
              </button>
              <button
                type="button"
                onClick={handleSaveSignature}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                ✓ Guardar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-6 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Guardando...
            </>
          ) : (
            <>
              ✓ Firmar y Guardar
            </>
          )}
        </button>
      </div>
    </form>
  );
};

function translateVerdict(verdict: string): string {
  const map: Record<string, string> = {
    APTO: "✓ APTO",
    APTO_CON_RESTRICCIONES: "⚠ APTO CON RESTRICCIONES",
    NO_APTO: "✕ NO APTO",
  };
  return map[verdict] || verdict;
}
