# @ami/core-storage

Módulo de almacenamiento en Google Cloud Storage (GCS) con soporte para URLs firmadas (V4 signing).

## Instalación

```bash
npm install @ami/core-storage
```

## Configuración

### 1. Variables de Entorno

```env
# Proyecto de GCP
GCP_PROJECT_ID=your-project-id

# Bucket de almacenamiento
GCP_STORAGE_BUCKET=your-bucket-name

# (Opcional) Ruta al archivo de credenciales JSON
GCP_KEY_FILENAME=/path/to/credentials.json
```

### 2. Inicializar en tu aplicación

```typescript
import { initializeStorage } from '@ami/core-storage';

// Opción 1: Usando variables de entorno + keyFilename
initializeStorage({
  projectId: process.env.GCP_PROJECT_ID!,
  bucketName: process.env.GCP_STORAGE_BUCKET!,
  keyFilename: process.env.GCP_KEY_FILENAME,
});

// Opción 2: Usando credenciales directas (por ejemplo, desde secretos)
initializeStorage({
  projectId: process.env.GCP_PROJECT_ID!,
  bucketName: process.env.GCP_STORAGE_BUCKET!,
  credentials: JSON.parse(process.env.GCP_CREDENTIALS!),
});
```

## API

### `initializeStorage(config: StorageConfig): void`

Inicializa el cliente de GCP Storage. **Debe llamarse antes de usar otras funciones.**

**Parámetros:**
- `projectId`: ID del proyecto GCP
- `bucketName`: Nombre del bucket
- `keyFilename` (opcional): Ruta al archivo JSON de credenciales
- `credentials` (opcional): Objeto con credenciales directas

### `uploadFile(data: Buffer | Readable, options: UploadOptions): Promise<UploadResult>`

Sube un archivo a GCS.

**Parámetros:**
- `data`: Buffer o stream del archivo
- `options.fileName`: Nombre del archivo en GCS
- `options.mimeType`: Tipo MIME (ej: `image/png`)
- `options.metadata` (opcional): Metadatos personalizados

**Retorna:**
```typescript
{
  fileName: string;
  publicUrl: string;        // https://storage.googleapis.com/...
  gcsPath: string;          // gs://bucket/...
}
```

**Ejemplo:**
```typescript
import { uploadFile } from '@ami/core-storage';
import fs from 'fs';

const fileBuffer = fs.readFileSync('/path/to/file.pdf');

const result = await uploadFile(fileBuffer, {
  fileName: 'documentos/documento-123.pdf',
  mimeType: 'application/pdf',
  metadata: {
    userId: '123',
    clinic: 'clinic-456',
  },
});

console.log(result.publicUrl); // https://storage.googleapis.com/bucket/documentos/documento-123.pdf
```

### `getSignedUrl(fileId: string, options?: SignedUrlOptions): Promise<string>`

Genera una URL firmada (V4) para acceder a un archivo con permisos específicos.

**Parámetros:**
- `fileId`: Ruta del archivo en GCS
- `options.action`: `'read'` (GET), `'write'` (PUT), `'delete'` (DELETE) - por defecto: `'read'`
- `options.expirationHours`: Horas hasta que expira la URL - por defecto: 1

**Retorna:** URL firmada (string)

**Ejemplo:**
```typescript
import { getSignedUrl } from '@ami/core-storage';

// URL para descargar (lectura) - expira en 2 horas
const downloadUrl = await getSignedUrl('documentos/documento-123.pdf', {
  action: 'read',
  expirationHours: 2,
});

// URL para escritura - expira en 1 hora
const uploadUrl = await getSignedUrl('uploads/nuevo-archivo.jpg', {
  action: 'write',
  expirationHours: 1,
});
```

### `generateDownloadUrl(fileId: string, options?: SignedUrlOptions): Promise<string>`

Alias para `getSignedUrl` con `action='read'`.

```typescript
const url = await generateDownloadUrl('documentos/documento-123.pdf', {
  expirationHours: 24,
});
```

### `generateUploadUrl(fileId: string, options?: SignedUrlOptions): Promise<string>`

Alias para `getSignedUrl` con `action='write'`.

```typescript
const url = await generateUploadUrl('uploads/nuevo-archivo.jpg', {
  expirationHours: 1,
});
```

### `deleteFile(fileId: string): Promise<void>`

Elimina un archivo del bucket.

**Ejemplo:**
```typescript
import { deleteFile } from '@ami/core-storage';

await deleteFile('documentos/documento-temporal.pdf');
```

### `getFileMetadata(fileId: string): Promise<object>`

Obtiene los metadatos de un archivo.

### `fileExists(fileId: string): Promise<boolean>`

Verifica si un archivo existe en el bucket.

### `getStorageClient(): Storage | null` y `getBucket(): Bucket | null`

Acceso al cliente y bucket de Google Cloud Storage para operaciones avanzadas.

## Casos de Uso Típicos

### 1. Upload de Documento Médico

```typescript
import { uploadFile, getSignedUrl } from '@ami/core-storage';

async function uploadMedicalDocument(userId: string, file: Buffer) {
  const fileName = `medicos/${userId}/documento-${Date.now()}.pdf`;
  
  const result = await uploadFile(file, {
    fileName,
    mimeType: 'application/pdf',
    metadata: { userId, type: 'medical' },
  });

  // Generar URL temporal para descargar
  const downloadUrl = await getSignedUrl(fileName, {
    expirationHours: 24,
  });

  return { publicUrl: result.publicUrl, downloadUrl };
}
```

### 2. Presigned Upload URL (cliente sube directamente a GCS)

```typescript
import { generateUploadUrl } from '@ami/core-storage';

// En el servidor, generar URL de upload
export async function getPresignedUploadUrl(userId: string) {
  const fileName = `uploads/${userId}/imagen-${Date.now()}.jpg`;
  
  const uploadUrl = await generateUploadUrl(fileName, {
    expirationHours: 1,
  });

  return { uploadUrl, fileName };
}
```

### 3. Limpiar Archivos Temporales

```typescript
import { fileExists, deleteFile } from '@ami/core-storage';

async function cleanupTemporaryFiles() {
  const tempFiles = ['uploads/temp-1.jpg', 'uploads/temp-2.jpg'];
  
  for (const file of tempFiles) {
    if (await fileExists(file)) {
      await deleteFile(file);
    }
  }
}
```

## Notas de Seguridad

1. **Credenciales**: Nunca commitsees el archivo JSON de credenciales. Usa variables de entorno o secrets management.
2. **URLs Firmadas**: Especifica siempre `expirationHours` apropiado según el caso de uso.
3. **Permisos**: Asegúrate de que el service account de GCP tenga permisos mínimos necesarios en el bucket.
4. **Buckets Públicos**: Los archivos son públicos por defecto. Para privacidad, no uses `public: true` en `uploadFile`.

## Errores Comunes

- **"Storage no está inicializado"**: Llama `initializeStorage()` antes de otras funciones.
- **"Credenciales inválidas"**: Verifica que el archivo JSON o credenciales sean correctos.
- **"Bucket no encontrado"**: Confirma que el bucket existe en GCP y el proyecto es correcto.
