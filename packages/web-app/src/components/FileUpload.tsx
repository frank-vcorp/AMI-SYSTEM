'use client';

import React, { useCallback, useState } from 'react';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
}

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  tenantId?: string;
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const DEFAULT_MAX_FILES = 5;

/**
 * FileUpload Component
 * Reutilizable para múltiples archivos con drag-drop, validación y progreso
 */
export function FileUpload({
  onUploadComplete,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeMB = 50,
  acceptedTypes = ALLOWED_TYPES,
  tenantId = 'default-tenant',
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validar archivo individual
  const validateFile = (file: File): string | null => {
    // Validar tipo MIME
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido: ${file.type}. Permitidos: ${acceptedTypes.join(', ')}`;
    }

    // Validar extensión
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    if (!hasValidExtension) {
      return `Extensión no permitida. Use: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }

    // Validar tamaño
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Archivo muy grande. Máximo: ${maxSizeMB}MB, Actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    return null;
  };

  // Manejar selección de archivos
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      setError(null);
      setSuccess(null);

      const newFiles = Array.from(files);
      const validationErrors: string[] = [];

      for (const file of newFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          validationErrors.push(`${file.name}: ${validationError}`);
        }
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join('\n'));
        return;
      }

      // Verificar límite de archivos
      const totalFiles = selectedFiles.length + newFiles.length;
      if (totalFiles > maxFiles) {
        setError(`Máximo ${maxFiles} archivos permitidos. Seleccionaste ${totalFiles}`);
        return;
      }

      setSelectedFiles((prev) => [...prev, ...newFiles]);
    },
    [selectedFiles.length, maxFiles]
  );

  // Manejar drag-drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  // Remover archivo de la lista
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  // Upload de archivos
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Selecciona al menos un archivo');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    const uploadedFilesList: UploadedFile[] = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tenantId', tenantId);

        const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
          const response = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData,
            // Nota: No incluimos headers, FormData lo maneja automáticamente
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error uploading ${file.name}`);
          }

          const data = await response.json();

          const uploadedFile: UploadedFile = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            url: data.url,
          };

          uploadedFilesList.push(uploadedFile);
        } catch (fileError) {
          const errorMsg =
            fileError instanceof Error
              ? fileError.message
              : `Error al subir ${file.name}`;
          setError((prev) => (prev ? `${prev}\n${errorMsg}` : errorMsg));
        }
      }

      if (uploadedFilesList.length > 0) {
        setUploadedFiles((prev) => [...prev, ...uploadedFilesList]);
        setSelectedFiles([]);
        setSuccess(
          `${uploadedFilesList.length} archivo(s) subido(s) exitosamente`
        );

        if (onUploadComplete) {
          onUploadComplete(uploadedFilesList);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Descargar archivo
  const downloadFile = async (file: UploadedFile) => {
    try {
      // El URL ya es firmado, simplemente abrir en nueva pestaña
      window.open(file.url, '_blank');
    } catch (err) {
      setError('Error al descargar archivo');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Drag-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          id="file-input"
          multiple
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <label htmlFor="file-input" className="cursor-pointer">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12l-4-4m0 0l-4 4m4-4v12"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-900">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PDF, JPG, PNG • Máximo 50MB por archivo • Máximo {maxFiles} archivos
            </p>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-wrap">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Archivos seleccionados ({selectedFiles.length})
          </h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                    />
                    <path
                      fillRule="evenodd"
                      d="M3 4a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H3zm0 2h10v4H3V6z"
                    />
                  </svg>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-3 text-red-500 hover:text-red-700 transition-colors"
                  disabled={loading}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading || selectedFiles.length === 0}
        className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Subiendo...
          </span>
        ) : (
          `Subir ${selectedFiles.length} archivo(s)`
        )}
      </button>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Archivos subidos ({uploadedFiles.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(file.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => downloadFile(file)}
                  className="ml-3 px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                >
                  Descargar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
