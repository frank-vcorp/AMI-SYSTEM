# PROYECTO: RD-AMI (Cliente: AMI)

## Flujo de estados
- [x] Pendiente
- [x] En Progreso (Planeación y scaffolding)
- [ ] Hecho
- [ ] Aprobado

## Objetivo general
Implementar el **Residente Digital con IA (RD-AMI)** para automatizar la ingesta, procesamiento y emisión de expedientes médicos ocupacionales, alineado con el ecosistema de Google Cloud y los hitos comprometidos con Alan (CEO de AMI).

## Entregables clave por fase
| Fase | Objetivo | Entregables de salida | Estado |
|------|----------|-----------------------|--------|
| FASE 0 – MVS (Sem 1-4) | Validar extremo a extremo con 1 expediente completo | Ingesta manual, pipeline OCR/normalizador inicial, panel médico básico, emisión PDF con folio y QR | Planeado |
| FASE 1 – Piloto (Sem 5-12) | Procesar 10 expedientes reales con ajustes clínicos | Ingesta automatizada (carpeta/SFTP), motor de reglas semafórico, dashboard médico, bitácora y métricas iniciales | Planeado |
| FASE 2 – Consolidación (Sem 12-24) | Versión institucional lista para operación | Integraciones ECG/Campimetría/Toxicológico, roles multi-sede, dashboard ejecutivo, documentación y despliegue estable en GCP | Planeado |
| FASE 3 – Producción (24+) | Operación comercial y SLA | Monitoreo 24/7, mantenimiento evolutivo, roadmap de mejoras | Planeado |

## Backlog técnico priorizado (Integra Evolucionada)

El backlog se alinea al cronograma comprometido con Alan (MVS semanas 1‑4, Piloto semanas 5‑12) y se estructura por épicas/US con criterios de aceptación (CA) y checklists de calidad (CQ). Cada historia debe registrar bitácora y pruebas asociadas antes de moverse a “Done”.

> Nota: Estas etapas y tareas son las planeadas a partir del demo y el cronograma vigente. Es probable que surjan ajustes o nuevos entregables conforme avancemos; cualquier cambio se documentará y se agregará aquí oportunamente para mantener trazabilidad con AMI.

### FASE 0 – MVS (Semanas 1‑4)
| Epic | User Story | Descripción | CA/CQ principales | ETA |
|------|------------|-------------|-------------------|-----|
| E0.1 Infraestructura lista | US0.1 – Como arquitecto quiero provisionar proyecto GCP/Firebase con IaC | Terraform + GitHub Actions crean proyecto, habilitan Firestore/Storage/Pub/Sub, IAM mínimo | CA: Terraform plan/apply aprobado, Firestore en modo native con reglas básicas, buckets con CMEK; CQ: checklist seguridad inicial (cifrado, etiquetas de costo) | Semana 1 |
| | US0.2 – Como dev necesito emuladores locales | Configurar Firebase Emulator Suite (Auth/Firestore/Functions) + contenedores OCR para dev offline | CA: scripts `npm run dev:emulators`, documentación en README; CQ: pruebas smoke locales | Semana 1 |
| E0.2 Ingesta manual controlada | US0.3 – Como operador quiero subir PDFs y generar folio | UI/CLI que sube a GCS, calcula hash y emite evento Pub/Sub con metadatos Empresa→Paciente→Orden→Estudio→Fecha | CA: folio único en Firestore, duplicado bloqueado, bitácora del evento; CQ: prueba con expediente demo AMI | Semana 2 |
| E0.3 Parsing + Normalización base | US0.4 – Como sistema necesito extraer datos Lab/RX/Audiometría/Espirometría de PDFs nativos | Servicio Python (Document AI/pdfminer) que aplica plantillas Manus y genera JSON normalizado | CA: ≥85 % campos cubiertos en dataset demo, logs por ancla, versionado de plantilla; CQ: pruebas unitarias por extractor usando `02_MAPEO` | Semana 2 |
| | US0.5 – Como médico quiero ver semáforos preliminares | Motor JSON Rules (umbrales Manus) genera semáforos por parámetro + dictamen sugerido | CA: reglas Hb/FVC/RX/Riesgo CV cargadas; CQ: simulaciones documentadas (verde/ámbar/rojo) | Semana 3 |
| E0.4 Panel médico v0 | US0.6 – Como médico validador quiero revisar y editar datos extraídos | Next.js + Firebase Auth muestra PDF vs datos y permite ajustes/observaciones | CA: login médico habilitado, edición con bitácora, estado `Validación pendiente`; CQ: pruebas E2E Playwright (flujo single expediente) | Semana 3 |
| E0.5 Emisión y Papeleta | US0.7 – Como médico quiero emitir reporte + papeleta con QR | Servicio Node/Cloud Run genera PDFs institucional y papeleta (especificación Manus) tras firma | CA: QR apunta a URL caducable, reimpresión registrada, templates responsive; CQ: checklist Papeleta (`PAPELETA_spec.md`) | Semana 4 |
| E0.6 Observabilidad mínima | US0.8 – Como líder quiero rastrear cada expediente | Bitácora estructurada (Firestore/BigQuery) con traceId=folio, export a Looker sheet | CA: logs ingestion→emisión, alerta básica (Pub/Sub DLQ); CQ: reporte diario MVS | Semana 4 |

