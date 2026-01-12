# RD-AMI — Paquete para MANUS (2025-09-15)

Este paquete contiene:
- 00_RESUMEN: resumen ejecutivo, acuerdos de junta, versiones (7.0, 7.1, 7.2), y lineamientos de interfaz y seguridad.
- 01_FUENTES_PDF: estudios en PDF/JPG nativos para construir extractores (anclas→campos).
- 02_MAPEO: la plantilla Excel de mapeo de campos y umbrales de semáforos.
- 03_ESTRUCTURA_DEMO: estructura de carpetas final del demo (vacía, lista para poblar).
- 04_UI_MOCKS: mock HTML simple del Validador lado-a-lado (PDF vs. datos extraídos).
- 05_RULES: borradores de reglas (semáforos, identidad, nomenclatura) y control de versiones.

## Instrucciones rápidas
1. Revisar `00_RESUMEN/RD-AMI_Encargo_MANUS_2025-09-15.txt`.
2. Validar plantillas y anclas con los PDFs en `01_FUENTES_PDF`.
3. Llenar/ajustar `02_MAPEO/RD-AMI_Mapeo_Anclas_2025-09-15.xlsx`.
4. Implementar extractores con pruebas unitarias (por proveedor/plantilla).
5. Conectar el motor de semáforos y generar borrador de dictamen.
6. Emisión de PDF institucional + “Papeleta” (ver `05_RULES/PAPELETA_spec.md`).

## Notas de seguridad
- No usar datos para entrenamiento externo.
- Accesos por rol/cliente/sede; enlaces caducables; bitácora total; sellado de tiempo.