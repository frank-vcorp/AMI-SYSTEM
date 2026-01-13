# ANÁLISIS: Cuándo se necesita cada Core Module

**Fecha:** 2026-01-13  
**Objetivo:** Aclarar por qué Core modules NO fueron parte de FASE 0 y CUÁNDO exactamente se necesitan en FASE 1

---

## TL;DR (Resumen Ejecutivo)

Los "Core modules" se dividen en dos categorías:

### 1. Core Fundamental (NECESARIO FASE 0)
- **Core-Database** ✅ Hecho en FASE 0.5
  - Razón: Todos los catálogos (MOD-CLINICAS, MOD-SERVICIOS, MOD-EMPRESAS) necesitan BD para almacenarse
  - Timing: Crítico desde inicio

### 2. Core de Servicios (NECESARIO CUANDO entra usuario final)
- **Core-Auth**: Necesario ANTES de MOD-EXPEDIENTES
- **Core-Storage**: Necesario ANTES de MOD-EXPEDIENTES (upload de PDFs)
- **Core-Signatures**: Necesario ANTES de MOD-VALIDACION (firma digital)
- **Core-PWA**: Nice-to-have (no bloquea)
- **Core-UI**: 50% done, completar antes de FASE 2

---

## Análisis Detallado por Core Module

### Core-Database (Prisma + PostgreSQL) ✅ HECHO
**¿Cuándo se necesita?** FASE 0 (desde inicio)  
**¿Por qué?** MOD-CLINICAS, MOD-SERVICIOS, MOD-EMPRESAS necesitan persistencia de datos  
**¿Se hizo?** SÍ - en FASE 0.5 (Railway PostgreSQL + 10 tablas sincronizadas)  
**Bloqueador para:** MOD-CITAS, MOD-EXPEDIENTES, TODO

---

### Core-Auth (Firebase + Roles + Permisos) ❌ PENDIENTE
**¿Cuándo se necesita?** ANTES de MOD-EXPEDIENTES  
**¿Por qué NO se hizo en FASE 0?**
- FASE 0 solo tenía UIs administrativas sin usuarios logeados
- MOD-CLINICAS, MOD-SERVICIOS, MOD-EMPRESAS = catálogos internos (sin flujo de usuario)
- No había "pacientes" aún, solo data de configuración

**¿Cuándo es CRÍTICO?**
- MOD-EXPEDIENTES necesita saber quién es el Médico, Recepcionista, Técnico
- Cada usuario tiene un rol diferente con acciones permitidas distintas:
  - Recepcionista: Check-in del paciente
  - Médico Examinador: Capturar resultados de examen
  - Técnico: Subir PDFs de estudios
  - Médico Validador: Validar con IA y firmar

**Bloqueador para:** MOD-EXPEDIENTES, MOD-VALIDACION, MOD-REPORTES

---

### Core-Storage (GCP Cloud Storage) ❌ PENDIENTE
**¿Cuándo se necesita?** ANTES de MOD-EXPEDIENTES (upload de imágenes/PDFs)  
**¿Por qué NO se hizo en FASE 0?**
- MOD-CLINICAS, MOD-SERVICIOS, MOD-EMPRESAS son solo metadatos (no archivos)
- No había flujo de "paciente sube documentos"

**¿Cuándo es CRÍTICO?**
- MOD-EXPEDIENTES → Técnico sube PDFs de estudios (rayos X, ECG, etc.)
- MOD-REPORTES → Genera PDF final y lo guarda en GCP
- El flujo sin Storage → No puedes guardar archivos, solo texto

**Bloqueador para:** MOD-EXPEDIENTES, MOD-REPORTES

---

### Core-Signatures (Generador de Firma Médica) ❌ PENDIENTE
**¿Cuándo se necesita?** ANTES de MOD-VALIDACION (firma del dictamen)  
**¿Por qué NO se hizo en FASE 0?**
- No hay validación ni dictamen en FASE 0

**¿Cuándo es CRÍTICO?**
- MOD-VALIDACION → Médico Validador revisa datos extraídos y **firma el dictamen**
- La firma = validación legal del documento (importante para clínicas)

**Bloqueador para:** MOD-VALIDACION

---

