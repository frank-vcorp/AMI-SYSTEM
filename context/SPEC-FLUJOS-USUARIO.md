# SPEC-FLUJOS-USUARIO: Flujos de Usuario AMI-SYSTEM

**ID:** SPEC-FLUJOS-USUARIO  
**Versión:** 1.0  
**Fecha:** 2026-01-12  
**Autor:** INTEGRA (Arquitecto IA)  
**Estado:** Aprobado

---

## Objetivo

Documentar los flujos de usuario principales de AMI-SYSTEM, desde la solicitud inicial hasta la entrega del expediente.

---

## Flujo Completo: Paciente Nuevo

### Diagrama General

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO COMPLETO AMI-SYSTEM                           │
└────────────────────────────────────────────────────────────────────────────┘

ANTES DE LA CITA
════════════════
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │  Empresa    │────▶│ Coordinador │────▶│   Sistema   │
    │  solicita   │     │ crea citas  │     │   envía     │
    │  exámenes   │     │             │     │confirmación │
    └─────────────┘     └─────────────┘     └──────┬──────┘
                                                   │
                                                   ▼
                                            ┌─────────────┐
                                            │ Recordatorio│
                                            │  24h/2h     │
                                            └──────┬──────┘
                                                   │
DÍA DE LA CITA                                     │
══════════════                                     ▼
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │  Paciente   │────▶│  Check-in   │────▶│  Examen     │
    │   llega     │     │ Recepción   │     │   Médico    │
    │             │     │ (Folio)     │     │             │
    └─────────────┘     └─────────────┘     └──────┬──────┘
                                                   │
                                                   ▼
                        ┌─────────────┐     ┌─────────────┐
                        │  IA extrae  │◀────│  Técnico    │
                        │   datos     │     │ sube PDFs   │
                        └──────┬──────┘     └─────────────┘
                               │
                               ▼
                        ┌─────────────┐     ┌─────────────┐
                        │  Validación │────▶│  Genera     │
                        │   Médica    │     │  Reporte    │
                        │  (Firma)    │     │             │
                        └─────────────┘     └──────┬──────┘
                                                   │
                                                   ▼
                                            ┌─────────────┐
                                            │  Entrega    │
                                            │  a Cliente  │
                                            └─────────────┘
```

---

## Flujos Detallados por Etapa

### 1. SOLICITUD Y AGENDAMIENTO

**Actores:** Empresa (RH) → Coordinador AMI

**Precondiciones:**
- Empresa registrada en el sistema
- Baterías contratadas configuradas
- Perfiles de puesto definidos

```
FLUJO:
──────
1. RH de empresa envía lista de trabajadores
   (email, llamada o Portal Empresa futuro)

2. Coordinador entra a MOD-CITAS
   │
   ├─▶ Selecciona empresa: "ABBOTT MEDICAL"
   │
   ├─▶ Por cada trabajador:
   │   │
   │   ├─▶ Busca si ya existe → Si no, crea paciente
   │   │   • Nombre: María López García
   │   │   • CURP: LOGM900315MQTPRC09
   │   │   • Fecha nacimiento
   │   │   • Teléfono, email
   │   │
   │   ├─▶ Selecciona puesto: "Operador Producción"
   │   │   → Sistema carga batería por defecto: "Farmacéutico"
   │   │   → Muestra estudios incluidos
   │   │
   │   ├─▶ Selecciona tipo: INGRESO / PERIÓDICO / EGRESO
   │   │
   │   ├─▶ Sistema busca disponibilidad:
   │   │   → Revisa clínicas con servicios requeridos
   │   │   → Revisa capacidad disponible
   │   │   → Sugiere: "AMI Centro, Mar 14 Ene, 9:00"
   │   │
   │   └─▶ Coordinador confirma → CITA CREADA
   │
   └─▶ Sistema envía confirmaciones por email

3. Sistema automático:
   ├─▶ 24h antes: Envía recordatorio
   └─▶ 2h antes: Envía recordatorio
```

**Resultado:** Cita agendada, paciente notificado

---

### 2. CHECK-IN (Llegada del Paciente)

**Actores:** Paciente → Recepcionista

**Precondiciones:**
- Cita existente para el día
- Paciente llega a la clínica

```
FLUJO:
──────
1. Paciente llega a recepción

