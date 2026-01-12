# PROYECTO: [Nombre del Proyecto] (Cliente: [Nombre del Cliente])

## Flujo de estados
- [ ] Pendiente
- [/] En Progreso
- [✓] Hecho
- [X] Aprobado

---

## Entregables Clave por Fase (Cronograma y Pagos)

> **IMPORTANTE:** Esta sección vincula las fases del proyecto con los hitos de pago acordados con el cliente.

| Fase | Semanas | Objetivo | Entregables de salida | Estado | Pago |
|------|---------|----------|----------------------|--------|------|
| FASE 0 – [Nombre] | Sem X-Y | [Objetivo principal] | [Lista de entregables] | Planeado | 💰 Pago 1 |
| FASE 1 – [Nombre] | Sem X-Y | [Objetivo principal] | [Lista de entregables] | Planeado | 💰 Pago 2 |
| FASE 2 – [Nombre] | Sem X-Y | [Objetivo principal] | [Lista de entregables] | Planeado | 💰 Pago 3 |
| FASE N – [Nombre] | Sem X-Y | [Objetivo principal] | [Lista de entregables] | Planeado | 💰 Pago N |

> **Nota:** El cronograma está alineado con los hitos de pago acordados. Cualquier cambio se documentará aquí.

---

## Tablero — Módulos (Progress Dashboard)

Este listado alimenta el progress dashboard y debe mantenerse actualizado.  
Usa los campos `status` (`pending|progress|blocked|done`) y `progress` (0-100).  
En `owner` usa departamentos: `Frontend`, `Backend`, `Frontend · Backend`, `Backend · Data`, `Data`, `DevOps`, `Arquitectura`, `Operaciones`.

<!-- progress-modules:start -->
| id | name | phase | phaseOrder | owner | status | progress | summary | needs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| modulo-ejemplo | Módulo Ejemplo | FASE 0 – [Nombre] | 0 | Frontend · Backend | pending | 0 | Descripción breve (Sem X-Y) | Dependencias |
<!-- progress-modules:end -->

---

## Backlog inicial
- [ ] Bootstrap de estructura y artefactos
- [ ] Definición de Esquema de Datos y Lógica de Negocio
  - [ ] Implementar interfaces y tipos de datos para todas las entidades principales
  - [ ] Establecer la estructura inicial para la lógica de negocio compartida
- [ ] Implementación del Módulo Principal [NOMBRE]
  - [ ] Desarrollar API REST para [ENTIDAD]
  - [ ] Implementar interfaz de usuario web para CRUD de [ENTIDAD]
  - [ ] Implementar interfaz de usuario móvil (si aplica)
  - [ ] Añadir validaciones y manejo de errores
  - [ ] Integrar con la base de datos
- [ ] Autenticación y Autorización
  - [ ] Configurar Firebase Authentication / Auth0 / etc.
  - [ ] Implementar flujos de login/registro
  - [ ] Implementar roles de usuario
- [ ] Revisión de criterios de calidad al inicio de cada sprint/entrega

## Actualización [YYYY-MM-DD]
- [Describir cambios importantes del día/sprint]
- [Tooling, decisiones arquitectónicas, etc.]

### Artefactos Generados (Metodología Integra)
- [ ] `.aiexclude` - Optimización de contexto AI
- [ ] `.env.example` - Variables de entorno documentadas
- [ ] `.gitignore` - Protecciones de seguridad
- [ ] `context/SPEC-SEGURIDAD.md` - Especificación de medidas de seguridad
- [ ] `context/SPEC-TESTING.md` - Especificación de estrategia de testing
- [ ] `meta/plantilla_SPEC.md` - Plantilla estandarizada para SPECs
- [ ] `meta/plantilla_control.md` - Estructura de checkpoints
- [ ] `meta/SPEC-CODIGO.md` - Convenciones y estándares de código
- [ ] `meta/criterios_calidad.md` - Criterios de calidad del proyecto
- [ ] `context/dossier_tecnico.md` - Bitácora técnica viva

## Backlog Fase 2: [Nombre de la Fase]
- [ ] [Tarea 1]
  - [ ] Subtarea 1.1
  - [ ] Subtarea 1.2
- [ ] [Tarea 2]
  - [ ] Subtarea 2.1
  - [ ] Subtarea 2.2

## Actualización [YYYY-MM-DD]
- [Describir hitos alcanzados]
- [Métricas importantes]

## Notas y Referencias
- [Links importantes, documentos de referencia, etc.]
