# Propuesta Técnica RD-AMI (Integra Evolucionada)

**Cliente:** AMI — Residente Digital (RD).  
**Fecha:** 2025-11-06.  
**Alcance:** Consolidar el marco técnico-operativo para el piloto RD-AMI (MVS + Fase 1) asegurando trazabilidad, modularidad e integración con aceleradores UI/UX.

---

## 1. Resumen Ejecutivo
RD-AMI centraliza la ingesta de estudios clínicos en PDF y automatiza su procesamiento hasta la emisión de Reportes Institucionales con folio/QR y entrega controlada. La arquitectura Integra Evolucionada separa capas (dominio, aplicación, plataforma) y privilegia cambios incrementales, observabilidad y aceleradores UI/UX (Next.js + Tailwind + shadcn/ui, Expo + NativeWind para mobile futuro).

---

## 2. Objetivos del Piloto (6–8 semanas)
- Procesar end-to-end al menos 10 expedientes reales (Empresa → Paciente → Orden → Estudio).
- Automatizar ingesta, clasificación, extracción/normalización, semáforos y validación médica.
- Emitir Papeleta y Expediente con folio/QR y enlaces caducables.
- Registrar bitácora completa y métricas operativas (TAT, rechazos, reprocesos).

---

## 3. Principios Integra Evolucionada
- **Modularidad por capas:** dominio (reglas, folios), aplicación (servicios, APIs), plataforma (infraestructura GCP/Firebase).
- **Trazabilidad total:** folio Empresa–Paciente–Orden–Estudio–Fecha, auditoría y versiones.
- **Decisiones documentadas:** Trazabilidad del "porqué" mediante Architecture Decision Records (ADRs) para elecciones técnicas clave.
- **Aceleradores UI/UX:** Next.js + TypeScript + Tailwind + shadcn/ui + Framer Motion; Expo + NativeWind en etapa móvil.
- **Política fast-path:** crear/editar sin confirmación; confirmar solo acciones destructivas.
- **Observabilidad y checklists:** logs estructurados, métricas de IA, checklist de calidad por módulo.

---

## 4. Alcance Funcional (Módulos)
1. **Ingesta/ETL**  
   - Watcher multi-fuente (buzón/carpeta/SFTP) + colas Pub/Sub.  
   - Control de duplicados (hash + metadatos).  
   - Persistencia inicial en GCS.
2. **Clasificación e Identidad**  
   - Extracción de metadatos clave (Empresa, Paciente, Orden, Estudio, Fecha).  
   - Folio único y agrupación de estudios.  
   - Registro en auditoría.
3. **Extracción/OCR y Normalización**  
   - `pdfminer.six`/Document AI + plantillas de anclas.  
   - Normalizador por estudio (BH, QS24, RX, Audiometría, Espirometría, ECG, Campimetría, Toxicológico).  
   - Confianza y flags críticos.
4. **Motor de Reglas/Semáforos**  
   - JSON Rules Engine (Node/TS) con catálogo de reglas clínicas.  
   - Semáforos por parámetro y dictamen sugerido (A/A-Cond./NA).  
   - Observaciones IA.
5. **Validación Médica Web**  
   - Panel Next.js (SSR/ISR) con roles por sede-cliente.  
   - Formularios editables + viewer PDF + comparativo IA/Humano.  
   - Firma electrónica y versionado de dictamen.
6. **Emisión de PDFs**  
   - Templates institucionales (Reporte y Expediente).  
   - Folio/QR, sellos de tiempo, hash de versión.  
   - Registro automático de versiones.
7. **Entrega Segura**  
   - Enlaces firmados y caducables, emails con SendGrid/Mailgun.  
   - Control de descargas (IP, user, timestamp).  
8. **Auditoría y Métricas**  
   - Logs estructurados, DLQ para reprocesos.  
   - Dashboard de TAT, rechazos, precisión IA, carga operativa.

---

## 5. Arquitectura Técnica
### 5.1. Capas
- **Frontend:** Next.js + TypeScript + Tailwind + shadcn/ui + Framer Motion.  
  - Estado con React Query/Zustand; autenticación via Firebase Auth.  
  - Opcional: Expo + NativeWind para mobile (lectura de expedientes).
- **Backend Servicios:**  
  - Cloud Run / Cloud Functions para ingesta, parsing, normalizador, motor de reglas, emisión, entrega.  
  - Node.js (TypeScript) para APIs REST; Python para OCR especializado si aplica.  
  - Pub/Sub como bus de eventos; DLQ configurada.