2. Recepcionista abre MOD-CITAS → "Citas de Hoy"
   │
   ├─▶ Busca paciente por nombre o cita
   │   Muestra:
   │   ┌────────────────────────────────────────┐
   │   │ María López García                      │
   │   │ 9:00 AM | ABBOTT | Ingreso              │
   │   │ Batería: Farmacéutico (6 estudios)      │
   │   │ Estado: CONFIRMADA                      │
   │   └────────────────────────────────────────┘
   │
   ├─▶ Verifica identidad (INE, CURP)
   │
   └─▶ Clic "Registrar Llegada"
       │
       └─▶ Sistema:
           ├─▶ Marca cita como IN_PROGRESS
           ├─▶ Crea EXPEDIENTE con folio único: "RD-2026-042"
           ├─▶ Crea registros de Study por cada servicio
           └─▶ Genera e imprime papeleta física

3. Paciente recibe papeleta y pasa al consultorio
```

**Resultado:** Expediente creado con folio, papeleta impresa

---

### 3. EXAMEN MÉDICO

**Actores:** Médico Examinador → Paciente

**Precondiciones:**
- Expediente creado (status: RECEPCION)
- Paciente en consultorio

```
FLUJO:
──────
1. Médico abre MOD-EXPEDIENTES → busca folio "RD-2026-042"

2. Pantalla de Examen Médico:
   │
   ├─▶ SIGNOS VITALES
   │   ┌─────────────────────────────────┐
   │   │ TA:    [120] / [80]  mmHg       │
   │   │ FC:    [72]  lpm                │
   │   │ FR:    [16]  rpm                │
   │   │ Temp:  [36.5] °C                │
   │   │ Peso:  [65]  kg                 │
   │   │ Talla: [1.62] m                 │
   │   │ IMC:   [24.8] ← (automático)    │
   │   └─────────────────────────────────┘
   │
   ├─▶ AGUDEZA VISUAL
   │   ┌─────────────────────────────────┐
   │   │ OD sin lentes: [20/20]          │
   │   │ OI sin lentes: [20/25]          │
   │   │ ¿Usa lentes?: [No]              │
   │   └─────────────────────────────────┘
   │
   ├─▶ EXPLORACIÓN FÍSICA
   │   (campos según protocolo)
   │
   ├─▶ ANTECEDENTES
   │   (AHF, APP, APNP)
   │
   ├─▶ APTITUD INICIAL (opcional)
   │   [Dropdown: Apto / Apto con restricciones / No apto / Pendiente]
   │
   └─▶ Clic "Guardar y Continuar"
       │
       └─▶ Sistema:
           ├─▶ Guarda ExamResult
           ├─▶ Actualiza status: EXAMEN_MEDICO → ESTUDIOS
           └─▶ Registra en AuditLog

3. Paciente pasa a laboratorio/gabinete
```

**Resultado:** Examen médico capturado, expediente en etapa ESTUDIOS

---

### 4. CARGA DE ESTUDIOS

**Actores:** Técnico(s) → Sistema IA

**Precondiciones:**
- Expediente en status: ESTUDIOS
- PDFs generados por equipos (NOVA, SIM, etc.)

```
FLUJO:
──────
1. Técnico de laboratorio/gabinete realiza estudios
   │
   ├─▶ NOVA genera: Laboratorio_BH.pdf, Laboratorio_QS.pdf
   ├─▶ SIM genera: Espirometria.pdf, Audiometria.pdf
   └─▶ Técnico genera: RX_Columna.pdf, ECG.pdf

2. Técnico abre MOD-EXPEDIENTES → folio "RD-2026-042"
   │
   └─▶ Sección "Carga de Estudios"
       │
       ├─▶ Zona drag & drop:
       │   ┌─────────────────────────────────────┐
       │   │  🗂️ Arrastra los PDFs aquí          │
       │   │     o clic para seleccionar         │
       │   └─────────────────────────────────────┘
       │
       ├─▶ Técnico arrastra/selecciona PDFs
       │
       └─▶ Sistema por cada PDF:
           │
           ├─▶ Sube a GCP Storage (original inmutable)
           │
           ├─▶ Clasifica automáticamente:
           │   "Biometría Hemática - 96% confianza"
           │
           ├─▶ Muestra en lista:
           │   ┌─────────────────────────────────────┐
           │   │ ✓ Laboratorio_BH.pdf                │
           │   │   Tipo: Biometría Hemática          │
           │   │   Confianza: 96%                    │
           │   │   [Cambiar tipo ▼] [Eliminar]       │
           │   └─────────────────────────────────────┘
           │
           └─▶ Actualiza Study.status = PENDING

