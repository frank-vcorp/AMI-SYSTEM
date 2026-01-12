/**
 * core-storage - GCP Cloud Storage + signed URLs
 * 
 * Proporciona:
 * - Upload de archivos a GCS
 * - Generación de signed URLs
 * - Manejo de metadatos
 * - Borrado automático
 */

export interface StorageConfig {
  projectId: string;
  bucketName: string;
}

export interface UploadOptions {
  fileName: string;
  mimeType: string;
  metadata?: Record<string, string>;
}

export interface SignedUrlOptions {
  expirationHours?: number;
  action?: 'read' | 'write' | 'delete';
}

/**
 * Inicializa el cliente de GCP Storage
 */
export function initializeStorage(config: StorageConfig) {
  // Implementación pendiente
  console.log('GCP Storage initialization pending', config);
}

/**
 * Genera una URL firmada para upload
 */
export async function generateUploadUrl(options: UploadOptions): Promise<string> {
  // Implementación pendiente
  console.log('Upload URL generation pending', options);
  return '';
}

/**
 * Genera una URL firmada para descargar archivo
 */
export async function generateDownloadUrl(
  fileId: string,
  options?: SignedUrlOptions
): Promise<string> {
  // Implementación pendiente
  console.log('Download URL generation pending', { fileId, options });
  return '';
}

/**
 * Borra un archivo del storage
 */
export async function deleteFile(fileId: string): Promise<void> {
  // Implementación pendiente
  console.log('File deletion pending', fileId);
}

export default {
  initializeStorage,
  generateUploadUrl,
  generateDownloadUrl,
  deleteFile,
};