- **Datos y Almacenamiento:**  
  - Firestore para metadatos, configuraciones, auditoría.  
  - Cloud SQL (PostgreSQL) opcional para relaciones complejas y reportes.  
  - GCS para PDFs originales y emitidos (versionado + lifecycle).  
  - Redis (MemoryStore) como caché opcional para expedite metrics.

### 5.2. Integraciones Clave
- **OCR/IA:** Document AI, Tesseract, pdfminer.six.  
- **Envío:** SendGrid/Mailgun.  
- **Identidad:** Firebase Auth/Google Identity Platform.  
- **Observabilidad:** Cloud Logging, Cloud Monitoring, Cloud Trace.  
- **CI/CD + IaC:** GitHub Actions + Cloud Build (imágenes Docker) y Terraform como IaC para versionar la infraestructura GCP (proyectos, servicios, IAM, Pub/Sub, buckets) y asegurar entornos Dev/Staging/Prod reproducibles bajo Integra Evolucionada.

### 5.3. Diagramas (referencia)
- Flujo E2E (Ingesta→Entrega) según `context/04_Documentacion_Sintetica/02_Especificacion_Funcional.md`.  
- Arquitectura general en `context/04_Documentacion_Sintetica/03_Diseno_Tecnico_Inicial.md`.

### 5.4. Justificación de la Arquitectura
- **Alineada con los demos entregados**: el frontend Next.js replica la experiencia que AMI ya vio (`https://vcorp.mx/AMI/RD/`), lo que acelera la validación UX y asegura continuidad entre prototipo y producto.
- **Procesamiento IA desacoplado**: los extractores/Gemini (lector) corren como servicios independientes conectados por Pub/Sub, lo que permite escalar OCR/LLM sin bloquear al panel ni a los médicos.
- **Servicios administrados en GCP/Firebase**: minimizan operación (auto-escalan, logging integrado) y facilitan la trazabilidad exigida por Integra Evolucionada (logs estructurados, Cloud Trace).
- **Datos segmentados**: Firestore para metadatos/auditoría y Cloud SQL opcional para reportes complejos garantizan que cada tipo de dato tenga su almacén óptimo sin comprometer PII/PHI.
- **Entrega segura out-of-the-box**: Cloud Functions/Run generan links caducables y registran accesos en la misma capa de auditoría, cumpliendo el requisito de bitácora total y antifraude (QR/folio).
- **Infraestructura versionada**: Terraform como IaC asegura que cada recurso GCP tenga historia y validaciones (plan/apply) antes de llegar a producción, habilitando rollbacks seguros y entornos consistentes.
- **Experiencia local (DevEx)**: el uso del Firebase Local Emulator Suite para Firestore/Auth/Functions, junto con contenedores para servicios auxiliares, permite desarrollar y probar offline, acelerando ciclos y reduciendo costos cloud mientras mantenemos paridad con Staging/Prod.
- **Evolución móvil planeada**: Expo + NativeWind queda lista para un lector/validador móvil sin rehacer componentes, reforzando la estrategia de aceleradores UI/UX.

### 5.5. Gestión de Configuración
Para asegurar la flexibilidad y el control sobre el comportamiento del sistema sin necesidad de redesplegar código, la configuración se manejará de la siguiente manera:

- **Configuraciones Dinámicas (en Firestore):** Parámetros que pueden necesitar ajustes frecuentes por parte de los administradores o médicos (ej. umbrales del motor de reglas, catálogos de estudios, textos dinámicos de la UI). Se almacenarán en una colección `config` en Firestore, con una UI de administración para su edición controlada.
- **Configuraciones Estáticas (en Repositorio):** Parámetros que definen el comportamiento fundamental de la aplicación y cambian con menos frecuencia (ej. configuración de servicios externos, formatos de folio). Se gestionarán en archivos `*.json` o `*.yaml` dentro de un directorio `/config` en el repositorio, asegurando que su versionado y despliegue sigan el flujo de CI/CD.
- **Secretos y Variables de Entorno:** Se seguirán gestionando a través de `.env` (local) y Secret Manager (GCP), con su correspondiente `env.example` en el repositorio, como ya está establecido.
---

## 6. Modelo de Datos (resumen)
- **Expediente**  
  - `folio` (Empresa–Paciente–Orden–Estudio–Fecha).  
  - `empresaId`, `pacienteId`, `ordenId`, `estudios[]`.  
  - `estado` (recepción, parsing, validación, emitido, entregado).  
  - `dictamenIA`, `dictamenMedico`, `firmas`.  
