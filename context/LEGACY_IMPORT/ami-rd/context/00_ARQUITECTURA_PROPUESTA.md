# Arquitectura Propuesta: Integra Evolucionada

Esta propuesta presenta una arquitectura Integra Evolucionada, centrada en:

- Simplicidad operativa y modularidad.
- Estándares claros de entrega y trazabilidad.
- Capas separadas para dominio, aplicación y plataforma.
- Aceleradores de UI/UX (web/mobile) para entrega ágil: Next.js + TypeScript + Tailwind CSS + shadcn/ui (Radix UI) + Framer Motion; Expo + NativeWind en mobile.

Estructura estándar sugerida:
- context/: documentación de arquitectura y decisiones.
- api/: endpoints, contratos y adaptadores.
- scripts/: automatizaciones (bootstrap, tareas rutinarias).
- meta/: plantillas de control y trazabilidad.
- Checkpoints/: hitos y estados del proyecto.
- propuestas/: espacio para alternativas y POCs.

Principios:
- Evolución incremental, cambios pequeños y seguros.
- Observabilidad y checklist de calidad.
- Política fast-path: crear/editar sin pedir confirmación; confirmar solo acciones destructivas.
