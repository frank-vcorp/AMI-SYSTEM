# 📋 CHECKLIST CONSOLIDADO - LEGACY AMI-RD

> **Propósito**: Garantizar que TODOS los assets del legacy se consideren para AMI-SYSTEM.
> **Fecha**: Enero 2025
> **Estado**: ✅ REVISIÓN COMPLETA

---

## 1. 🎨 DEMO FUNCIONAL (UI REFERENCE)

El demo funcional en `context/LEGACY_IMPORT/ami-rd/context/02_Contexto_Tecnico/Demos funcionales/RD/` contiene **4,146 líneas** de HTML/JS que el personal de AMI ya revisó y aprobó.

### 1.1 Tabs/Módulos a Replicar en Next.js

| Tab | Función | Componentes Clave | Prioridad |
|-----|---------|-------------------|-----------|
| **Dashboard** | Vista ejecutiva | 4 KPI cards, gráficos productividad, estado expedientes | ALTA |
| **Recepción** | Alta de pacientes | Formulario paciente, selección estudios (checkboxes), programación cita | ALTA |
| **Examen Médico** | Signos vitales | TA, FC, FR, Temp, Peso, Talla, IMC (auto-calc), agudeza visual, aptitud | ALTA |
| **Estudios** | Carga PDFs | Drag-drop SIM/NOVA, clasificación IA, barra progreso, preview archivos | ALTA |
| **Validación** | Revisión médico | PDF viewer lado-izq, datos extraídos lado-der, semáforos 🔴🟡🟢, botón firmar | CRÍTICA |
| **Reportes** | Papeleta/Reporte | Preview papeleta, preview expediente completo, descarga PDF, envío email | ALTA |
| **Papeletas** | Listado general | Tabla con filtros (empresa, estado, fecha), paginación, TAT por expediente | MEDIA |
| **Empresas** | Catálogo clientes | Cards empresa, modal perfil detallado, perfiles activos, estudios incluidos | MEDIA |
| **Expedientes** | Generador/Envío | Vista previa expediente, opciones entrega (email, descarga, link temporal) | ALTA |
| **Bitácora** | Audit log | Timeline eventos, filtros (tipo, usuario, folio, fecha), tipos evento coloreados | MEDIA |
| **Analytics** | KPIs ejecutivos | Ingresos, expedientes, eficiencia IA, TAT, productividad médico, cuellos botella | MEDIA |
| **Calidad** | Control calidad | Precisión IA por tipo estudio, alertas activas, auditorías, discrepancias | MEDIA |
| **Comunicaciones** | Notificaciones | Centro notificaciones, mensajería interna, usuarios conectados, config alertas | BAJA |
| **Admin** | Configuración | Gestión usuarios, configuración semáforos, plantillas empresa, respaldos | MEDIA |

### 1.2 Componentes UI Reutilizables

- **Semáforos**: 🔴 Crítico, 🟡 Seguimiento, 🟢 Normal (con tooltips)
- **Notificaciones toast**: Success, Error, Warning, Info (esquina superior derecha)
- **Tablas con filtros**: Búsqueda, selects múltiples, paginación
- **Cards métricas**: Gradiente color, icono, valor, delta vs anterior
- **Timeline eventos**: Avatar + descripción + timestamp + tipo badge
- **Modales**: Perfil empresa, confirmaciones
- **Drag-drop zones**: Para carga de PDFs
- **Toggle switches**: Para configuraciones on/off

### 1.3 Datos de Ejemplo (Sample Data)

El demo incluye datos realistas que sirven como referencia:

- **Paciente ejemplo**: CONTADOR FRANCO, YERALDIN GUADALUPE
- **Folio ejemplo**: #RD-2025-001
- **Empresa ejemplo**: ABBOTT MEDICAL MEXICO
- **Empresas catálogo**: SODEXO, ABBOTT, ALFA CONSTRUCCIONES, GAMMA INDUSTRIAL
- **Médicos ejemplo**: Dra. Erika Rodríguez, Dra. María Uribe, Dr. José Martínez
- **Técnico ejemplo**: Carlos Mendoza
- **Recepcionista ejemplo**: María González

---

## 2. 📜 ESPECIFICACIONES TÉCNICAS (RULES)

### 2.1 Semáforos Clínicos
**Archivo**: `context/LEGACY_IMPORT/ami-rd/context/RD-AMI_Paquete_MANUS/05_RULES/semaforos_config.yaml`

```yaml
# Umbrales críticos a implementar en TypeScript:
hemoglobina:
  rojo: < 10 g/dL
  amarillo: 10-12 g/dL
  verde: > 12 g/dL

FVC:
  rojo: < 60%
  amarillo: 60-80%
  verde: > 80%

cobb_angle:
  rojo: > 10°
  amarillo: 5-10°
  verde: < 5°

riesgo_cardiovascular:
  rojo: > 20%
  amarillo: 10-20%
  verde: < 10%
```