- **Estudio**  
  - `tipo`, `fuentePDF`, `datosNormalizados`, `confianza`, `semaforos`.  
- **Entrega**  
  - `linkId`, `estado`, `caducidad`, `descargas[]`.  
- **Bitácora**  
  - `eventId`, `folio`, `actor`, `acción`, `payload`, `timestamp`.

---

## 7. Seguridad y Cumplimiento
- Cifrado en tránsito (TLS) y en reposo (GCS, Firestore, Cloud SQL).  
- RBAC por rol/cliente/sede, MFA para usuarios médicos.  
- Segregación de entornos (Dev/Staging/Prod) y proyectos GCP separados.  
- Cumplimiento LFPDPPP y NOM-024-SSA3-2012; auditoría inmutable (Cloud Audit Logs).  
- Escrow, SLA (RTO 8h / RPO 24h piloto) alineado con cronograma.

---

## 8. Observabilidad y Calidad
- Logs estructurados (JSON) etiquetados por `folio` y `traceId`.  
- Métricas (Prometheus/Cloud Monitoring): TAT, precisión IA, carga por módulo.  
- Tracing distribuido (Cloud Trace) desde ingesta hasta emisión.  
- Plan de pruebas según `context/04_Documentacion_Sintetica/04_Plan_Pruebas_Preliminar.md`: unitarias (Jest/Pytest), integración, E2E (Playwright), rendimiento (k6), seguridad (SAST/DAST).  
- Checklist de calidad por release (ingesta, semáforos, panel médico, emisión, entrega).

---

## 9. Roadmap Técnico (resumen)
| Semana | Entregable | Notas |
|--------|------------|-------|
| 1–2 | Ingesta + Clasificación + Parsing base (Lab/RX) | Subida manual y watcher básico; primer flujo completo (MVS). |
| 3–4 | Normalizador + Motor de Reglas + Panel Validación | Semáforos y UI Next.js con roles. |
| 5 | Emisión PDF + Entrega Segura + Auditoría | Reporte con folio/QR y enlaces caducables. |
| 6–8 | Ajustes con datos reales + Métricas + Go/No-Go Piloto | Pruebas, tuning IA, documentación médica. |

Se alinea con el cronograma general (`context/Cronograma_Desarrollo_RD-AMI.md`): Fase 0 (MVS) → Fase 1 (Piloto Operativo).

---

## 10. Riesgos y Mitigaciones
- **Variabilidad de PDFs** → Motor de anclas configurable, fallback OCR, validación médica obligatoria.  
- **Identidad ambigua** → Validaciones cruzadas y llaves compuestas; reglas de negocio en clasificación.  
- **Calidad IA** → Métricas de precisión, dataset de referencia (PDFs clínicos AMI), ciclo de retroalimentación médico.  
- **Costos cloud** → Uso de servicios serverless/autoescala, monitoreo de costos, batching de procesos.  
- **Seguridad/Privacidad** → RBAC estricto, enlaces caducables, cifrado, monitoreo de accesos.  
- **Disponibilidad de modelos GPT** → Fallback gpt-4o; no bloquear flujo operativo.  
- **Acoplamiento proveedor** → Adaptadores y documentación para migrar de GCP si se requiere.

---

## 11. Próximos Pasos
1. Validar esta propuesta con stakeholders técnicos/médicos.  
2. Derivar backlog priorizado (épicas por módulo) y asignar responsables.  
3. Configurar repositorio de infraestructura (IaC) y pipelines CI/CD.  
4. Preparar datasets anonimizados y plantillas de extracción para MVS.  
5. Iniciar fase MVS siguiendo checklist de calidad y bitácora Integra Evolucionada.

---

## 12. Referencias de Contexto
- `context/04_Documentacion_Sintetica/01_Vision_General_Proyecto.md`  
- `context/04_Documentacion_Sintetica/02_Especificacion_Funcional.md`  
- `context/04_Documentacion_Sintetica/03_Diseno_Tecnico_Inicial.md`  
- `context/04_Documentacion_Sintetica/04_Plan_Pruebas_Preliminar.md`  
- `context/04_Documentacion_Sintetica/05_Estrategia_Despliegue.md`  
- `context/dossier_tecnico.md`  
- `context/Cronograma_Desarrollo_RD-AMI.md`  
- `context/04_Documentacion_Sintetica/resumen_para_arquitecto.md`
