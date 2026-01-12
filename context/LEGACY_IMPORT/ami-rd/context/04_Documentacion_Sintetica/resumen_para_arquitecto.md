# RD-AMI — Resumen para Arquitectura (v2025.11.05)

## 1. Objetivo
Centralizar ingesta de estudios clínicos en PDF, extraer/normalizar datos, aplicar semáforos, validar médicamente y emitir Expediente/Reporte institucional con folio y QR, con entrega controlada y trazabilidad.

## 2. Alcance del Piloto
- Ingesta por buzón/carpeta/SFTP; PDFs nativos.
- Clasificación: Empresa → Paciente → Orden → Estudio → Fecha.
- Extracción/normalización por sistema (Lab, RX, Audiometría, Espirometría, ECG/Campimetría, Toxicológico).
- Semáforos clínicos; validación médica obligatoria.
- Emisión de PDF + QR/folio; caducidad de enlaces; bitácora total.
- Métricas de operación y calidad.

## 3. Módulos y Responsabilidades
- **Ingesta/ETL**: watcher, colas, control de duplicados.
- **OCR/Parsing**: pdfminer/ocrmypdf; plantillas con anclas.
- **Normalizador**: mapeos por estudio; tolerancia a variaciones.
- **Reglas**: motor declarativo (JSON).
- **Validación médica**: panel con roles por sede/cliente.
- **Emisión**: templates; QR; firmas; versionado.
- **Entrega**: links firmados; caducidad; trazado de lectura.
- **Auditoría**: logs; eventos; sellos de tiempo.
- **Métricas**: tiempos, excepcionalidad, calidad.

## 4. Datos Clave (ejemplos del set AMI)
- **BH**: anemia microcítica/hipocrómica.
- **QS24**: dentro de parámetros.
- **EGO**: células uretrales moderadas.
- **RX Lumbosacra**: dextroconvexa 8°, hiperlordosis (Ferguson 40°), L5-S1.
- **Espirometría**: patrón restrictivo (FVC 70%, calidad A).
- **Audiometría**: umbrales normales; seguimiento anual.
- **ECG**: normal en reposo.
- **Toxicológico**: 5 negativos.
- **Campimetría**: normal.
- **Resumen Médico**: apto condicionado; observaciones y recomendaciones.

## 5. Identidad y Seguridad
- **Clave**: Empresa–Paciente–Orden–Estudio–Fecha (folio único).
- Cifrado en reposo y tránsito; control por roles (cliente/sede/validador).
- Trazabilidad completa; enlaces caducables.

## 6. Entregables y Tiempos sugeridos (piloto 6–8 semanas)
- Semana 1–2: Ingesta + Clasificación + Parsing base (Lab/RX).
- Semana 3–4: Normalizador + Reglas/semáforos + Panel validación.
- Semana 5: Emisión PDF (folio/QR) + Entrega segura + Auditoría.
- Semana 6–8: Afinamiento, pruebas con datos reales, métricas y cierre.

## 7. Riesgos y Mitigación
- Variabilidad de formatos → plantillas/anclas con tolerancia.
- Identidad ambigua → validaciones cruzadas y llaves compuestas.
- Calidad OCR → preferir PDF nativo; fallback OCR.
- Carga operativa → lotes + colas; reintentos; alertas.

## 8. Modelo Comercial operativo (resumen)
- Copropiedad 50/50; SME licencia exclusiva de explotación.
- Implementaciones y capacitación: servicio de VCORP (ingreso 100% VCORP).
- Comité de Gobernanza; Escrow; SLA (RTO 8h / RPO 24h).

## 9. Supuestos
- Acceso a buzón/SFTP de AMI.
- Lista de usuarios/roles por cliente/sede.
- Aprobación de plantilla de reporte institucional y QR.