**Checklist Fase 0:** expediente demo procesado end-to-end, métricas base (TAT, precisión extracción), walkthrough con AMI agendado.

### FASE 1 – Piloto Operativo (Semanas 5‑12)
| Epic | User Story | Descripción | CA/CQ principales | ETA |
|------|------------|-------------|-------------------|-----|
| E1.1 Ingesta automatizada | US1.1 – Como operador quiero watchers SFTP/carpeta | Cloud Functions/Eventarc detectan nuevos archivos, aplican control de duplicados y encolan trabajo | CA: soporte SFTP + carpeta local, DLQ activa, alertas de falla; CQ: prueba con >5 archivos simultáneos | Sem 5 |
| E1.2 Normalizador & reglas avanzadas | US1.2 – Como especialista quiero mapear todos los módulos (incl. risco CV, toxicológico) | Diccionarios de unidades y catálogos cargados desde `Mapa_Campos_Sistema_AMI_RD.xlsx` | CA: 100 % campos críticos mapeados; CQ: reportes de cobertura por módulo | Sem 6 |
| | US1.3 – Como médico deseo calibrar reglas clínicamente | UI para versionar reglas y simular cambios antes de publicar | CA: historial de versiones, rollback, semáforo global; CQ: aprobación médico líder | Sem 6 |
| E1.3 Panel médico v1 | US1.4 – Como médico necesito bandeja de expedientes y filtros | Dashboard Next.js con estados (Ingesta→Entrega), filtros por empresa/sede, comentarios | CA: cola con SLA visual, edición colaborativa; CQ: pruebas de concurrencia | Sem 7 |
| E1.4 Dashboard & métricas | US1.5 – Como dirección quiero ver KPIs (TAT, rechazo, precisión) | ETL Firestore→BigQuery→Looker Studio con panel operativo | CA: KPIs diarios, export PDF semanal; CQ: validación con Alan | Sem 8 |
| E1.5 Entrega segura y bitácora | US1.6 – Como cliente quiero recibir enlaces caducables | Signed URLs + SendGrid, registro IP/usuario/fecha | CA: caducidad configurable, reenvíos auditados; CQ: prueba antifraude (QR) | Sem 8 |
| E1.6 QA/Mantenimiento | US1.7 – Como equipo necesito suites de pruebas y runbooks | Playwright E2E, Jest/Pytest unit, runbook incidentes, checklist Integra Evolucionada | CA: pipelines CI con coverage report, runbook publicado; CQ: simulacro de incidente | Sem 9-10 |
| E1.7 Dataset real | US1.8 – Como médico quiero validar con 10 expedientes reales | Carga anonimizada, seguimiento de ajustes post-validación, métricas de concordancia identidad | CA: 10 expedientes con dictamen final firmado; CQ: reporte comparativo (IA vs humano) | Sem 11-12 |

**Checklist Fase 1:** 10 expedientes reales procesados, métricas piloto entregadas a AMI, retroalimentación clínica integrada.

