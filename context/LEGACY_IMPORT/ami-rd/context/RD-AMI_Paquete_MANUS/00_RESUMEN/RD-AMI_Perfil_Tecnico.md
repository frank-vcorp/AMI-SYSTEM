# RD-AMI — Perfil Técnico Operativo (Piloto 2025)

Este documento detalla, en clave operativa, cómo debe comportarse el **Residente Digital (RD) AMI** durante el piloto: entradas, estados, anclas→campos por sistema, reglas y entregables. Sirve como referencia directa para CODEX al construir el flujo end-to-end y derivar historias técnicas.

---

## 1. Objetivo

Consolidar estudios ocupacionales multifuente (SIM, LAB, RX, Audiometría, Espirometría, ECG/Campimetría) para emitir:

1. **Borrador de dictamen de aptitud** (la IA asiste, no dicta).  
2. **Reporte institucional** con folio y QR.  
3. **Expediente completo** con tracelog, caducidad de enlaces y bitácora total.

---

## 2. Entradas del Piloto

- **PDFs nativos** provenientes de buzón, carpeta o SFTP.  
- **Imágenes RX** (AP/LAT) cuando existan estudios radiológicos.  
- **Plantillas internas**: Formato de Riesgo Cardiovascular (Framingham) y Resumen/Dictamen médico.
- **Referencias de muestra** (dataset AMI):  
  - Audiometría (audición normal + recomendaciones).  
  - Espirometría (patrón restrictivo, FVC 70%).  
  - Laboratorio: BH con anemia microcítica; QS24 normal.  
  - Riesgo CV (variables y resultado).  
  - RX Lumbosacra AP/LAT (desviación 8°, hiperlordosis, sin fracturas).  
  - Resumen/Dictamen médico integrador.  
  - Examen clínico (signos vitales, somatometría, antecedentes).  
  - ECG reposo sin anormalidad.  
  - Toxicológico 5 elementos negativos.  
  - Campimetría/Agudeza visual apta.

---

## 3. Clasificación y Enrutamiento

- **Identidad mínima**: Empresa, Paciente, Folio/Fecha/Orden, Estudio/Modalidad.
- **Buckets**: `Empresa → Paciente → Orden → Estudio → Fecha`.
- **Detección de tipo por anclas**:
  - Audiometría: “ESTUDIO DE AUDIOMETRÍA”, “DIAGNÓSTICO AUDIOMÉTRICO”.
  - Espirometría: “IMPRESIÓN DIAGNÓSTICA”, “FVC”, “Calidad/Repetibilidad”.
  - RX: “INTERPRETACIÓN DE RAYOS X”, tipo de radiografía, impresión diagnóstica.
  - BH/QS24/EGO: tablas con intervalos y observaciones.
  - ECG: “Electrocardiograma… Ritmo Sinusal…”.
  - Campimetría/Agudeza: “REPORTE DE EXAMEN VISUAL”.
  - Riesgo CV: ficha Framingham con variables y porcentaje.
  - Resumen/Dictamen: “REPORTE DE EXAMEN MEDICO”, “DICTAMEN DE APTITUD”.

---

## 4. Extracción y Normalización (Anclas → Campos)

### 4.1 Audiometría
- **Anclas**: “OÍDO DERECHO/IZQUIERDO”, “DIAGNÓSTICO AUDIOMÉTRICO”, “RECOMENDACIONES”.
- **Campos**: umbrales 500–3000 Hz, pérdida por oído, clasificación de hipoacusia, hallazgos otoscopia, recomendaciones.
- **Normalización**: valores en dB HL, estado “Audición normal/Hipoacusia” como enum.

### 4.2 Espirometría
- **Anclas**: “FVC”, “FEV1”, “IMPRESIÓN DIAGNÓSTICA”, “Calidad/Repetibilidad”.
- **Campos**: FVC % predicho, FEV1, ratio FEV1/FVC, calidad (A–F), patrón (restrictivo/obstructivo/mixto), recomendaciones.
- **Normalización**: % del predicho (z-score opcional).

### 4.3 RX Columna AP/LAT
- **Anclas**: tipo de placa, “Impresión diagnóstica”.
- **Campos**: ángulo Cobb, ángulo Ferguson, listesis/fracturas, observaciones.
- **Normalización**: métricas numéricas + banderas patológicas.

### 4.4 Laboratorio (BH, EGO, QS24)
- **BH**: Hb, Hto, VCM, MCH, MCHC, RDW; diagnóstico sugerido (ej. “anemia microcítica hipocrómica”).
- **EGO**: color/aspecto, células, bacterias; banderas ITU/contaminación.
- **QS24**: lipidograma, glucosa, enzimas, electrolitos; índices aterogénicos.
- **Normalización**: paneles con rangos, flags bajo/alto/normal por sexo/edad.

### 4.5 ECG
- **Campos**: FC, PR, QRS, QTc, eje, segmentos ST/T, diagnóstico.
- **Normalización**: valores numéricos + enum hallazgo (normal/anormal).

### 4.6 Campimetría / Agudeza Visual
- **Campos**: AV lejos/cerca con/sin corrección, Ishihara, campos visuales, aptitud oftalmológica.
- **Normalización**: AV a fracción decimal; Ishihara (normal/alterado).

### 4.7 Riesgo Cardiovascular
- **Variables**: edad, sexo, PA sistólica, colesterol total/HDL, tabaquismo, DM, medicación HTA.
- **Resultado**: % a 10 años y categoría (bajo <10%, moderado 11–20%, alto >21%).
- **Normalización**: mantener fórmula/versiones del cálculo.

