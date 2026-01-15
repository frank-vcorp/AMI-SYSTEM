# 📊 Cronograma Dinámico FASE 1 - Alineado con Cliente
**Fecha:** 13 Enero 2026  
**Metodología:** INTEGRA v2.0 + Cronograma Ágil/Dinámico  
**Cronograma Cliente:** Sem 5-12 (8 semanas presupuestadas)  
**Objetivo:** MVS (1 expediente) → 10 expedientes validados  
**Estimado Real:** 3-5 semanas de ejecución + buffer

---

## ¿Cómo funciona el cronograma dinámico?

En lugar de tener fechas fijas (Sem 7, Sem 8, etc.), el cronograma se **adapta según el avance real**:

### Principios:
1. **Las dependencias son críticas, las fechas son elásticas**
   - Core-Auth DEBE terminar antes de MOD-EXPEDIENTES
   - Pero si Core-Auth toma 3 días en lugar de 5, MOD-EXPEDIENTES empieza 2 días antes

2. **Entregables incrementales (no "todo o nada")**
   - No esperamos 10 expedientes validados al final
   - Entregamos 2 → 5 → 10 según avanzamos

3. **Puntos de control (Gates) en lugar de fechas**
   - Gate A: Core-Auth + Storage OK → autorizar MOD-EXPEDIENTES
   - Gate B: 2 expedientes procesados → validar calidad
   - Gate C: 5 expedientes validados → revisar velocidad
   - Gate D: 10 expedientes listos → cierre FASE 1

4. **Amortiguación de riesgos**
   - Si algo toma más tiempo, posteriores se ajustan automáticamente
   - Si algo es más rápido, podemos paralelizar o añadir más batches

---

## Timeline Estimado (pero flexible)

```
Inicio FASE 1: Semana 5 (Lunes)

SEMANA 5-6 (6-10 días):
├── Core-Auth implementación
├── Core-Storage implementación
└── GATE A PASS → MVS autorizado

SEMANA 6-7 (5-7 días):
├── MOD-EXPEDIENTES v1 MINIMAL (solo 1 expediente)
├── Setup flujo: Recepción → Examen → Carga
├── Procesar 1 expediente piloto
├── **SESIÓN REVISIÓN 1 (AMI):** Demo MVS con médico líder
└── GATE B PASS → **MVS COMPLETADO** (1 expediente procesado)

SEMANA 7-8 (5-7 días):
├── MOD-EXPEDIENTES escalado (2-5 expedientes)
└── GATE C PASS → 2-5 expedientes procesados

SEMANA 8-9 (3-4 días):
├── Core-Signatures implementación (paralelo si es posible)
├── Validación manual de expedientes
└── GATE D PASS → Primeros expedientes validados

SEMANA 9-11 (10-14 días):
├── MOD-VALIDACION desarrollo
├── MOD-REPORTES desarrollo
├── Procesar batch de 5-10 expedientes
└── GATE E PASS → 5-10 expedientes con reportes generados

SEMANA 11-12 (5-7 días):
├── Testing, refinamientos, documentación
├── **SESIÓN REVISIÓN 2 (AMI):** UAT Final con usuarios reales
├── Training para staff AMI
└── CIERRE FASE 1: 10 expedientes validados + documentación

PRESUPUESTO TOTAL: Sem 5-12 (8 semanas)
ESTIMADO REAL: 34-49 días (5-7 semanas reales si no hay blockers)
BUFFER: 1-3 semanas para remediación/validación adicional
```

---

## Tabla de Entregables Dinámicos

