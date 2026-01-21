# ADR-ARCH-20260121-01: Integración de UI "MANUS" (Split-Screen) en Módulo de Validación

## Contexto
El sistema AMI-SYSTEM utilizaba un componente `ValidationPanel` basado en pestañas (Tabs) para separar la visualización del PDF de los datos extraídos. Sin embargo, para flujos de validación intensivos (High-Throughput), el cambio de contexto entre pestañas reduce la eficiencia y aumenta la carga cognitiva del médico validador.
Existe un diseño legacy "MANUS" (`validador_lado_a_lado.html`) que proponía una vista dividida (Split-Screen) que nunca se implementó en la versión React.

## Decisión
Se decide **reemplazar** la vista basada en pestañas por una vista de **Pantalla Dividida (Split-Screen)** usando el nuevo componente `ValidatorSideBySide`.

### Detalles de Implementación:
1.  **Layout**: 
    *   Izquierda (50%): Visor PDF (`PDFViewer`).
    *   Derecha (50%): Formulario de Validación y Datos Extraídos.
    *   Header Sticky: Controles de navegación y guardado siempre visibles.
2.  **Core UI**: Se extraen componentes base (`Card`, `Badge`, `Button`, `Input`) al paquete `@ami/core-ui` para asegurar consistencia visual con el diseño MANUS y la paleta de colores AMI.
3.  **DataBinding**: Las tarjetas de datos (Lab, Espirometría, RX) se generan dinámicamente según `extractedData` disponible en la tarea.
4.  **Entrada**: Se integra directamente en la ruta `/admin/validaciones/[id]/page.tsx`.

## Consecuencias
*   **Positivas**: Mayor velocidad de validación; alineación con la visión original del producto (MANUS); mejor experiencia de usuario para la demo.
*   **Negativas**: Requiere refactorizar la lógica de `ValidationForm` para que funcione dentro de tarjetas individuales en lugar de un formulario monolítico (ya abordado en la implementación inicial).

## Estado
Aprobado e Implementado ✅

## Referencias
*   `packages/mod-validacion/src/components/ValidatorSideBySide.tsx`
*   `context/LEGACY_IMPORT/.../validador_lado_a_lado.html`