3. Cuando todos los estudios están cargados:
   │
   └─▶ Clic "Procesar con IA"
       │
       └─▶ Sistema (async):
           ├─▶ Por cada Study:
           │   ├─▶ Envía PDF a OpenAI API
           │   ├─▶ Extrae datos estructurados
           │   ├─▶ Calcula semáforos según umbrales
           │   ├─▶ Guarda ExtractedData
           │   └─▶ Study.status = PROCESSED
           │
           ├─▶ Actualiza Expediente.status = VALIDACION
           │
           └─▶ Notifica a médicos validadores
```

**Resultado:** Estudios cargados, datos extraídos por IA, expediente en VALIDACION

---

### 5. VALIDACIÓN MÉDICA

**Actores:** Médico Validador

**Precondiciones:**
- Expediente en status: VALIDACION
- Datos extraídos por IA disponibles

```
FLUJO:
──────
1. Médico validador ve notificación o lista de pendientes

2. Abre MOD-VALIDACION → folio "RD-2026-042"
   │
   └─▶ Pantalla dual:
       │
       ├─▶ LADO IZQUIERDO: Visor PDF
       │   ┌─────────────────────────────────────┐
       │   │ [Lab] [Espiro] [Audio] [RX] [ECG]   │  ← Tabs
       │   │                                     │
       │   │     ┌───────────────────┐           │
       │   │     │                   │           │
       │   │     │   PDF Original    │           │
       │   │     │                   │           │
       │   │     │                   │           │
       │   │     └───────────────────┘           │
       │   │                                     │
       │   │  [Zoom +] [Zoom -] [Rotar]          │
       │   └─────────────────────────────────────┘
       │
       └─▶ LADO DERECHO: Datos Extraídos
           ┌─────────────────────────────────────┐
           │ LABORATORIO - Biometría Hemática    │
           │                                     │
           │ Hemoglobina:  [13.5] g/dL    🟢     │
           │ Hematocrito:  [42]   %       🟢     │
           │ Leucocitos:   [7200] /µL     🟢     │
           │ Plaquetas:    [250k]         🟢     │
           │                                     │
           │ ─────────────────────────────────── │
           │ ESPIROMETRÍA                        │
           │                                     │
           │ FVC:          [75]   %       🟡     │
           │ FEV1:         [78]   %       🟢     │
           │ Patrón:       [Restrictivo leve]    │
           │                                     │
           │ 💡 Sugerencia IA: Ejercicios resp.  │
           │ ─────────────────────────────────── │
           │ RESUMEN: 0🔴 1🟡 8🟢                 │
           └─────────────────────────────────────┘

3. Médico revisa cada estudio:
   │
   ├─▶ Si hay error en extracción:
   │   → Clic en valor → Edita → Sistema marca isOverridden
   │
   ├─▶ Revisa PDF original vs datos extraídos
   │
   └─▶ Confirma o ajusta valores

4. Sección de Dictamen:
   │
   ├─▶ Sistema sugiere basado en semáforos:
   │   "APTO CON RESTRICCIONES (Confianza: 92%)"
   │
   ├─▶ Médico selecciona dictamen final:
   │   [Dropdown: Apto / Apto con Restricciones / No Apto]
   │
   ├─▶ Captura restricciones (si aplica):
   │   ┌─────────────────────────────────────┐
   │   │ [+] Evitar cargas >10kg             │
   │   │ [+] Uso obligatorio de lentes       │
   │   └─────────────────────────────────────┘
   │
   ├─▶ Captura recomendaciones:
   │   ┌─────────────────────────────────────┐
   │   │ [+] Ejercicios respiratorios        │
   │   │ [+] Control en 3 meses              │
   │   └─────────────────────────────────────┘
   │
   └─▶ Clic "Validar y Firmar"
       │
       └─▶ Sistema:
           ├─▶ Crea Dictamen con firma del médico
           ├─▶ Actualiza status: VALIDACION → COMPLETADO
           ├─▶ Calcula TAT final
           ├─▶ Registra en AuditLog
           └─▶ Notifica para generación de reporte