### FASE 2 y 3 (resumen)
- **Fase 2 – Consolidación (Sem 12‑24):** integrar ECG/Campimetría/Toxicológico, roles multi-sede, DRP/RPO 24 h, documentación NOM/LFPDPPP, observabilidad avanzada, CI/CD completo.  
- **Fase 3 – Producción (24+):** SLA 24/7, FinOps, roadmap evolutivo (feature flags, mobile Expo), soporte comercial.

### Backlog auxiliar permanente
- (Integra) Módulo de Dashboard de Avances: Crear un dashboard web auto-actualizable que refleje el estado de `PROYECTO.md`.
- Sitio ligero de seguimiento para AMI (estado de módulos + carga de evidencia).  
- Documentación continua (`context/04_Documentacion_Sintetica`, `RD-AMI_Paquete_MANUS`).  
- Estrategia de QA y despliegue (checkpoints, plan de pruebas, runbooks).  
- Requests de legales/comerciales (contratos `context/03`, acuerdos con Alan).

### Fase 0: Infraestructura y Visibilidad
- [✓] (Integra) Crear un dashboard de progreso web.
- [✓] (Integra) Configurar el parser de `PROYECTO.md` para generar datos de progreso.
- [✓] (Integra) Implementar el frontend del dashboard con Tailwind CSS.
- [✓] (Integra) Configurar la acción de GitHub para actualizar automáticamente los datos del dashboard.
- [✓] (Integra) Configurar el despliegue automático en el servidor de Plesk.

## Próximas acciones inmediatas
1. **Backlog → tareas JIRA/ClickUp:** crear tarjetas por US (US0.1–US0.8) con responsables y fechas comprometidas (Sem 1‑4).  
2. **Infraestructura:** correr Terraform inicial + documentar emuladores en `README.md`.  
3. **Plan con AMI:** compartir backlog y cronograma con Alan, agendar demo MVS (semana 4) y checkpoint piloto (semana 8).

### Tarjetas de trabajo (Sem 1‑4)
| ID | Descripción | Owner | Estatus |
|----|-------------|-------|---------|
| US0.1 | Provisionar proyecto GCP/Firebase con Terraform (APIs, Firestore, Storage, Pub/Sub, SA). | Sofía | En progreso |
| US0.2 | Configurar DevEx local (Firebase Emulator Suite, contenedores OCR) y documentar comandos. | Sofía | Pendiente |
| US0.3 | Ingesta manual → GCS+Pub/Sub con folio único y bitácora. | Sofía | Pendiente |
| US0.4 | Extractores OCR base (Lab/RX/Audiometría/Espirometría) con JSON normalizado. | Inés | Pendiente |
| US0.5 | Motor de reglas (Hb, FVC, RX, Riesgo CV) con simulaciones. | Inés | Pendiente |
| US0.6 | Panel médico v0 (Next.js + Auth + visor PDF/datos). | Sofía | Pendiente |
| US0.7 | Generador PDF institucional + Papeleta con QR caducable. | Inés | Pendiente |
| US0.8 | Bitácora estructurada + métricas base (TAT, precisión extracción). | Nano | Pendiente |

## Trabajo técnico por fase

### FASE 0 – MVS (Semanas 1-4)
**Objetivo:** Demostrar el flujo completo desde la ingesta manual de PDFs hasta la emisión del expediente con QR.  
**Tareas internas clave:**
- **Infraestructura GCP inicial:** crear proyecto, habilitar Firestore, Storage, Pub/Sub y Secrets Manager; definir naming convention y etiquetas de costos.
- **Config serverless:** aprovisionar Cloud Run/Firebase Functions (entorno Node/Python), definir entornos `staging` y `prod` y configurar CI para despliegues manuales.
- **Configuración de base de datos:** diseñar colecciones `expedientes`, `logs`, `templates`, índices y reglas de seguridad; cargar catálogos base (empresas, tipos de estudio).
- **Watcher de ingesta manual:** endpoint Next.js/API o script CLI que suba PDFs a Storage, calcule hash y genere eventos Pub/Sub.
- **Pipeline OCR/PDF parsing:** prototipo en Python (Document AI / `pdfminer` + `pytesseract`) empaquetado en Cloud Run; versionar plantillas por estudio.
- **Motor de reglas básico:** JSON Rules + función serverless que asigne semáforos y dicte aptitud preliminar.
- **Panel médico v0:** Next.js + Firebase Auth (correo/contraseña) con vista de validación, edición de campos y botón de emisión.
- **Generación de reportes:** servicio Node que usa plantillas (`pdfmake`/`react-pdf`) para emitir Papeleta/Expediente, incluye folio, QR y firma digital.
- **Bitácora mínima:** logging estructurado (`logs` collection) con `traceId=expedienteId` y exportación a BigQuery opcional.

