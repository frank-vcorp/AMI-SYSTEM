# INTERCONSULTA: Mejora de PROYECTO-template.md en Metodología INTEGRA

**ID:** INTERCONSULTA-20260112-01  
**Fecha:** 2026-01-12  
**Autor:** INTEGRA (desde proyecto AMI-SYSTEM)  
**Destino:** Repositorio `metodologia-integra` (plantilla oficial)  
**Estado:** Pendiente de aplicar

---

## Contexto

Durante la documentación del proyecto AMI-SYSTEM, se identificaron mejoras para la plantilla `PROYECTO-template.md` de la Metodología INTEGRA:

1. **Falta sección de cronograma por fases** - crítica para vincular entregables con tiempos
2. **Campo `owner` usaba agentes en lugar de departamentos** - mejor usar departamentos para consistencia

El proyecto legacy `ami-rd` tenía esta estructura que resultó muy útil para:
1. Visualizar el cronograma por fases con semanas
2. Vincular entregables con hitos de pago (documentados aparte)
3. Alimentar el progress dashboard con contexto de tiempo
4. Asignar responsabilidades por departamento (no por agente)

---

## Cambios Propuestos

### 1. Agregar sección de Cronograma por Fases

Agregar a `templates/PROYECTO-template.md` la sección **"Entregables Clave por Fase (Cronograma)"** ANTES de la tabla de módulos del dashboard:

```markdown
## Entregables Clave por Fase (Cronograma)

| Fase | Semanas | Objetivo | Entregables de salida | Estado |
|------|---------|----------|----------------------|--------|
| FASE 0 – [Nombre] | Sem X-Y | [Objetivo principal] | [Lista de entregables] | Planeado |
| FASE 1 – [Nombre] | Sem X-Y | [Objetivo principal] | [Lista de entregables] | Planeado |
| FASE N – [Nombre] | Sem X-Y | [Objetivo principal] | [Lista de entregables] | Planeado |

> **Nota:** El cronograma está alineado con los hitos de pago acordados. Cualquier cambio se documentará aquí.
```

### 2. Usar Departamentos en lugar de Agentes para `owner`

En la tabla de módulos, el campo `owner` debe usar **departamentos** en lugar de nombres de agentes:

- `Frontend` - UI, componentes, PWA
- `Backend` - APIs, auth, database, storage
- `Frontend · Backend` - Módulos completos con UI y API
- `Backend · Data` - Procesamiento, IA, ETL
- `Data` - Analytics, métricas, calidad
- `DevOps` - Infraestructura, CI/CD, monitoreo
- `Arquitectura` - Diseño, documentación, ADRs
- `Operaciones` - Procesos, capacitación, soporte

### 3. Agregar marcadores de dashboard con instrucciones

```markdown
## Tablero — Módulos (Progress Dashboard)

Este listado alimenta el progress dashboard y debe mantenerse actualizado.  
Usa los campos `status` (`pending|progress|blocked|done`) y `progress` (0-100).  
En `owner` usa departamentos: `Frontend`, `Backend`, `Frontend · Backend`, `Backend · Data`, `Data`, `DevOps`, `Arquitectura`, `Operaciones`.

<!-- progress-modules:start -->
| id | name | phase | phaseOrder | owner | status | progress | summary | needs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| modulo-ejemplo | Módulo Ejemplo | FASE 0 – [Nombre] | 0 | Frontend · Backend | pending | 0 | Descripción (Sem X-Y) | Dependencias |
<!-- progress-modules:end -->
```

---

## Beneficios

1. **Trazabilidad financiera**: Vincula trabajo técnico con pagos
2. **Visibilidad para el cliente**: Tabla clara de entregables por hito
3. **Compatibilidad dashboard**: Marcadores `<!-- progress-modules -->` ya incluidos
4. **Estimaciones de tiempo**: Columna `Semanas` da contexto temporal
5. **Consistencia**: Todos los proyectos INTEGRA tendrán esta estructura

---

## Acción Requerida

1. Actualizar `templates/PROYECTO-template.md` en el repo oficial de metodología INTEGRA
2. Documentar en el README de la metodología el propósito de cada sección
3. Considerar agregar al `scripts/generate-dashboard.js` la lectura de la tabla de fases

---

## Ya Aplicado en AMI-SYSTEM

Este cambio ya fue aplicado localmente en:
- `/workspaces/AMI-SYSTEM/templates/PROYECTO-template.md`
- `/workspaces/AMI-SYSTEM/PROYECTO.md`

Puede usarse como referencia para el merge al repo oficial.

---

**🏗️ ARCH REFERENCE:** INTERCONSULTA-20260112-01  
**🤖 AUTHOR:** INTEGRA (Arquitecto IA)