**Acción**: Crear `src/lib/clinical-rules/semaphores.ts`

### 2.2 Formato Papeleta
**Archivo**: `context/LEGACY_IMPORT/ami-rd/context/RD-AMI_Paquete_MANUS/05_RULES/PAPELETA_spec.md`

Campos obligatorios:
- Datos empresa (razón social, contacto)
- Datos paciente (nombre completo, fecha nacimiento, puesto)
- Folio único
- Dictamen (APTO | APTO CON RESTRICCIONES | NO APTO)
- Restricciones (lista)
- Recomendaciones (lista)
- Firma médico (nombre, cédula, fecha)
- QR código verificación

**Acción**: Crear componente `PapeletaPDF` con react-pdf

### 2.3 Reglas Identidad Paciente
**Archivo**: `context/LEGACY_IMPORT/ami-rd/context/RD-AMI_Paquete_MANUS/05_RULES/identidad_reglas.md`

Formato ID: `{RFC}{SEXO}-{ENTIDAD}-{TIPO}`
Ejemplo: `GARA850101M-AMI-CLI`

Reglas matching:
- Normalizar nombres (mayúsculas, sin acentos)
- CURP como identificador primario si disponible
- Matching difuso para nombres similares (Levenshtein)
- Validación RFC estructura

**Acción**: Crear `src/lib/identity/patient-matching.ts`

---

## 3. 📊 MAPEO DE CAMPOS (1000+ fields)

### 3.1 Archivos de Mapeo
Ubicación: `context/LEGACY_IMPORT/ami-rd/context/AMI a Residente Digital/`

| Archivo | Campos | Descripción |
|---------|--------|-------------|
| `campos_RX.md` | ~80 | Radiografías (tórax, columna, ángulos) |
| `campos_audiometria.md` | ~60 | Umbrales auditivos por frecuencia |
| `campos_espirometria.md` | ~40 | FVC, FEV1, patrones |
| `campos_lab.md` | ~200 | BH, QS, EGO, perfil hepático |
| `campos_ecg.md` | ~50 | Ritmo, ejes, intervalos |
| `campos_examen_medico.md` | ~150 | Exploración física completa |
| `campos_antecedentes.md` | ~100 | AHF, APP, APNP |
| `campos_toxicologico.md` | ~30 | Drogas de abuso |
| `campos_visual.md` | ~40 | Agudeza, campimetría, Ishihara |
| `campos_somatometria.md` | ~20 | Peso, talla, IMC, perímetros |

### 3.2 Excel Master
**Archivo**: `Mapa_Campos_Sistema_AMI_RD.xlsx`

Este Excel es la fuente de verdad para el esquema Prisma. Contiene:
- Nombre campo SIM/NOVA
- Nombre campo normalizado
- Tipo dato
- Unidades
- Valores referencia
- ¿Requerido?

**Acción**: Crear script `scripts/generate-prisma-schema.ts` que lea Excel y genere schema

---

## 4. 📖 DOCUMENTACIÓN SINTÉTICA

### 4.1 Documentos Principales
Ubicación: `context/LEGACY_IMPORT/ami-rd/context/04_Documentacion_Sintetica/`

| Documento | Contenido Clave |
|-----------|-----------------|
| `01_Vision_General.md` | Misión, objetivos, beneficios esperados |
| `02_Especificacion_Funcional.md` | 8 módulos con diagramas Mermaid, flujos usuario |
| `03_Diseno_Tecnico_Inicial.md` | Arquitectura microservicios (obsoleta pero referencia) |
| `04_Plan_Pruebas_Preliminar.md` | Casos de prueba por módulo |
| `05_Guia_Despliegue.md` | Terraform GCP (obsoleto, usamos Railway) |

### 4.2 Flujos de Usuario Documentados

1. **Flujo Recepción** → Alta paciente → Selección estudios → Genera papeleta
2. **Flujo Examen** → Signos vitales → Exploración → Antecedentes → Aptitud inicial
3. **Flujo Estudios** → Carga PDFs → IA extrae → Preview resultados
4. **Flujo Validación** → Médico revisa → Ajusta dictamen → Firma digital
5. **Flujo Entrega** → Genera reporte → Envía cliente → Audit log

---

## 5. 📦 PROYECTO.md LEGACY (Backlog Original)

### 5.1 Épicas Definidas

| ID | Épica | Descripción |
|----|-------|-------------|
| E0.1 | Infraestructura Core | Base datos, auth, API base |
| E0.2 | Ingesta de PDFs | Upload, clasificación, extracción |
| E1.1 | Recepción Digital | Alta pacientes, papeletas |
| E1.2 | Examen Médico Digital | Captura signos, exploración |
| E1.3 | Integración Laboratorio | Conexión NOVA, QS |
| E1.4 | Estudios Especiales | Espiro, audio, ECG |
| E1.5 | Validación Médica | Revisión, semáforos, firma |
| E1.6 | Reportes y Papeletas | Generación PDF, entrega |
| E1.7 | Dashboard Operativo | KPIs, productividad |

