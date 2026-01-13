# 📊 Cronograma Dinámico FASE 1
**Fecha:** 13 Enero 2026  
**Metodología:** INTEGRA v2.0 + Cronograma Ágil/Dinámico  
**Objetivo:** 10 expedientes validados al final de FASE 1

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
Inicio FASE 1: Semana 7 (Lunes)

SEMANA 7 (3-5 días):
├── Core-Auth implementación
├── Core-Storage implementación
└── GATE A PASS → MOD-EXPEDIENTES autorizado

SEMANA 8 (5-7 días):
├── MOD-EXPEDIENTES desarrollo
├── Setup flujo: Recepción → Examen → Carga
└── GATE B PASS → Primeros 2 expedientes procesados

SEMANA 9 (3-4 días):
├── Core-Signatures implementación (paralelo si es posible)
├── Validación manual de los 2 expedientes
└── GATE C PASS → 2 expedientes validados, calidad OK

SEMANA 10-11 (7-10 días):
├── MOD-VALIDACION desarrollo
├── MOD-REPORTES desarrollo
├── Procesar batch de 5 expedientes
└── GATE D PASS → 5 expedientes con reportes generados

SEMANA 12-13 (5-7 días):
├── Testing, refinamientos
├── Procesar batch de 10 expedientes
├── Documentación + Training
└── CIERRE: 10 expedientes validados + reportes

TOTAL: 24-36 días (4-5 semanas reales si no hay blockers)
```

---

## Tabla de Entregables Dinámicos

| Fase | Entregable | Criterio de Aceptación | Duración Est. | Flexible? |
|------|-----------|--------|--------|----------|
| **A** | Core-Auth + Storage | Firebase login + GCP bucket funcional | 3-5 días | ±1 día |
| **B** | MOD-EXPEDIENTES v1 | 2 expedientes flujo completo | 5-7 días | ±2 días |
| **C** | MOD-VALIDACION setup | 2 expedientes validados sin errores | 3-4 días | ±1 día |
| **D** | MOD-VALIDACION scaled | 5 expedientes en lote | 7-10 días | ±3 días |
| **E** | MOD-REPORTES | 10 expedientes con reportes PDF | 5-7 días | ±2 días |

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

### GATE B: MOD-EXPEDIENTES Piloto ✅
**Criterios:**
- [ ] 2 expedientes completados end-to-end
- [ ] Flujo: Recepción → Examen → Carga estudios → Almacenado en GCP
- [ ] UI responsive en desktop + tablet
- [ ] No hay errores críticos en logs

**Responsable:** SOFIA  
**Aprobador:** INTEGRA  
**Si PASA:** Proceder a 5 expedientes + empezar MOD-VALIDACION  
**Si FALLA:** Fix bugs (máx 3 días), retest con 2 nuevos expedientes

---

### GATE C: MOD-VALIDACION Setup ✅
**Criterios:**
- [ ] Core-Signatures implementado y probado
- [ ] 2 expedientes validados + firmados digitalmente
- [ ] Reportes en PDF generados (sin IA aún, solo template)
- [ ] Firma médica visible + verificable en PDF

**Responsable:** SOFIA  
**Aprobador:** GEMINI-QA  
**Si PASA:** Proceder a batch de 5 expedientes  
**Si FALLA:** Fix + remediación (máx 3 días)

---

### GATE D: MOD-VALIDACION Scaled ✅
**Criterios:**
- [ ] 5 expedientes procesados en lote (sin errores)
- [ ] IA extrae datos (semáforos, resultados, etc.)
- [ ] Médico validador revisa y aprueba
- [ ] 5 reportes PDF generados + emails enviados
- [ ] Performance: <10 seg por expediente

**Responsable:** SOFIA  
**Aprobador:** INTEGRA + GEMINI-QA  
**Si PASA:** Final batch de 10 expedientes  
**Si FALLA:** Debugging + optimization (máx 5 días)

---

### GATE E: FASE 1 Cierre ✅
**Criterios:**
- [ ] 10 expedientes completos (Recepción → Validación → Reporte)
- [ ] 100% de validaciones exitosas
- [ ] Documentación para Go-Live
- [ ] Training completado (AMI staff)

**Responsable:** SOFIA  
**Aprobador:** INTEGRA + GEMINI-QA  
**Si PASA:** FASE 1 CERRADA, listo para FASE 2  
**Si FALLA:** No hay falla aceptable aquí (es el cierre)

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
