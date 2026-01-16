/**
 * PDFViewer - Display and navigate PDF studies
 * Features: Zoom, page navigation, full-screen view
 */

import React, { useState, useCallback } from "react";
import { StudyResult } from "../types";

export interface PDFViewerProps {
  study: StudyResult | null;
  fileUrl: string | null;
  isLoading?: boolean;
  onError?: (error: string) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  study,
  fileUrl,
  isLoading = false,
  onError,
}) => {
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.2, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  if (!study) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Selecciona un estudio para visualizar</p>
          <p className="text-sm text-gray-400">
            Los archivos PDF aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Header with study info */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">{study.fileName}</h3>
        <p className="text-xs text-gray-500">
          {study.studyType} • {study.uploadedAt}
        </p>
        {study.extractionStatus === "FAILED" && (
          <p className="text-xs text-red-600 mt-2">
            ⚠️ Extracción fallida - revisa manualmente
          </p>
        )}
      </div>

      {/* PDF Container */}
      <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
        {fileUrl ? (
          <div className="bg-white shadow-lg" style={{ transform: `scale(${scale})` }}>
            <iframe
              src={fileUrl}
              className="w-full h-full"
              style={{ minHeight: "600px", minWidth: "500px" }}
              title={study.fileName}
              onError={() => onError?.("Error loading PDF")}
            />
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p>PDF no disponible</p>
            <p className="text-sm mt-2">Revisa la URL del archivo</p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="border-t p-4 bg-gray-50 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={handleZoomOut}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium"
            disabled={scale <= 0.5}
          >
            −
          </button>
          <span className="px-3 py-2 text-sm font-medium text-gray-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium"
            disabled={scale >= 2}
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium"
            disabled={currentPage <= 1}
          >
            ← Ant.
          </button>
          <span className="text-sm text-gray-600 px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium"
            disabled={currentPage >= totalPages}
          >
            Sig. →
          </button>
        </div>
      </div>
    </div>
  );
};
