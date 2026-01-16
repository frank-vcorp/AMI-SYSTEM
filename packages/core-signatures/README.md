# @ami/core-signatures

Gestor de firmas digitales para reportes y papeletas médicas. Implementa firma digital en PDFs con certificados X.509 y validación de integridad de documentos.

## Características

- ✅ Firma digital de PDFs con certificados (RSA-SHA256)
- ✅ Validación de firmas y certificados
- ✅ Generación de certificados autofirmados (desarrollo)
- ✅ Manipulación de PDFs con `pdf-lib`
- ✅ Metadatos de firma (cédula, rol, timestamp)
- ✅ Campos de firma visuales en PDFs
- ✅ Extracción de información de firmas

## Instalación

```bash
# En monorepo
pnpm install

# O instalar directamente
pnpm add @ami/core-signatures
```

## Uso Rápido

### 1. Generar Certificados (Desarrollo)

```typescript
import { CertificateUtils } from "@ami/core-signatures";

// Generar certificado autofirmado
const { keyPath, certPath } = await CertificateUtils.generateSelfSignedCertificate(
  {
    commonName: "Dr. Juan Carlos Pérez",
    subject: "8-123-456789", // cédula
    organizationUnit: "Departamento de Medicina",
    validityDays: 365,
  },
  "./certs"
);

console.log(`Clave privada: ${keyPath}`);
console.log(`Certificado: ${certPath}`);
```

### 2. Inicializar Motor de Firmas

```typescript
import { createSigningEngine } from "@ami/core-signatures";

const engine = await createSigningEngine({
  config: {
    keyPath: process.env.PRIVATE_KEY_PATH || "./certs/private.pem",
    certPath: process.env.CERT_PATH || "./certs/cert.pem",
    password: process.env.CERT_PASSWORD, // si la clave está encriptada
    certType: "self-signed", // o "official"
  },
});
```

### 3. Firmar un PDF

```typescript
import { promises as fs } from "fs";

const pdfBuffer = await fs.readFile("reporte.pdf");

const signed = await engine.signPDF(pdfBuffer, {
  signerName: "Dr. Juan Carlos Pérez",
  signerId: "8-123-456789",
  signerRole: "Médico Especialista",
  licenseNumber: "MED-2024-123456",
  timestamp: new Date().toISOString(),
  reason: "Autorización de estudios complementarios",
  pageNumber: 0,
});

// Guardar PDF firmado
await fs.writeFile("reporte-firmado.pdf", signed.pdfBuffer);
console.log(`Firma: ${signed.signatureHash}`);
console.log(`Firmado en: ${signed.signedAt}`);
```

### 4. Validar Firmas

```typescript
const pdfBuffer = await fs.readFile("reporte-firmado.pdf");

const result = await engine.validateSignature(pdfBuffer);

console.log(`¿Es válido? ${result.isValid}`);
console.log(`Errores: ${result.errors.join(", ")}`);
console.log(`Advertencias: ${result.warnings.join(", ")}`);

if (result.signatureInfo) {
  console.log(`Firmas encontradas: ${result.signatureInfo.signatureCount}`);
  result.signatureInfo.signatures.forEach((sig) => {
    console.log(`  - ${sig.signerName} (${sig.signerId})`);
    console.log(`    Rol: ${sig.signerRole}`);
    console.log(`    Fecha: ${sig.timestamp}`);
  });
}
```

### 5. Agregar Campo de Firma Visual

```typescript
import { PDFManager } from "@ami/core-signatures";

const pdfDoc = await PDFManager.loadPDF(pdfBuffer);

// Agregar campo de firma en página 0, esquina inferior derecha
await PDFManager.addSignatureFieldToPDF(pdfDoc, {
  fieldName: "signature_1",
  x: 350,
  y: 50,
  width: 200,
  height: 80,
  pageIndex: 0,
  visible: true,
});

const modifiedPDF = await PDFManager.savePDF(pdfDoc);
```

### 6. Agregar Anotación de Firma

```typescript
await PDFManager.addSignatureAnnotation(
  pdfDoc,
  {
    signerName: "Dr. Juan Carlos Pérez",
    signerId: "8-123-456789",
    signerRole: "Médico Especialista",
    timestamp: new Date().toISOString(),
  },
  0 // página 0
);
```

## Configuración de Ambiente

### Variables de Entorno (Producción)

```bash
# .env.production
PRIVATE_KEY_PATH=/secure/path/to/private.pem
CERT_PATH=/secure/path/to/cert.pem
CERT_PASSWORD=your-secure-password

# Para Firebase/GCP (si usas Cloud KMS)
GCP_PROJECT_ID=your-project
GCP_KMS_KEY_NAME=projects/YOUR_PROJECT/locations/global/keyRings/YOUR_RING/cryptoKeys/YOUR_KEY
```

### Notas de Seguridad

- ⚠️ **NUNCA** comitear certificados o claves privadas al repositorio
- 📦 Usar `.gitignore` para archivos `*.pem`, `*.key`
- 🔒 En producción, almacenar claves en:
  - AWS KMS
  - Google Cloud KMS
  - HashiCorp Vault
  - Azure Key Vault