### FASE 1 – Piloto Operativo (Semanas 5-12)
**Objetivo:** Procesar ≥10 expedientes reales con ingesta automatizada y tablero clínico.  
**Tareas internas clave:**
- **Automatización de ingesta:** watcher SFTP/carpeta (Eventarc + Cloud Functions) con colas Pub/Sub y DLQ.
- **Normalizador avanzado:** diccionarios de unidades, tablas de referencia en Firestore (`catalogs/rangos`) y pruebas unitarias.
- **Semaforización ampliada:** versionado de reglas clínicas, simulador para calibración y reporte de precisión por parámetro.
- **Panel médico v1:** historial de expedientes, filtros por empresa, comentarios y registro de re-trabajos.
- **Dashboard operativo:** ETL Firestore → BigQuery + Looker Studio (KPIs TAT, rechazo, reprocesos, backlog).
- **Entrega segura:** enlaces caducables (signed URLs) + bitácora de descargas y notificaciones por correo (SendGrid/Gmail API).
- **QA & datos:** dataset “golden” anonimizado, pruebas E2E (Playwright) y checklist de calidad previo a cada demostración.

### FASE 2 – Consolidación Institucional (Semanas 12-24)
**Objetivo:** Versión institucional estable con integraciones clínicas avanzadas y gobierno de datos.  
**Tareas internas clave:**
- **Nuevos estudios (ECG, Campimetría, Toxicológico):** plantillas OCR dedicadas, validación con médicos especialistas y monitoreo de accuracy.
- **Gobernanza y roles:** RBAC con Custom Claims, segregación por sede/cliente, auditoría completa (quién vio/descargó).
- **Operación multi-región:** políticas de retención, backups programados (Firestore export, Storage lifecycle) y DR básico (RPO 24h, RTO 8h).
- **Documentación & cumplimiento:** manuales operativos, checklist NOM/LFPDPPP, contratos y runbooks en `context/03`.
- **CI/CD completo:** GitHub Actions → Firebase Hosting/Cloud Run con gates para staging, pruebas automatizadas y reportes de cobertura.
- **Observabilidad avanzada:** Cloud Monitoring + alertas (latencia, costos, fallas OCR), integración con Slack/email.

### FASE 3 – Producción / Comercialización (24+ semanas)
**Objetivo:** Operación comercial con SLA, monitoreo 24/7 y roadmap evolutivo.  
**Tareas internas clave:**
- **SLA y soporte:** mesa de ayuda, rotación on-call, manual de incidentes y métricas MTTR/MTTI.
- **Cost management:** dashboards FinOps (BigQuery + Looker) con costo por expediente y alertas de presupuesto.
- **Roadmap evolutivo:** feature flags, experimentos IA generativa (explicaciones automáticas, respuesta a clientes) y canal mobile (Expo) cuando aplique.
- **Escalabilidad cliente:** plantillas multi branding, onboarding guiado y documentación comercial.

## Tablero — Módulos fuente
Este listado alimenta el progress dashboard y debe mantenerse actualizado. Usa los campos `status` (`pending|progress|blocked|done`) y `progress` (0-100).

