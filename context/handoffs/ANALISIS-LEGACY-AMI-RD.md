# Análisis del Repositorio Legacy: ami-rd

> **Fecha de análisis:** 2026-01-12  
> **Analizado por:** INTEGRA - Arquitecto  
> **Objetivo:** Documentar dependencias, componentes y estrategia de migración a INTEGRA v2.0

---

## 1. Resumen Ejecutivo

El repositorio `ami-rd` contiene un proyecto denominado **Residente Digital con IA (RD-AMI)** para automatizar la ingesta, procesamiento y emisión de expedientes médicos ocupacionales. Está construido sobre una versión anterior de la metodología INTEGRA ("Integra Evolucionada") y tiene varios componentes interdependientes.

### Componentes Críticos Identificados

| Componente | Tipo | Dependencias | Prioridad de Migración |
|------------|------|--------------|------------------------|
| `progressdashboard/` | Frontend estático | `PROYECTO.md`, `scripts/lib/progress.js` | 🔴 ALTA |
| `status-site/` | Frontend estático | `PROYECTO.md`, `scripts/sync-dashboard.js` | 🔴 ALTA |
| GitHub Actions (2 workflows) | CI/CD | Secrets de cPanel, `progressdashboard/parser.js` | 🔴 ALTA |
| `scripts/lib/progress.js` | Parser de PROYECTO.md | Marcadores en `PROYECTO.md` | 🔴 ALTA |
| `infra/terraform/` | IaC (GCP) | Variables y providers | 🟡 MEDIA |
| `context/` (documentación) | Referencia | Ninguna | 🟢 BAJA (solo lectura) |

---

## 2. Arquitectura del Sistema Legacy

### 2.1 Flujo de Datos del Progress Dashboard

```
PROYECTO.md (fuente de verdad)
    │
    ├── [Marcadores: <!-- progress-modules:start/end -->]
    │
    ▼
scripts/lib/progress.js (parseModules)
    │
    ├──▶ progressdashboard/parser.js → data/project_data.json
    │         │
    │         └──▶ progressdashboard/app.js (consume JSON)
    │                    │
    │                    └──▶ progressdashboard/index.html (UI)
    │
    └──▶ scripts/sync-dashboard.js → status-site/data/status.json
              │
              └──▶ status-site/app.js (consume JSON)
                       │
                       └──▶ status-site/index.html (UI)
```

### 2.2 GitHub Actions Identificadas

#### Workflow 1: `deploy-status-site.yml`
- **Trigger:** Push a `main` en paths `PROYECTO.md`
- **Acciones:**
  1. Checkout del código
  2. Setup Node.js 18
  3. Ejecuta `node progressdashboard/parser.js`
  4. Auto-commit de `progressdashboard/data/project_data.json`
- **Secrets requeridos:** Ninguno (solo auto-commit)

#### Workflow 2: `validate-bootstrap.yml`
- **Trigger:** Push a cualquier branch, PR, workflow_dispatch, releases
- **Acciones:**
  1. Ejecuta `scripts/ensure_baseline.sh`
  2. Crea checkpoints en releases
  3. Auto-commit de cambios
- **Secrets requeridos:** Ninguno (usa GITHUB_TOKEN implícito)

### 2.3 Estructura de `PROYECTO.md` (Formato Crítico)

El archivo `PROYECTO.md` legacy tiene una estructura específica que **alimenta los dashboards**:

```markdown
## Tablero — Módulos fuente
<!-- progress-modules:start -->
| id | name | phase | phaseOrder | owner | status | progress | summary | needs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fase0-dashboard | Progreso AMI Dashboard | FASE 0 – MVS | 0 | Frontend | done | 100 | ... | ... |
<!-- progress-modules:end -->
```

**Campos obligatorios del parser:**
- `id`: Identificador único del módulo
- `name`: Nombre visible
- `phase`: Fase a la que pertenece
- `phaseOrder`: Orden numérico para ordenar fases
- `owner`: Responsable/área
- `status`: `pending | progress | blocked | done`
- `progress`: 0-100 (porcentaje)
- `summary`: Descripción breve
- `needs`: Bloqueos/necesidades (puede estar vacío)

---

## 3. Dependencias Técnicas

### 3.1 Scripts de Node.js

| Script | Ruta | Función |
|--------|------|---------|
| `sync-dashboard.js` | `scripts/` | Genera `status-site/data/status.json` |
| `parser.js` | `progressdashboard/` | Genera `progressdashboard/data/project_data.json` |
| `progress.js` | `scripts/lib/` | **Módulo compartido** - parsea la tabla de módulos |

### 3.2 Infraestructura Terraform (GCP)

Ubicación: `infra/terraform/`