- 🔐 Implementar acceso RBAC a variables de entorno

### Archivo .gitignore

```gitignore
# Certificados y claves
*.pem
*.key
*.crt
*.p12
*.pfx

# Desarrollo
certs/
.env.local
.env.development.local

# Test
coverage/
```

## Estructura de Certificados (PEM)

### Certificado Autofirmado (Desarrollo)

```
-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUL9...
...
-----END CERTIFICATE-----
```

### Clave Privada (PKCS#8 o RSA)

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQE...
...
-----END PRIVATE KEY-----
```

O formato RSA legacy:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA2...
...
-----END RSA PRIVATE KEY-----
```

## Estándares PDF Soportados

- **ISO 32000-2** (PDF 2.0) - Firmas digitales estándar
- **PAdES** (PDF Advanced Electronic Signatures) - Compatible con herramientas legales
- **CMS** (Cryptographic Message Syntax) - RFC 3852

## Compatibilidad

- ✅ Adobe Sign / Adobe Acrobat
- ✅ Microsoft Edge (PDF Viewer)
- ✅ Chrome / Firefox (PDF.js)
- ✅ Herramientas de validación legal en Costa Rica

## API Completa

### `SigningEngine`

```typescript
class SigningEngine {
  // Inicializar motor de firmas
  async initialize(): Promise<void>

  // Firmar PDF con metadatos
  async signPDF(
    pdfBuffer: Buffer,
    metadata: SignatureMetadata
  ): Promise<SignedDocument>

  // Validar firmas en PDF
  async validateSignature(pdfBuffer: Buffer): Promise<ValidationResult>

  // Agregar campo de firma
  async addSignatureField(
    pdfBuffer: Buffer,
    field: SignatureField
  ): Promise<Buffer>

  // Obtener información de firmas
  async getSignatureInfo(pdfBuffer: Buffer): Promise<SignatureInfo>

  // Limpiar datos sensibles
  async dispose(): Promise<void>
}
```

### `PDFManager`

```typescript
class PDFManager {
  static async loadPDF(pdfBuffer: Buffer): Promise<PDFDocument>
  static async savePDF(pdfDoc: PDFDocument): Promise<Buffer>
  static async addSignatureFieldToPDF(pdfDoc: PDFDocument, field: SignatureField): Promise<void>
  static async addSignatureAnnotation(pdfDoc: PDFDocument, metadata: SignatureMetadata, pageIndex?: number): Promise<void>
  static getPageDimensions(page: PDFPage): { width: number; height: number }
  static getPageCount(pdfDoc: PDFDocument): number
  static async mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer>
  static async extractMetadata(pdfDoc: PDFDocument): Promise<Record<string, any>>
}
```

### `CertificateUtils`

```typescript
class CertificateUtils {
  static async generateSelfSignedCertificate(
    options: CertificateGenerationOptions,
    outputDir: string
  ): Promise<{ keyPath: string; certPath: string }>

  static async validateCertificateFormat(certPath: string): Promise<boolean>
  static async validatePrivateKeyFormat(keyPath: string): Promise<boolean>
  static async getCertificateInfo(certPath: string): Promise<string>
  static async getCertificateExpiration(certPath: string): Promise<Date>
  static async removeCertificates(keyPath: string, certPath: string): Promise<void>
}
```

## Tipos Principales

```typescript
interface SignatureConfig {
  keyPath: string;
  certPath: string;
  password?: string;
  certType?: "self-signed" | "official";
  digestAlgorithm?: "sha256" | "sha384" | "sha512";
}

interface SignatureMetadata {
  signerName: string;
  signerId: string; // cédula
  signerRole: string;
  licenseNumber?: string;
  timestamp?: Date | string;
  reason?: string;
  pageNumber?: number;
}

interface SignedDocument {
  pdfBuffer: Buffer;
  signatureHash: string;
  signedAt: string;
  metadata: SignatureMetadata;
  isValid?: boolean;
}

interface SignatureInfo {
  isSigned: boolean;
  signatureCount: number;
  signatures: Array<{
    signerName: string;
    signerId: string;
    signerRole: string;
    timestamp: string;
    reason?: string;
    isValid: boolean;
  }>;
  certificate?: {
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    fingerprint?: string;
  };
}
```

## Testing

```bash
# Ejecutar pruebas
pnpm test

# Con watch
pnpm test:watch

# Cobertura
pnpm test:coverage
```

## Roadmap

- [ ] Integración con Cloud KMS (Google, AWS, Azure)
- [ ] Timestamp Authority (TSA) para timestamps seguros
- [ ] OCSP (Online Certificate Status Protocol)
- [ ] Extracción de texto de PDFs (pdfjs-dist)
- [ ] Soporte para múltiples certificados por documento
- [ ] UI Component para seleccionar/firmar documentos
- [ ] Webhook para notificaciones de firma

## Licencia

MIT - AMI-SYSTEM
