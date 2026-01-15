/**
 * core-storage - GCP Cloud Storage + signed URLs
 * 
 * Proporciona:
 * - Upload de archivos a GCS
 * - Generación de signed URLs
 * - Manejo de metadatos
 * - Borrado automático
 */

import { Storage, Bucket } from '@google-cloud/storage';
import { Readable } from 'stream';

export interface StorageConfig {
  projectId: string;
  bucketName: string;
  keyFilename?: string; // Ruta al archivo JSON de credenciales (opcional)
  credentials?: object; // Credenciales directas (alternativa a keyFilename)
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

export interface UploadResult {
  fileName: string;
  publicUrl: string;
  gcsPath: string;
}

// Referencia global a la instancia de Storage
let storageClient: Storage | null = null;
let bucket: Bucket | null = null;
let config: StorageConfig | null = null;

/**
 * Inicializa el cliente de GCP Storage
 */
export function initializeStorage(storageConfig: StorageConfig) {
  try {
    if (storageClient && bucket) {
      console.log('GCP Storage ya está inicializado');
      return;
    }

    const options: any = {
      projectId: storageConfig.projectId,
    };

    // Usar keyFilename si se proporciona
    if (storageConfig.keyFilename) {
      options.keyFilename = storageConfig.keyFilename;
    } 
    // O usar credenciales directas
    else if (storageConfig.credentials) {
      options.credentials = storageConfig.credentials;
    }

    storageClient = new Storage(options);
    bucket = storageClient.bucket(storageConfig.bucketName);
    config = storageConfig;

    console.log(`GCP Storage inicializado: bucket=${storageConfig.bucketName}`);
  } catch (error) {
    console.error('Error inicializando GCP Storage:', error);
    throw error;
  }
}

/**
 * Verifica que Storage esté inicializado
 */
function ensureInitialized() {
  if (!storageClient || !bucket || !config) {
    throw new Error('GCP Storage no está inicializado. Llama initializeStorage primero.');
  }
}

/**
 * Sube un archivo a GCS desde un buffer o stream
 */
export async function uploadFile(
  data: Buffer | Readable,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    ensureInitialized();

    const file = bucket!.file(options.fileName);
    
    const uploadOptions: any = {
      metadata: {
        contentType: options.mimeType,
      },
      public: true, // Hacer público para facilitar lectura sin URL firmada
    };

    // Agregar metadatos personalizados si se proporcionan
    if (options.metadata) {
      uploadOptions.metadata.metadata = options.metadata;
    }

    await file.save(data, uploadOptions);

    console.log(`Archivo subido: ${options.fileName}`);

    return {
      fileName: options.fileName,
      publicUrl: `https://storage.googleapis.com/${config!.bucketName}/${options.fileName}`,
      gcsPath: `gs://${config!.bucketName}/${options.fileName}`,
    };
  } catch (error) {
    console.error('Error subiendo archivo:', error);
    throw error;
  }
}

/**
 * Genera una URL firmada para descargar o acceder a un archivo
 */
export async function getSignedUrl(
  fileId: string,
  options?: SignedUrlOptions
): Promise<string> {
  try {
    ensureInitialized();

    const file = bucket!.file(fileId);

    // Determinar la acción (por defecto: lectura)
    const action = options?.action || 'read';
    const method = action === 'read' 
      ? 'GET' 
      : action === 'write' 
      ? 'PUT' 
      : 'DELETE';

    // Determinar la expiración (por defecto: 1 hora)
    const expirationHours = options?.expirationHours || 1;
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + expirationHours);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: action as 'read' | 'write' | 'delete',
      expires: expirationDate,
    });

    console.log(`URL firmada generada para ${fileId} (${method}, expira en ${expirationHours}h)`);

    return signedUrl;
  } catch (error) {
    console.error('Error generando URL firmada:', error);
    throw error;
  }
}

/**
 * Alias para getSignedUrl con action='read' (descarga)
 */
export async function generateDownloadUrl(
  fileId: string,
  options?: SignedUrlOptions
): Promise<string> {
  return getSignedUrl(fileId, { ...options, action: 'read' });
}

/**
 * Alias para getSignedUrl con action='write' (upload)
 */
export async function generateUploadUrl(
  fileId: string,
  options?: SignedUrlOptions
): Promise<string> {
  return getSignedUrl(fileId, { ...options, action: 'write' });
}

/**
 * Borra un archivo del storage
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    ensureInitialized();

    const file = bucket!.file(fileId);
    await file.delete();

    console.log(`Archivo eliminado: ${fileId}`);
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    throw error;
  }
}

/**
 * Obtiene información del archivo (metadatos)
 */
export async function getFileMetadata(fileId: string) {
  try {
    ensureInitialized();

    const file = bucket!.file(fileId);
    const [metadata] = await file.getMetadata();

    return metadata;
  } catch (error) {
    console.error('Error obteniendo metadatos:', error);
    throw error;
  }
}

/**
 * Verifica si un archivo existe
 */
export async function fileExists(fileId: string): Promise<boolean> {
  try {
    ensureInitialized();

    const file = bucket!.file(fileId);
    const [exists] = await file.exists();

    return exists;
  } catch (error) {
    console.error('Error verificando existencia de archivo:', error);
    throw error;
  }
}

/**
 * Obtiene el cliente de Storage (para uso avanzado)
 */
export function getStorageClient(): Storage | null {
  return storageClient;
}

/**
 * Obtiene el bucket (para uso avanzado)
 */
export function getBucket(): Bucket | null {
  return bucket;
}

export default {
  initializeStorage,
  uploadFile,
  getSignedUrl,
  generateDownloadUrl,
  generateUploadUrl,
  deleteFile,
  getFileMetadata,
  fileExists,
  getStorageClient,
  getBucket,
};