**Recursos definidos:**
- `google_project` (condicional)
- `google_project_service` (APIs: Firestore, Storage, Pub/Sub, Cloud Run, etc.)
- `google_app_engine_application`
- `google_firestore_database`
- `google_storage_bucket` (para PDFs)
- `google_pubsub_topic` (múltiples topics)
- `google_service_account` (orchestrator)
- IAM bindings (pubsub.publisher, storage.objectAdmin)

**Variables requeridas:** Ver `variables.tf` y `terraform.tfvars.example`

### 3.3 Frontends Estáticos

| Frontend | Tecnología | Hosting actual | URL conocida |
|----------|------------|----------------|--------------|
| `progressdashboard/` | HTML + Tailwind CDN + Vanilla JS | cPanel (Plesk) | `vcorp.mx/progress-ami/progressdashboard/` |
| `status-site/` | HTML + Tailwind CDN + Vanilla JS | cPanel | Desconocida |

---

## 4. Contexto de Dominio (Documentación Clínica)

### 4.1 Carpeta `context/01_Contexto_Clinico/`
**Archivos de estudios médicos (PDFs de referencia):**
- Audiometría, Campimetría, Electrocardiograma, Espirometría
- Examen Médico, Formato Riesgo Cardiovascular
- Laboratorios (3 archivos), Resumen Médico
- RX Columna (AP/LAT), RX Interpretación
- Toxicológico 5 elementos

> **Uso:** Plantillas de referencia para el motor OCR/extractor

### 4.2 Carpeta `context/04_Documentacion_Sintetica/`
- `01_Vision_General_Proyecto.md`
- `02_Especificacion_Funcional.md`
- `03_Diseno_Tecnico_Inicial.md`
- `04_Plan_Pruebas_Preliminar.md`
- `05_Estrategia_Despliegue.md`
- `resumen_para_arquitecto.md`

### 4.3 Otros Contextos
- `context/03_Contexto_Legal/` - Probable documentación LFPDPPP/NOM
- `context/AMI a Residente Digital/` - Material de transición
- `context/RD-AMI_Paquete_MANUS/` - Paquete de especificaciones externas
- `context/Cronograma_Desarrollo_RD-AMI.md` - Timeline comprometido

---

## 5. Configuración de Asistentes (Continue)

Ubicación: `.continue/`

**Asistentes definidos:**
1. `aria-arquitecta.json` - Modelo: gpt-5/gpt-4o, rol Arquitecta
2. `ines-ejecutora.json` - Modelo: gpt-4o/gpt-5, rol Ejecutora

> **Nota:** Esta configuración de Continue es **obsoleta** para el nuevo repo que usa Copilot con metodología INTEGRA v2.0

---

## 6. Stack Tecnológico Identificado

| Capa | Tecnología | Notas |
|------|------------|-------|
| **Frontend** | Next.js + TypeScript + Tailwind + shadcn/ui + Framer Motion | Planeado, no implementado |
| **Mobile** | Expo + NativeWind | Planeado para Fase 3 |
| **Backend** | Cloud Run / Cloud Functions (Node.js + Python) | IaC definida |
| **Base de Datos** | Firestore (native mode) | Terraform listo |
| **Storage** | Cloud Storage | Bucket con versionado |
| **Eventos** | Cloud Pub/Sub | Topics definidos |
| **OCR** | Document AI / pdfminer + pytesseract | Solo especificado |
| **Auth** | Firebase Auth (Custom Claims) | Solo especificado |
| **Observabilidad** | Cloud Monitoring + Looker Studio | Solo especificado |
| **CI/CD** | GitHub Actions → cPanel (FTP) | 2 workflows activos |

---

## 7. Secrets y Variables de Entorno

### 7.1 Secrets de GitHub (para Actions)
Para el deploy a cPanel:
- `CPANEL_HOST`
- `CPANEL_USERNAME`
- `CPANEL_PASSWORD`
- `CPANEL_PORT`
- `CPANEL_TARGET_DIR`

### 7.2 Variables de Entorno (`.env.example`)
```
OPENAI_API_KEY=
ENV=dev
CLIENT=AMI
PROJECT=RD-AMI
```

---

## 8. Dependencias entre Componentes (Mapa)

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROYECTO.md                              │
│  (Fuente de verdad - con marcadores progress-modules)          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              scripts/lib/progress.js                            │
│  (Parser compartido - función parseModules)                     │
└─────────────────┬───────────────────┬───────────────────────────┘
                  │                   │
                  ▼                   ▼
┌────────────────────────┐  ┌────────────────────────────────────┐
│ progressdashboard/     │  │ scripts/sync-dashboard.js          │
│ parser.js              │  │ (genera status.json)               │
└──────────┬─────────────┘  └──────────────┬─────────────────────┘
           │                               │
           ▼                               ▼
