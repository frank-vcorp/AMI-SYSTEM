# PROYECTO: AMI-SYSTEM (Migración e Implementación v2.0)

## 1. Visión del Proyecto
Migración y modernización del sistema AMI, importando el conocimiento del repositorio legacy a la nueva metodología INTEGRA v2.0. El objetivo es reconstruir la documentación y arquitectura aprovechando las mejoras de la nueva metodología.

## 2. Objetivos Principales
1.  **Importación de Contexto Legacy**: Centralizar la información del sistema anterior para referencia.
2.  **Definición de Arquitectura v2.0**: Establecer la nueva arquitectura basada en los estándares actuales.
3.  **Documentación Actualizada**: Reescribir SPECs y ADRs alineados con INTEGRA v2.0.

## 3. Épicas y Tareas

### Épica 1: Inicialización y Migración de Contexto [ESTADO: EN_PROGRESO]
- [x] Tarea 1.1: Importar repositorio legacy a `context/LEGACY_IMPORT` (Realizado vía git clone). [PRIORIDAD: ALTA] [RESPONSABLE: INTEGRA]
- [x] Tarea 1.2: Análisis de brecha (Gap Analysis) entre el sistema anterior y el nuevo estándar. [PRIORIDAD: MEDIA] [RESPONSABLE: INTEGRA] → Ver `context/handoffs/ANALISIS-LEGACY-AMI-RD.md`
- [ ] Tarea 1.3: Definir `00_ARQUITECTURA_PROPUESTA.md` basado en el análisis. [PRIORIDAD: ALTA] [RESPONSABLE: INTEGRA]

### Épica 2: Definición de Arquitectura y SPECs [ESTADO: PENDIENTE]
- [ ] Tarea 2.1: Crear ADR sobre estrategia de migración vs. reescritura. [PRIORIDAD: MEDIA] [RESPONSABLE: INTEGRA]
- [ ] Tarea 2.2: Definir Stack Tecnológico actualizado en `meta/STACK-TECNOLOGICO.md`. [PRIORIDAD: MEDIA] [RESPONSABLE: INTEGRA]

## 4. Estado Global
- **Fase Actual**: Inicialización
- **Semáforo**: 🟢 (Verde - Inicio normal)

## 5. Notas Importantes
- El contenido legacy servirá solo como referencia. La "fuente de verdad" será la nueva documentación generada en la raíz y en `context/` (fuera de `LEGACY_IMPORT`).

## Tablero — Módulos fuente (PRUEBA)
Este listado alimenta el progress dashboard. Datos de prueba para validar funcionamiento.

<!-- progress-modules:start -->
| id | name | phase | phaseOrder | owner | status | progress | summary | needs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| test-arquitectura | Definición de Arquitectura | FASE 0 – Inicialización | 0 | INTEGRA | progress | 60 | Análisis y diseño de arquitectura v2.0 | Confirmación de decisiones técnicas |
| test-dashboard | Prueba Progress Dashboard | FASE 0 – Inicialización | 0 | INTEGRA | progress | 30 | Validar que el dashboard funciona en nuevo repo | Parser y datos de prueba |
| test-cronograma | Actualizar Cronograma | FASE 0 – Inicialización | 0 | INTEGRA | pending | 0 | Ajustar cronograma con nuevo alcance | Dashboard funcionando |
<!-- progress-modules:end -->
