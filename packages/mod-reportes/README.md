# MOD-REPORTES

Módulo de Generación de Reportes y Certificados de Validación para AMI-SYSTEM.

## Features

- 📄 Generación de certificados de validación
- 🖨️ Impresión y exportación a PDF
- 🎨 Diseño profesional y responsive
- ✅ Firma digital con timestamp

## Components

### CertificateViewer

Componente principal para visualizar y exportar certificados.

```tsx
import { CertificateViewer } from "@ami/mod-reportes";

<CertificateViewer
  data={{
    expedientId: "EXP-001",
    patientName: "Juan Pérez",
    patientDOB: "1990-05-15",
    clinicName: "Clínica Central",
    validatorName: "Dr. Carlos López",
    validationDate: "2026-01-20",
    status: "APPROVED",
    medicalFindings: "Estudios normales sin hallazgos relevantes",
    stampDate: "2026-01-20T10:30:00Z"
  }}
  onDownload={() => console.log("Download clicked")}
/>
```

## API Routes

- `GET /api/reportes/[id]` - Obtener reporte
- `POST /api/reportes/[expedientId]/generate` - Generar certificado
- `GET /api/reportes/[id]/download` - Descargar PDF

## Status

- ✅ MVP Scaffold
- ✅ CertificateViewer component
- 🔄 API routes integration
- ⏳ PDF generation (react-pdf integration)