┌────────────────────────┐  ┌────────────────────────────────────┐
│ progressdashboard/     │  │ status-site/data/status.json       │
│ data/project_data.json │  └──────────────┬─────────────────────┘
└──────────┬─────────────┘                 │
           │                               ▼
           ▼                 ┌────────────────────────────────────┐
┌────────────────────────┐  │ status-site/app.js                 │
│ progressdashboard/     │  │ (consume status.json)              │
│ app.js (consume JSON)  │  └──────────────┬─────────────────────┘
└──────────┬─────────────┘                 │
           │                               ▼
           ▼                 ┌────────────────────────────────────┐
┌────────────────────────┐  │ status-site/index.html             │
│ progressdashboard/     │  │ (Dashboard público para AMI)       │
│ index.html             │  └────────────────────────────────────┘
└────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions                               │
├─────────────────────────────────────────────────────────────────┤
│ deploy-status-site.yml:                                         │
│   - Trigger: push a main (paths: PROYECTO.md)                   │
│   - Ejecuta: progressdashboard/parser.js                        │
│   - Auto-commit: project_data.json                              │
├─────────────────────────────────────────────────────────────────┤
│ validate-bootstrap.yml:                                         │
│   - Trigger: push/PR/release                                    │
│   - Ejecuta: scripts/ensure_baseline.sh                         │
│   - Crea checkpoints en releases                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Riesgos Identificados

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Parser depende de marcadores exactos en PROYECTO.md | Alto | Documentar formato obligatorio |
| Secrets de cPanel no migrados | Alto | Configurar en nuevo repo |
| ~~Dos dashboards similares (redundancia)~~ | ~~Medio~~ | ✅ Resuelto: solo `progressdashboard/` |
| Terraform no probado (sin state) | Medio | Validar antes de aplicar |
| ~~Configuración Continue obsoleta~~ | ~~Bajo~~ | ✅ Resuelto: usar Copilot agents |
| Archivos Zone.Identifier (Windows) | Bajo | Limpiar al migrar |
| **🔴 Lifecycle de Storage borra datos al año** | **Crítico** | **Revisar compliance médico** |
| **🟠 IAM demasiado permisivo** | **Alto** | **Restringir a nivel recurso** |

---

## 9.1 Evaluación de Terraform por GEMINI-CLOUD-QA (2026-01-12)

### Resumen Ejecutivo
El código Terraform existente es una **base moderna y limpia**, pero **incompleta** para los estándares de producción de un sistema de datos médicos ("Medical Records") y la metodología INTEGRA v2.0.

### Recomendación Final: **ADAPTAR (Major Refactor)**
Utilizar el código base para la configuración del proyecto y servicios básicos, pero extenderlo significativamente para cubrir seguridad, base de datos SQL y computación.

### Análisis Detallado

| Categoría | Estado | Observaciones |
|-----------|--------|---------------|
| **Estructura** | 🟢 Bueno | Modularización correcta, versiones de provider actuales (`hashicorp/google ~> 5.23`). |
| **APIs** | 🟡 Parcial | Habilita servicios core (Firestore, Run, Storage) pero falta `aiplatform` (Vertex AI) si se usa IA nativa. |
| **Almacenamiento** | 🔴 **Riesgo** | Bucket `pdfs` configurado para **borrar datos al año (365 días)**. Posible violación de compliance médico. |
| **Base de Datos** | 🟡 Incompleto | Provisiona Firestore (Nativo). **Falta Cloud SQL**, mencionado en la arquitectura objetivo. |
| **Seguridad IAM** | 🟠 Mejorable | `rd-ami-orchestrator` tiene permisos `storage.objectAdmin` en todo el proyecto. Debe restringirse al bucket específico. |
| **Networking** | ⚪ Ausente | No hay definición de VPC ni conectores Serverless. Todo tráfico es público/API Google. |

### Hallazgos Críticos de Seguridad/Compliance

1. **⚠️ Retención de Datos (Riesgo Legal)**
   - El bucket tiene regla lifecycle que **elimina objetos después de 365 días**
   - Para expedientes médicos, las leyes laborales/salud suelen exigir retenciones de **5-10 años**
   - **Acción:** Cambiar a Nearline/Coldline para archivo a largo plazo, o eliminar la regla

2. **⚠️ Privilegios IAM (Granularidad)**
   - Service Account `orchestrator` tiene `roles/storage.objectAdmin` a nivel de **Proyecto entero**
   - **Acción:** Restringir al bucket `google_storage_bucket.pdfs` específicamente

3. **⚠️ Encriptación**
   - Usa encriptación por defecto de Google
   - **Considerar:** CMEK (Customer-Managed Encryption Keys) para datos médicos sensibles

