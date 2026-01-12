RD-AMI — README Técnico (para Arquitectura)
===========================================

Objetivo general
----------------
Consolidar estudios clínicos (SIM, RX, Audiometría, Espirometría, ECG/Campimetría, Laboratorio, Toxicológico) para emitir Reporte de Aptitud y Expediente Institucional con folio/QR y trazabilidad.

Alcance del piloto
------------------
- Ingesta: buzón/carpeta/SFTP de PDFs nativos.
- Ordenación: Empresa → Paciente → Orden → Estudio → Fecha.
- Extracción y normalización de datos por sistema (anclas→campos).
- Semáforos automáticos por reglas clínicas.
- Validación médica obligatoria.
- Emisión de Reporte y Expediente (PDF institucional).
- Entrega controlada (enlaces caducables) y bitácora total.
- Métricas operativas (TAT, tasa de rechazo, reprocesos).

Flujo end-to-end
----------------
1) Ingesta → 2) Clasificación → 3) Extracción/Normalización →
4) Semáforos → 5) Validación médica → 6) Emisión PDF + Folio/QR →
7) Entrega segura → 8) Trazabilidad y métricas.

Módulos propuestos
------------------
- Ingesta/ETL: watcher + colas (S3/SFTP/local).
- OCR y parsing PDF: pdfminer/ocrmypdf + plantillas.
- Normalizador: mapeos por estudio (Lab, RX, Audiometría, etc.).
- Reglas/semáforos: motor de reglas declarativas (JSON Rules).
- Validador médico: panel web (roles por sede/cliente).
- Generador de PDFs: plantilla institucional + QR + folio.
- Entrega y caducidad: links firmados + verificación de acceso.
- Auditoría: bitácora con sellos de tiempo y versiones.
- Métricas: dashboard (tiempos, excepciones, calidad).

Requisitos no funcionales
-------------------------
- Seguridad: cifrado en reposo y tránsito; mínimos privilegios.
- Identidad: folio único por Empresa–Paciente–Orden–Estudio–Fecha.
- Disponibilidad: RTO 8 h crítico; RPO 24 h (piloto).
- Observabilidad: logs estructurados, tracing por ID de expediente.
- Cumplimiento: LFPDPPP, NOM-024-SSA3-2012.

Datos/Anclas clave por estudio (ejemplos)
-----------------------------------------
- Laboratorio: folio, fecha, BH, QS24, EGO; anemia microcítica/hipocrómica.
- RX Columna: ángulo Cobb 8°, hiperlordosis (Ferguson 40°), L5-S1.
- Espirometría: patrón restrictivo (FVC 70%), calidad A.
- Audiometría: umbrales bilaterales normales; seguimiento anual.
- ECG reposo: sin datos de anormalidad.
- Toxicológico 5 elementos: todos negativos.
- Campimetría: campos dentro de parámetros; Ishihara normal.
- Examen/Resumen médico: apto condicionado; recomendaciones específicas.

Identidad y versionado
----------------------
- Folio institucional + QR vinculado a expediente.
- Estados/firma médica; versionado de reportes.
- Registro de entregas y descargas (IP, timestamp, receptor).

Riesgos y mitigaciones (resumen)
--------------------------------
- Plantillas variables → motor de anclas flexible + tolerancia.
- Errores de extracción → validación médica previa obligatoria.
- Privacidad → acceso por rol/cliente/sede; logs y caducidad.
- Ambigüedad en identidad → llaves compuestas y validaciones cruzadas.