| Fase | Entregable | Criterio de Aceptación | Duración Est. | Semana |
|------|-----------|--------|--------|----------|
| **A** | Core-Auth + Storage | Firebase login + GCP bucket funcional | 6-10 días | Sem 5-6 |
| **B** | MVS FASE 1 | 1 expediente flujo completo (Recepción → Examen → Carga) | 5-7 días | Sem 6-7 |
| **C** | MOD-EXPEDIENTES escalado | 2-5 expedientes procesados sin errores críticos | 5-7 días | Sem 7-8 |
| **D** | MOD-VALIDACION setup | 2-5 expedientes validados + firmados digitalmente | 3-4 días | Sem 8-9 |
| **E** | MOD-VALIDACION scaled | 5-10 expedientes en lote con reportes | 10-14 días | Sem 9-11 |
| **F** | FASE 1 Cierre | 10 expedientes validados + documentación + training | 5-7 días | Sem 11-12 |

---

## Cómo se adapta en tiempo real

### Escenario A: Adelanto
```
Core-Auth termina en 3 días (fue estimado 5)
→ MOD-EXPEDIENTES empieza en Sem 7.5
→ GATE B se alcanza 2 días antes
→ Core-Signatures puede empezar en paralelo en Sem 8
→ TODO el cronograma se comprime 2-3 días
```

### Escenario B: Retraso
```
MOD-EXPEDIENTES toma 9 días (fue estimado 7)
→ GATE B se alcanza 2 días después
→ MOD-VALIDACION empieza 2 días después
→ El resto se corre, pero los otros entregables se adaptan
→ Total FASE 1: 36-38 días en lugar de 24-36 días
```

### Escenario C: Calidad insuficiente
```
Las 2 primeras expedientes tienen errores críticos en GATE C
→ No avanzamos a 5
→ Hacemos remediación (2-3 días)
→ Luego revalidamos
→ El cronograma se ajusta por remediación, pero NO por culpa
```

---

## Gates Dinámicos (Puntos de Control)

### GATE A: Core Infrastructure ✅
**Criterios:**
- [ ] Firebase Auth: login + logout + roles funcional
- [ ] GCP Cloud Storage: upload + download + URLs firmadas
- [ ] Middleware: protect routes según rol
- [ ] Tests: 80%+ coverage en ambos

**Responsable:** SOFIA  
**Aprobador:** GEMINI-QA  
**Si PASA:** MOD-EXPEDIENTES autorizado inmediatamente  
**Si FALLA:** Fix + re-test (máx 3 días de remediación)

---

### GATE B: MVS FASE 1 - Primer Expediente ✅
**Criterios:**
- [ ] 1 expediente completado end-to-end
- [ ] Flujo: Recepción → Examen → Carga estudios → Almacenado en GCP
- [ ] UI responsive en desktop + tablet
- [ ] No hay errores críticos en logs
- [ ] Documentación: Flujo de usuario explicado

**Responsable:** SOFIA  
**Aprobador:** INTEGRA  
**Entregable:** **MVS FASE 1 - PRIMER MILESTONE**  
**Si PASA:** Proceder a escalar a 2-5 expedientes  
**Si FALLA:** Fix bugs (máx 2 días), retest con nuevo expediente

---

### GATE C: MOD-EXPEDIENTES Escalado ✅
**Criterios:**
- [ ] 2-5 expedientes procesados sin errores críticos
- [ ] Flujo estable: Recepción → Examen → Carga → GCP
- [ ] Core-Signatures listo para siguiente step
- [ ] Performance: <10 seg por expediente

**Responsable:** SOFIA  
**Aprobador:** GEMINI-QA  
**Si PASA:** Proceder a validación + reportes  
**Si FALLA:** Fix + optimization (máx 3 días)

---

### GATE D: MOD-VALIDACION Setup ✅
**Criterios:**
- [ ] Core-Signatures implementado y probado
- [ ] 2-5 expedientes validados + firmados digitalmente
- [ ] Reportes en PDF generados (sin IA aún, solo template)
- [ ] Firma médica visible + verificable en PDF

**Responsable:** SOFIA  
**Aprobador:** GEMINI-QA  
**Si PASA:** Proceder a batch de 5-10 expedientes  
**Si FALLA:** Fix + remediación (máx 3 días)

---