### 5.2 User Stories Clave

- **US0.1**: Como técnico, quiero cargar PDFs y que el sistema los clasifique automáticamente
- **US0.2**: Como médico validador, quiero ver datos extraídos lado a lado con el PDF original
- **US1.1**: Como recepcionista, quiero dar de alta pacientes rápidamente
- **US1.3**: Como médico, quiero que el sistema me sugiera dictamen basado en semáforos
- **US1.5**: Como coordinador, quiero ver qué expedientes están pendientes de validación
- **US1.7**: Como administrador, quiero configurar umbrales de semáforos por empresa

---

## 6. 🗂️ PDFs DE EJEMPLO

### 6.1 Expediente Muestra
Ubicación: `context/LEGACY_IMPORT/ami-rd/context/02_Contexto_Tecnico/Demos funcionales/RD/expedientes/RD-2025-001/`

| Archivo | Tipo | Uso |
|---------|------|-----|
| `LABORATORIO_BH.pdf` | Biometría Hemática | Testing extracción |
| `LABORATORIO_QS.pdf` | Química Sanguínea | Testing extracción |
| `ESPIROMETRIA.pdf` | Función pulmonar | Testing extracción |
| `AUDIOMETRIA.pdf` | Evaluación auditiva | Testing extracción |
| `RX_TORAX.pdf` | Radiografía tórax | Testing extracción |
| `RX_COLUMNA.pdf` | Radiografía columna | Testing extracción |
| `ECG.pdf` | Electrocardiograma | Testing extracción |
| `TOXICOLOGICO.pdf` | Panel drogas | Testing extracción |
| `CAMPIMETRIA.pdf` | Campo visual | Testing extracción |
| + 8 más... | Varios | Testing |

**Acción**: Usar estos PDFs para crear suite de tests de extracción IA

---

## 7. 🔧 LECTOR GEMINI (IA Demo)

Ubicación: `context/LEGACY_IMPORT/ami-rd/context/02_Contexto_Tecnico/Demos funcionales/RD/LECTOR/`

Contiene demo de integración con Gemini API para lectura de PDFs.
- Prompts de extracción estructurada
- Manejo de confianza (%)
- Fallback a revisión manual

**Acción**: Adaptar prompts para OpenAI API (ChatGPT Salud)

---

## 8. ✅ CHECKLIST DE MIGRACIÓN

### FASE 0 - Infraestructura (4-5 semanas)
- [ ] Prisma schema basado en Excel mapeo
- [ ] Auth Firebase con roles (recepcionista, técnico, médico, admin)
- [ ] Upload a GCP Storage
- [ ] API base Next.js /api routes

### FASE 1 - Flujo Core (6-8 semanas)
- [ ] Recepción: Alta paciente + papeleta
- [ ] Estudios: Upload + clasificación IA + extracción
- [ ] Validación: Vista dual PDF + datos + semáforos + firma
- [ ] Reportes: Papeleta PDF + expediente completo + envío

### FASE 2 - Operaciones (8-10 semanas)
- [ ] Dashboard ejecutivo
- [ ] Gestión empresas
- [ ] Bitácora audit
- [ ] Analytics básico
- [ ] Configuración semáforos admin

### FASE 3 - SaaS/Multitenancy (4-6 semanas)
- [ ] tenant_id en todas las queries
- [ ] Onboarding empresas
- [ ] Billing básico
- [ ] White-label opcional

---

## 9. 🚫 QUÉ NO MIGRAR

| Asset | Razón |
|-------|-------|
| Terraform GCP | Obsoleto - usamos Railway/Vercel |
| Docker compose | Obsoleto - serverless |
| Scripts bash deployment | Obsoleto - GitHub Actions |
| Prisma schema antiguo | Recrear desde Excel actualizado |

---

## 10. 📝 NOTAS IMPORTANTES

1. **Demo es REFERENCIA, no código**: El demo vanilla HTML/JS sirve para UI/UX, no para copiar código. Next.js + shadcn/ui es el stack de implementación.

2. **Semáforos son configurables**: Los umbrales 🔴🟡🟢 deben ser editables por empresa en Admin.

3. **IA es asistente, no decisor**: El médico SIEMPRE tiene última palabra sobre dictamen.

4. **TAT es KPI crítico**: Time-to-Aptitude debe mostrarse en todo momento.

5. **Audit log obligatorio**: Todo cambio debe quedar en bitácora por compliance.

6. **PDFs nunca se modifican**: Los originales se guardan inmutables, solo se extraen datos.

---

**Documento creado por**: INTEGRA-Arquitecto
**Última actualización**: Enero 2025
**Estado**: ✅ Revisión completa - Listo para handoff a SOFIA