### 4.8 Resumen / Dictamen Médico
- **Anclas**: “DICTAMEN DE APTITUD”, “OBSERVACIONES/RECOMENDACIONES”.
- **Campos**: dictamen (Apto / Apto condicionado / Restricciones / No Apto) y recomendaciones (odontología, corrección visual, higiene postural, manejo de anemia, etc.).
- **Normalización**: enum + catálogo de recomendaciones (CIE-10/SNOMED opcional a futuro).

---

## 5. Reglas y Semáforos (Piloto)

- **BH/Hb**: Rojo <10 g/dL; Ámbar 10–11.9; Verde ≥12 (mujer). Caso referencia Hb 9.1 g/dL → Rojo, “anemia microcítica hipocrómica”.
- **Espirometría**: Ámbar si FVC 60–79 %; Rojo <60 %; Verde ≥80 %. Caso FVC 70 % → Ámbar + recomendación.
- **RX Lumbosacra**: Ámbar por desviación 8° + hiperlordosis; Rojo si fractura/listesis; Verde sin patología.
- **ECG**: Verde si “sin datos de anormalidad”; escalar si hallazgo.
- **Riesgo CV**: Verde <10 % (caso 0 %, edad CV 30).  
- **Toxicológico**: Verde si 5 elementos negativos.
- **Oftalmo**: Ámbar si requiere correctivos obligatorios; Verde si normal (campimetría normal).

---

## 6. Estados, Firmas y Versionado

`Ingesta → Clasificado → Extraído → Normalizado → Reglas/Semáforos → Borrador Dictamen → Validación Médica → Firmado → Emitido → Entregado`

- **Firmas**: capturar nombre y cédula del especialista responsable por estudio (p. ej., Erika Rodríguez – Radiología).
- **Versionado**: cada ajuste al dictamen crea versión con sello de tiempo y hash; reimpresiones auditadas.

---

## 7. Emisión y Entrega

- **Reporte institucional (PDF)**: portada (empresa/paciente/folio), matriz de semáforos, hallazgos por estudio, dictamen y recomendaciones, firmas, QR ligado a URL caducable.
- **Papeleta de Aptitud**: media carta/A6, semáforo global, folio + QR, vigencia, hasta 3 restricciones y firma/cédula (ver `05_RULES/PAPELETA_spec.md`).
- **Expediente completo**: ZIP/PDF con anexos normalizados, PDFs originales, logs de extracción y bitácora.
- **Entrega segura**: enlaces caducables por rol/cliente/sede, registro de accesos/descargas, 2FA opcional.

---

## 8. Métricas del Piloto

- % de autoclasiﬁcación correcta.  
- Precisión de extracción (por campo/estudio).  
- Tiempo de validación médica.  
- Tasa de rechazos por identidad/documento.  
- SLA de emisión (ingesta→papeleta/reporte).  
- % dictámenes aprobados sin corrección.

---

## 9. Identidad y Privacidad

- **Match**: Empresa + Paciente + Folio/Fecha; resolver duplicados por Orden/Tipo y timestamps (ej. 01/04/2025).  
- **Reglas**: catálogo único de empresas, ID paciente maestro (SIM); overrides con bitácora.  
- **Privacidad**: no entrenar servicios externos; cifrado en tránsito/reposo; RBAC por sede/cliente; mascarado en vistas.

---

## 10. Riesgos y Mitigaciones (Top 5)

1. **Variabilidad de plantillas** → Librería de anclas + pruebas unitarias por extractor.  
2. **Errores de identidad** → Reglas de reconciliación y pantalla de posibles matches.  
3. **Falsos positivos en reglas** → Umbrales conservadores + revisión médica obligatoria.  
4. **Desfase temporal de estudios** → Semáforo “pendiente de correlación” y reemisión.  
5. **Entrega indebida** → Enlaces caducables, 2FA y registro de descargas/accesos.

---

## 11. Backlog Técnico (Entregables Acciónables)

- **Esquema base (`rd_ami`)**: entidades empresa, paciente, orden, estudio, valores normalizados, semáforos, dictamen (estado/versión), firmas y bitácora.  
- **Clasificador de documentos**: heurísticas por anclas + fallback búsqueda texto completo.  
- **Extractores por estudio**: Audiometría, Espirometría, RX, BH/EGO/QS24, ECG, Campimetría/Agudeza, Riesgo CV, Resumen/Dictamen.  
- **Normalizador**: mapeo a enums/unidades (Hb g/dL, FVC %, AV decimal, ángulos RX, etc.).  
- **Motor de reglas**: tabla de umbrales editable (JSON/YAML) y semáforos por sistema + global.  
- **Generador de PDF institucional**: plantilla corporativa, QR/Folio, Papeleta y Reporte.  
- **Portal de validación médica**: vista consolidada, PDF vs datos lado-a-lado, edición puntual, aprobar/solicitar corrección.  
- **Entrega segura**: short-links con caducidad/rol, bitácora de actividad.  
- **Métricas/SLA**: tablero de KPIs del piloto.  
- **Bitácora total**: cambios de estado, extracciones, reglas aplicadas, usuario/fecha.

---

## 12. Próximos Pasos Sugeridos

1. Convertir esta ficha en user stories + criterios de aceptación.  
2. Definir árbol de carpetas/base de datos para el repo (extractores, pruebas, plantillas, seeds).  
3. Generar datasets de prueba (JSON) desde los PDFs AMI y automatizar validaciones.  
4. Conectar con roadmap Integra Evolucionada (MVS → Piloto) y checklist de calidad.