### GATE E: MOD-VALIDACION Scaled ✅
**Criterios:**
- [ ] 5-10 expedientes procesados en lote (sin errores)
- [ ] IA extrae datos (semáforos, resultados, etc.)
- [ ] Médico validador revisa y aprueba
- [ ] 5-10 reportes PDF generados + emails enviados
- [ ] Performance: <10 seg por expediente

**Responsable:** SOFIA  
**Aprobador:** INTEGRA + GEMINI-QA  
**Si PASA:** Final push a 10 expedientes  
**Si FALLA:** Debugging + optimization (máx 5 días)

---

## Cálculo de Duración Real

**Fórmula:**
```
DURACIÓN FASE 1 = 
  Core-Auth (3-5) + 
  MOD-EXPEDIENTES (5-7) + 
  Core-Signatures (3-4) + 
  MOD-VALIDACION (7-10) + 
  MOD-REPORTES (5-7) + 
  Testing + Buffer (3-5)
= 26-38 días (4-6 semanas)
```

**Pero:** Si hay paralelización (Core-Signatures en paralelo con MOD-EXPEDIENTES):
```
= Core-Auth (3-5) + 
  MAX(MOD-EXPEDIENTES + Core-Signatures, MOD-VALIDACION) (10-14) + 
  MOD-REPORTES (5-7) + 
  Testing (3-5)
= 21-31 días (3-5 semanas)
```

---

## Ajustes Propuestos vs. Cronograma Original

| Item | Cronograma Fijo | Cronograma Dinámico | Mejora |
|------|----------------|-------------------|--------|
| **Duración** | Sem 7-13 (7 semanas fijas) | 3-5 semanas reales + buffer | -2-4 semanas de compresión |
| **Entregable** | 10 expedientes al final | 2 → 5 → 10 (incremental) | Validación temprana |
| **Riesgo** | Si algo retrasado, TODO se corre | Se absorbe localmente | Mejor predictibilidad |
| **Flexibilidad** | Ninguna (fechas fijas) | Alta (adapta según avance) | Control dinámico |

---

## Recomendaciones de Ejecución

### Semana 1 (Core Infrastructure)
- [ ] Core-Auth: Firebase config + roles + middleware
- [ ] Core-Storage: GCP bucket + upload handler
- **Salida esperada:** GATE A PASS en 3-5 días

### Semana 2 (MOD-EXPEDIENTES Piloto)
- [ ] Desarrollo MOD-EXPEDIENTES
- [ ] Setup flujo: Recepción → Examen → Carga
- [ ] Procesar 2 expedientes piloto
- **Salida esperada:** GATE B PASS + 2 expedientes

### Semana 3 (MOD-VALIDACION Setup)
- [ ] Core-Signatures (paralelo si es posible)
- [ ] MOD-VALIDACION setup
- [ ] Validar + firmar 2 expedientes
- **Salida esperada:** GATE C PASS + 2 firmados

### Semana 4-5 (Escala)
- [ ] MOD-REPORTES
- [ ] Procesar batch de 5
- [ ] Procesamos 10 expedientes totales
- **Salida esperada:** GATE E PASS + 10 expedientes

---

## Monitoreo Semanal

Cada lunes:
1. **¿Qué entregamos esta semana?** (expedientes, código, tests)
2. **¿Qué blockers hay?** (dependencies, bugs, skills)
3. **¿Se comprime o se expande?** (si vamos rápido/lento)
4. **¿Necesitamos re-planificar?** (ajustar cronograma)

**Dueño:** SOFIA (Builder) + INTEGRA (Architect)

---

## Conclusión

**FASE 1 NO es un cronograma fijo de 7 semanas.**  
**Es un entregable de 10 expedientes validados, estimado en 3-5 semanas con buffer.**  
**Las semanas se adaptan según el avance, no al revés.**

Esto permite:
- ✅ Ser ágiles (si vamos rápido, no esperamos)
- ✅ Ser realistas (si algo toma más, ajustamos)
- ✅ Ser transparentes (el cliente ve progreso incremental, no una fecha lejana)
- ✅ Ser controlados (Gates aseguran calidad en cada paso)