<!-- progress-modules:start -->
| id | name | phase | phaseOrder | owner | status | progress | summary | needs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fase0-dashboard | Progreso AMI Dashboard | FASE 0 – MVS | 0 | Frontend | done | 100 | Vista pública con el avance del piloto para Alan/AMI. Entregable: https://vcorp.mx/progress-ami/progressdashboard/ (Sem 1–2). | Endpoint actualizado con datos reales del backlog. |
| fase0-arquitectura | Arquitectura GCP + Firebase | FASE 0 – MVS | 0 | Arquitectura | pending | 0 | Preparar el “ambiente base” (proyecto GCP, Firestore, Storage) para correr RD-AMI. Entregable: checklist de infraestructura validada con AMI (Sem 1–2). | Aprobación de presupuesto GCP y cuentas de servicio. |
| fase0-ocr | Pipeline de Ingesta y OCR | FASE 0 – MVS | 0 | Backend · Data | pending | 0 | Ensayar cómo subimos PDFs y obtenemos datos limpios (demo 1 expediente). Entregable: script de ingesta + JSON de ejemplo (Sem 1–2). | PDFs con sello médico y rangos de referencia validados. |
| fase0-panel-ui | UI Panel Médico | FASE 0 – MVS | 0 | Frontend | pending | 0 | Diseñar formularios (recepción, signos, validación) y navegación en Next.js/shadcn. Entregable: prototipo navegable listo para feedback clínico. | Wireframes finales y usuarios médicos confirmados. |
| fase0-ui-dashboard | UI Dashboard (KPIs) | FASE 0 – MVS | 0 | Frontend | pending | 0 | Tarjetas de KPIs, filtros y actividad reciente tal como se mostró en el demo. Entregable: pantalla Dashboard lista para demo clínica. | Texto/copy aprobado y métricas dummy. |
| fase0-ui-recepcion | UI Recepción | FASE 0 – MVS | 0 | Frontend | pending | 0 | Formularios de alta de paciente/empresa, selector de estudios y folio. Entregable: sección Recepción con validaciones básicas. | Campos definitivos y catálogo de estudios. |
| fase0-papeleta | Generación de Papeleta | FASE 0 – MVS | 0 | Backend · Frontend | pending | 0 | Plantilla PDF con folio/QR, restricciones y firmas; integración con panel. Entregable: primer PDF institucional descargable. | Plantilla validada por AMI y datos de ejemplo. |
| fase0-ingesta-demo | Demo de Ingesta y Watcher | FASE 0 – MVS | 0 | Backend | pending | 0 | Script/manual para subir 1 expediente (arrastrar y ver JSON) con logs básicos. Entregable: demo grabada y evidencia en context/. | PDFs de referencia y credenciales de prueba. |
| fase1-ingesta-automatica | Ingesta automática + Semáforos | FASE 1 – Piloto | 1 | Backend | pending | 0 | Automatizar la “bandeja de estudios” y mostrar semáforos al equipo clínico. Entregable: 10 expedientes en cola con estatus y alertas (Sem 5–6). | Acceso a carpeta compartida y responsables de observabilidad. |
| fase1-dashboard | Dashboard Operativo y Bitácora | FASE 1 – Piloto | 1 | Data | pending | 0 | Panel interno con métricas de TAT, rechazos y bitácora de acciones. Entregable: tablero Looker/Sheets compartido con AMI (Sem 7–8). | KPIs definidos y dataset de auditoría aprobado. |
| fase1-portal-clientes | Portal de Clientes (Descarga/Links) | FASE 1 – Piloto | 1 | Frontend | pending | 0 | UI para empresas (listado de expedientes, enlaces caducables, descarga PDF/zip). Entregable: portal accesible por empresa piloto. | Lista de usuarios/clientes y reglas de caducidad aprobadas. |
| fase1-citas | Agenda y Citas | FASE 1 – Piloto | 1 | Operaciones · Frontend | pending | 0 | Calendario para registrar citas por empresa/paciente, recordatorios y control de asistencia. Entregable: vista Agenda con confirmaciones automáticas. | Flujo de citas aprobado y responsables operativos. |
| fase1-ui-examen | UI Examen Médico | FASE 1 – Piloto | 1 | Frontend | pending | 0 | Captura de signos vitales, somatometría y observaciones (layouts responsivos) con datos reales. Entregable: pestaña Examen Médico conectada al backend. | Lista de campos y rangos confirmados por AMI. |
| fase1-ui-estudios | UI Estudios (SIM/NOVA) | FASE 1 – Piloto | 1 | Frontend | pending | 0 | Drag & drop de archivos, barra de progreso y tarjetas de resultados reales. Entregable: componente de carga + tabla de resultados ligada al pipeline. | Lista de estudios y archivos reales. |
| fase1-ui-validacion | UI Validación Médica | FASE 1 – Piloto | 1 | Frontend · Backend | pending | 0 | Vista lado-a-lado PDF/datos con edición y semáforos alimentados por IA. Entregable: flujo de validación listo para médicos en pruebas. | Reglas de semáforo y permisos de usuario médico. |
| fase1-ui-reportes | UI Reportes y Envío | FASE 1 – Piloto | 1 | Frontend · Backend | pending | 0 | Pantalla para generar/descargar reportes completos, enviar por correo y ver logs con datos reales. Entregable: pestaña Reportes conectada al generador PDF. | Plantillas de correo y textos de notificación. |
| fase1-alertas | Configuración de Alertas/Notificaciones | FASE 1 – Piloto | 1 | Backend · Frontend | pending | 0 | Motor para definir notificaciones (correo/SMS) a pacientes, médicos y clientes (ej. “estudio cargado”, “dictamen listo”). Entregable: panel de configuración + disparos básicos. | Texto institucional y canales de envío autorizados. |
| fase2-integraciones | Integraciones ECG/Campimetría/Toxicológico | FASE 2 – Consolidación | 2 | Data · Backend | pending | 0 | Incluir los estudios pendientes y validar con especialistas sus hallazgos. Entregable: extractores certificados por médico líder (Sem 12+). | Estudios de muestra y médicos líderes por especialidad. |
| fase2-roles | Gobierno de datos y roles multi-sede | FASE 2 – Consolidación | 2 | Arquitectura | pending | 0 | Ajustar accesos por sede/cliente y documentar planes de recuperación. Entregable: matriz de roles/aprobaciones y plan DR (Sem 14+). | Inventario de sedes/clientes y matriz de acceso aprobada. |
| fase2-identidad | Consolidador de identidad multifuente | FASE 2 – Consolidación | 2 | Backend | pending | 0 | Resolver duplicados entre SIM/estudios y garantizar folio único por Empresa–Paciente–Orden–Estudio. Entregable: módulo de reconciliación con reportes de coincidencia. | Datos de pacientes y reglas de negocio acordadas. |
| fase2-bitacora | Bitácora avanzada y auditoría | FASE 2 – Consolidación | 2 | Data · Backend | pending | 0 | Guardar cada acción (quién/qué/cuándo/IP) y exponer filtros/exportación para auditores. Entregable: vista Bitácora con export CSV/PDF. | Requisitos NOM/LFPDPPP aprobados. |
| fase2-capacitacion | Capacitación y manuales | FASE 2 – Consolidación | 2 | Operaciones | pending | 0 | Manuales de uso (médico, capturista, cliente) + sesiones de entrenamiento. Entregable: wiki/documentación y constancias de capacitación. | Agenda con el equipo médico/operativo. |
| fase3-sla | Operación comercial y SLA | FASE 3 – Producción | 3 | Operaciones | pending | 0 | Formalizar soporte 24/7 y runbooks para escalar comercialmente. Entregable: paquete SLA + runbook operativo. | Catálogo de incidentes y runbooks por severidad. |
| fase3-monitoreo | Monitoreo y soporte 24/7 | FASE 3 – Producción | 3 | DevOps · Operaciones | pending | 0 | Dashboards de salud (errores, costos, colas) + alertas hacia on-call. Entregable: tablero NOC + integración Slack/correo. | Límites de costos y métricas críticas acordadas. |
| fase3-finops | Control de costos (FinOps) | FASE 3 – Producción | 3 | Data · Finanzas | pending | 0 | Reporte mensual por expediente/cliente y alertas de consumo cloud. Entregable: panel FinOps compartido con AMI. | Catálogo de costos y responsables financieros. |
| fase3-roadmap | Roadmap evolutivo | FASE 3 – Producción | 3 | Producto | pending | 0 | Definir mejoras iterativas (mobile, insights IA) con prioridades y releases. Entregable: roadmap trimestral validado con AMI. | Sesión de planeación conjunta. |
<!-- progress-modules:end -->