```

**Resultado:** Dictamen firmado, expediente COMPLETADO

---

### 6. GENERACIÓN Y ENTREGA

**Actores:** Sistema (auto) / Coordinador

**Precondiciones:**
- Expediente en status: COMPLETADO
- Dictamen firmado

```
FLUJO:
──────
1. Sistema genera automáticamente:
   │
   ├─▶ PAPELETA DE APTITUD (documento corto)
   │   ┌─────────────────────────────────────┐
   │   │ PAPELETA DE APTITUD                 │
   │   │ Folio: RD-2026-042                  │
   │   │ Paciente: LÓPEZ GARCÍA, MARÍA       │
   │   │ Empresa: ABBOTT MEDICAL             │
   │   │ Fecha: 14/01/2026                   │
   │   │                                     │
   │   │ ┌─────────────────────────────────┐ │
   │   │ │  APTO CON RESTRICCIONES        │ │
   │   │ └─────────────────────────────────┘ │
   │   │                                     │
   │   │ Restricciones:                      │
   │   │ • Evitar cargas >10kg               │
   │   │ • Uso obligatorio de lentes         │
   │   │                                     │
   │   │ Dr. María Rodríguez | Céd. 1234567  │
   │   │ [QR verificación]                   │
   │   └─────────────────────────────────────┘
   │
   └─▶ EXPEDIENTE COMPLETO (documento detallado)
       (Incluye todos los estudios y resultados)

2. Coordinador abre MOD-REPORTES → folio "RD-2026-042"
   │
   ├─▶ Vista previa de documentos
   │
   ├─▶ Opciones de entrega:
   │   │
   │   ├─▶ EMAIL:
   │   │   • Destinatarios: rh@abbott.com.mx
   │   │   • Mensaje personalizado
   │   │   • Caducidad: 7 días
   │   │   → Clic "Enviar"
   │   │   → Sistema envía email con enlace seguro
   │   │
   │   ├─▶ DESCARGA:
   │   │   → Clic "Descargar PDF"
   │   │   → Coordinador entrega físicamente
   │   │
   │   └─▶ ENLACE:
   │       → Genera URL temporal
   │       → Copia y comparte manualmente
   │
   └─▶ Sistema registra en AuditLog cada descarga/envío

3. Cliente recibe y descarga
   │
   └─▶ Sistema registra visualización
```

**Resultado:** Expediente entregado al cliente, proceso finalizado

---

## Flujos Alternativos

### A. Paciente sin Cita (Walk-in)

```
1. Paciente llega sin cita previa
2. Recepcionista verifica disponibilidad del día
3. Si hay espacio → Crea cita inmediata + Check-in
4. Si no hay → Ofrece próximo horario disponible
```

### B. No-Show (Paciente no llega)

```
1. Cita pasa la hora + 30 min buffer
2. Sistema marca automáticamente como NO_SHOW
3. Opción: Reagendar automáticamente
4. Notificación a coordinador
```

### C. Estudio con Error de IA

```
1. IA extrae con baja confianza (<70%)
2. Sistema marca Study.status = NEEDS_REVIEW
3. Médico revisa manualmente el PDF
4. Captura valores correctos
5. Sistema aprende (feedback para mejorar)
```

### D. Valor Crítico Detectado

```
1. IA detecta valor crítico (ej: Hemoglobina < 7 g/dL)
2. Sistema genera ALERTA inmediata
3. Notifica a:
   - Médico validador asignado
   - Coordinador de calidad
4. Expediente marcado como URGENTE
5. Se prioriza en cola de validación
```

---

## Métricas de Flujo (KPIs)

| Métrica | Objetivo | Cálculo |
|---------|----------|---------|
| **TAT (Time-to-Aptitude)** | <6 horas | completedAt - createdAt |
| **Tiempo en Recepción** | <10 min | examStartedAt - arrivedAt |
| **Tiempo en Examen** | <20 min | examCompletedAt - examStartedAt |
| **Tiempo en Estudios** | <60 min | studiesCompletedAt - examCompletedAt |
| **Tiempo en Validación** | <30 min | validatedAt - studiesCompletedAt |
| **Precisión IA** | >90% | campos_correctos / total_campos |
| **No-show rate** | <5% | no_shows / total_citas |

---

## Referencias

- [SPEC-MODULOS-AMI](SPEC-MODULOS-AMI.md) - Módulos del sistema
- [ADR-ARCH-20260112-03](decisions/ADR-ARCH-20260112-03.md) - Modelo de datos
- Demo visual: `context/LEGACY_IMPORT/ami-rd/.../Demos funcionales/RD/`

---

**🏗️ ARCH REFERENCE:** ARCH-20260112-05  
**🤖 AUTHOR:** INTEGRA (Arquitecto IA)