### Core-PWA (Progressive Web App) ❌ PENDIENTE
**¿Cuándo se necesita?** Fase 2 (operacional, no crítico)  
**¿Por qué NO se hizo en FASE 0?**
- Es "nice-to-have" (permite offline, instalación, etc.)
- No bloquea funcionalidad

**¿Cuándo sería útil?**
- Médico en clínica sin buena conectividad → puede trabajar offline
- Técnico puede instalar app en tablet

**Bloqueador para:** Nada crítico (FASE 2+)

---

### Core-UI (shadcn + tema AMI) 🔄 EN PROGRESO (50%)
**¿Cuándo se necesita?** Continuo (mejorar UI/UX)  
**¿Por qué está en 50%?**
- Ya existe setup básico (colores, fonts)
- Falta: componentes específicos para medios (date picker, time slot picker, etc.)

**¿Cuándo es CRÍTICO?**
- MOD-EXPEDIENTES necesita buen UI para formulario de examen médico
- MOD-VALIDACION necesita UI clara para ver datos extraídos vs originales

**Bloqueador para:** Nada crítico, mejora UX de otros módulos

---

## Matriz de Dependencias: Cuándo hacer cada Core Module

| Core Module | FASE 0 | Bloqueador | MOD-EXPEDIENTES | MOD-VALIDACION | MOD-REPORTES |
|-------------|--------|-----------|-----------------|----------------|--------------|
| **Database** | ✅ DONE | N/A | ✅ | ✅ | ✅ |
| **Auth** | ❌ | SÍ | ✅ REQUIERE | ✅ REQUIERE | ✅ REQUIERE |
| **Storage** | ❌ | SÍ | ✅ REQUIERE (PDFs) | ~ Opcional | ✅ REQUIERE (PDF final) |
| **Signatures** | ❌ | NO | ⊘ No necesita | ✅ REQUIERE | ⊘ No necesita |
| **PWA** | ❌ | NO | ⊘ No bloquea | ⊘ No bloquea | ⊘ No bloquea |
| **UI** | 🔄 50% | NO | ~ Mejora UX | ~ Mejora UX | ~ Mejora UX |

---

## Orden de Implementación en FASE 1

### Semana 7 (Inicio FASE 1):
1. **Implementar Core-Auth** (Firebase + roles)
   - Tiempo: 3-4 días
   - Razón: Bloquea todo lo demás (necesitas saber quién es cada usuario)

2. **Implementar Core-Storage** (GCP Cloud Storage)
   - Tiempo: 2-3 días
   - Razón: Necesario para MOD-EXPEDIENTES (upload de PDFs)

### Semana 7-8:
3. **Implementar MOD-EXPEDIENTES** (Recepción + Examen + Carga estudios)
   - Depende de: Core-Auth ✅ + Core-Storage ✅
   - Tiempo: 7-10 días

### Semana 9:
4. **Implementar Core-Signatures** (Generador de firma)
   - Tiempo: 2-3 días
   - Razón: Bloqueador para MOD-VALIDACION

### Semana 9-10:
5. **Implementar MOD-VALIDACION** (IA + Validación)
   - Depende de: MOD-EXPEDIENTES ✅ + Core-Signatures ✅
   - Tiempo: 7-10 días

### Semana 11:
6. **Implementar MOD-REPORTES** (PDF + Email)
   - Depende de: MOD-VALIDACION ✅ + Core-Storage ✅
   - Tiempo: 5-7 días

---

## Conclusión

**¿Por qué Core-Auth, Storage, Signatures no se hicieron en FASE 0?**

Porque FASE 0 = Catálogos administrativos sin usuarios logeados. Solo datos de configuración.

- Médicos no existían → No necesitabas Auth
- Pacientes no existían → No necesitabas Storage ni Signatures
- Solo admin alimentaba datos en MOD-CLINICAS, MOD-SERVICIOS, MOD-EMPRESAS

**¿Cuándo se hacen?**

En FASE 1, la semana ANTES de MOD-EXPEDIENTES:
1. Core-Auth (lunes-jueves)
2. Core-Storage (viernes-sábado)
3. MOD-EXPEDIENTES (lunes-siguiente)

**¿Cuándo se hacen Signatures y PWA?**

- Signatures: Semana 9 (bloqueador para MOD-VALIDACION)
- PWA: FASE 2 (nice-to-have, no crítico)

---

Este análisis está en `context/ANALISIS-CORE-MODULES-TIMING.md`