4. **⚠️ Ubicación de Datos**
   - Recursos en `us-central1` por defecto
   - **Verificar:** Soberanía de datos requerida para el proyecto RD-AMI

### Acciones Requeridas para Migración

| # | Acción | Prioridad |
|---|--------|-----------|
| 1 | Modificar `lifecycle_rule` del bucket (eliminar `Delete` a 365 días) | 🔴 CRÍTICA |
| 2 | Cambiar `google_project_iam_member` → `google_storage_bucket_iam_member` | 🔴 ALTA |
| 3 | Añadir `google_secret_manager_secret` para credenciales | 🟡 MEDIA |
| 4 | Añadir módulos Cloud Run si se desea IaC completo | 🟡 MEDIA |
| 5 | Evaluar VPC Connector para Cloud Run ↔ Firestore privado | 🟢 BAJA |
| 6 | Confirmar región válida para datos del cliente AMI | 🟡 MEDIA |

### Recursos Faltantes Identificados

- ❌ **Cloud SQL:** No hay definición para base de datos relacional
- ❌ **Secret Manager secrets:** API habilitada pero sin recursos creados
- ❌ **Cloud Run/Functions:** APIs habilitadas pero sin definición de servicios
- ❌ **Networking:** Sin VPC, conectores serverless ni restricciones de red

---

## 10. Recomendaciones de Migración

### Fase 1: Preparación (Inmediata)
1. ✅ Importar repo legacy a `context/LEGACY_IMPORT/ami-rd`
2. ⏳ **Documentar este análisis** (este archivo)
3. ⏳ Definir qué componentes se reutilizan vs. reescriben

### Fase 2: Infraestructura de Dashboard
1. Copiar `scripts/lib/progress.js` a `/scripts/lib/`
2. Copiar `progressdashboard/` o `status-site/` a raíz (elegir uno)
3. Adaptar formato de `PROYECTO.md` para incluir marcadores `progress-modules`
4. Crear workflows de GitHub Actions adaptados

### Fase 3: Documentación
1. Migrar documentación relevante de `context/04_Documentacion_Sintetica/`
2. Crear nuevos SPECs según plantillas de INTEGRA v2.0
3. Actualizar `00_ARQUITECTURA_PROPUESTA.md` con stack confirmado

### Fase 4: Infraestructura GCP (Opcional)
1. Revisar y adaptar Terraform
2. Configurar secrets de GCP en GitHub
3. Validar con `terraform plan`

---

## 11. Decisiones del Usuario (2026-01-12)

| Pregunta | Decisión |
|----------|----------|
| ¿Mantener ambos dashboards? | **Solo `progressdashboard/`** → `vcorp.mx/progress-ami/progressdashboard/` |
| ¿Hosting? | **cPanel/Plesk** (dominio vcorp.mx existente) |
| ¿Documentación clínica? | **Preservar toda** sin cambios |
| ¿Secrets de cPanel? | **Los mismos** ya configurados en el repo anterior |
| ¿Terraform de GCP? | **Pendiente evaluación por GEMINI-CLOUD-QA** |

### Componentes a migrar (confirmados)
- ✅ `progressdashboard/` → copiar a raíz del nuevo repo
- ✅ `scripts/lib/progress.js` → copiar a `/scripts/lib/`
- ✅ `progressdashboard/parser.js` → mantener
- ✅ `.github/workflows/deploy-status-site.yml` → adaptar para nuevo repo
- ✅ Documentación clínica en `context/01_Contexto_Clinico/` → referencia
- ⏳ `infra/terraform/` → pendiente evaluación GEMINI

### Componentes descartados
- ❌ `status-site/` → no necesario (redundante)
- ❌ `.continue/` → obsoleto, usamos Copilot agents

---

## 12. Archivos Clave para Referencia Rápida

| Archivo | Ruta Legacy | Propósito |
|---------|-------------|-----------|
| Parser de módulos | `scripts/lib/progress.js` | Extraer tabla de PROYECTO.md |
| Parser dashboard | `progressdashboard/parser.js` | Generar JSON para dashboard |
| Sync dashboard | `scripts/sync-dashboard.js` | Generar status.json |
| Workflow deploy | `.github/workflows/deploy-status-site.yml` | CI/CD para dashboard |
| Workflow bootstrap | `.github/workflows/validate-bootstrap.yml` | Validación y checkpoints |
| Terraform main | `infra/terraform/main.tf` | IaC de GCP |
| Arquitectura legacy | `context/00_ARQUITECTURA_PROPUESTA.md` | Referencia arquitectónica |
| Visión del proyecto | `context/04_Documentacion_Sintetica/01_Vision_General_Proyecto.md` | Objetivos originales |

---

*Documento generado como parte de la Tarea 1.2 (Gap Analysis) del proyecto AMI-SYSTEM.*
