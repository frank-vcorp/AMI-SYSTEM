# Campos Identificados - Módulo de Audiometría

## URL: https://devcami.azurewebsites.net/Examenes/Audiometria.aspx

## Sección: Examen de Audiometría

### Campo de Carga de Archivo:

1. **Archivo de Audiometría** (Índice 11)
   - Etiqueta: "Choose File"
   - Tipo: File upload
   - Función: Cargar archivo de audiometría
   - Observaciones: Permite subir archivos relacionados con el examen

## Sección: Mediciones Auditivas por Frecuencia

### Oído Derecho (OD):

2. **OD - 500 Hz** (Índice 12)
   - Etiqueta: "500 Hz"
   - Tipo: Input numérico
   - Unidad: dB (decibeles)
   - Observaciones: Medición auditiva oído derecho a 500 Hz

3. **OD - 1000 Hz** (Índice 13)
   - Etiqueta: "1000 Hz"
   - Tipo: Input numérico
   - Unidad: dB (decibeles)
   - Observaciones: Medición auditiva oído derecho a 1000 Hz

4. **OD - 2000 Hz** (Índice 14)
   - Etiqueta: "2000 Hz"
   - Tipo: Input numérico
   - Unidad: dB (decibeles)
   - Observaciones: Medición auditiva oído derecho a 2000 Hz

5. **OD - 3000 Hz** (Índice 15)
   - Etiqueta: "3000 Hz"
   - Tipo: Input numérico
   - Unidad: dB (decibeles)
   - Observaciones: Medición auditiva oído derecho a 3000 Hz

### Oído Izquierdo (OI):

6. **OI - 500 Hz** (Índice 16)
   - Etiqueta: "500 Hz"
   - Tipo: Input numérico
   - Unidad: dB (decibeles)
   - Observaciones: Medición auditiva oído izquierdo a 500 Hz

7. **OI - 1000 Hz** (Índice 17)
   - Etiqueta: "1000 Hz"
   - Tipo: Input numérico
   - Unidad: dB (decibeles)
   - Observaciones: Medición auditiva oído izquierdo a 1000 Hz

8. **OI - 2000 Hz** (Índice 18)
   - Etiqueta: "2000 Hz"
   - Tipo: Input numérico
   - Unidad: dB (decibeles)
   - Observaciones: Medición auditiva oído izquierdo a 2000 Hz

9. **OI - 3000 Hz** (Índice 19)
   - Etiqueta: "3000 Hz"
   - Tipo: Input numérico
   - Unidad: dB (decibeles)
   - Observaciones: Medición auditiva oído izquierdo a 3000 Hz

## Sección: Pérdida por Oído

10. **Pérdida OD** (Índice 20)
    - Etiqueta: "Perdida x Oido - OD"
    - Tipo: Input numérico
    - Formato: "0.00"
    - Unidad: Porcentaje (%)
    - Observaciones: Porcentaje de pérdida auditiva oído derecho

11. **Pérdida OI** (Índice 21)
    - Etiqueta: "Perdida x Oido - OI"
    - Tipo: Input numérico
    - Formato: "0.00"
    - Unidad: Porcentaje (%)
    - Observaciones: Porcentaje de pérdida auditiva oído izquierdo

## Sección: Hipoacusia Bilateral Combinada

12. **Hipoacusia Bilateral** (Índice 22)
    - Etiqueta: "Hipoacusia Bilateral Combinada"
    - Tipo: Input numérico
    - Formato: "0.00"
    - Unidad: Porcentaje (%)
    - Observaciones: Porcentaje de hipoacusia bilateral combinada

## Sección: Faringe

13. **Faringe** (Índice 23)
    - Etiqueta: "Faringe"
    - Tipo: Select dropdown
    - Valores posibles: "SIN DATOS PATOLÓGICOS"
    - Observaciones: Estado de la faringe

## Sección: CAD & MTD

14. **CAD** (Índice 24)
    - Etiqueta: "CAD"
    - Tipo: Select dropdown
    - Valores posibles: "PERMEABLE"
    - Observaciones: Estado del Conducto Auditivo Derecho

15. **MTD** (Índice 25)
    - Etiqueta: "MTD"
    - Tipo: Select dropdown
    - Valores posibles: "INTEGRA ASPECTO NORMAL"
    - Observaciones: Estado de la Membrana Timpánica Derecha

## Sección: CAI & MTI

16. **CAI** (Índice 26)
    - Etiqueta: "CAI"
    - Tipo: Select dropdown
    - Valores posibles: "PERMEABLE"
    - Observaciones: Estado del Conducto Auditivo Izquierdo

17. **MTI** (Índice 27)
    - Etiqueta: "MTI"
    - Tipo: Select dropdown
    - Valores posibles: "INTEGRA ASPECTO NORMAL"
    - Observaciones: Estado de la Membrana Timpánica Izquierda

## Sección: Diagnóstico OD

18. **ETIOLÓGICO** (Índice 29)
    - Etiqueta: "ETIOLÓGICO"
    - Tipo: Select dropdown
    - Observaciones: Diagnóstico etiológico del oído derecho

19. **NOSOLÓGICO** (Índice 31)
    - Etiqueta: "NOSOLÓGICO"
    - Tipo: Select dropdown
    - Observaciones: Diagnóstico nosológico del oído derecho

20. **HIPOACUSIA** (Índice 33)
    - Etiqueta: "HIPOACUSIA"
    - Tipo: Select dropdown
    - Observaciones: Clasificación de hipoacusia del oído derecho

## Características del Módulo:
- **Función**: Captura completa de examen audiométrico
- **Mediciones**: Frecuencias estándar (500, 1000, 2000, 3000 Hz)
- **Evaluación Bilateral**: Mediciones separadas para cada oído
- **Cálculos Automáticos**: Porcentajes de pérdida auditiva
- **Diagnóstico Integral**: Evaluación anatómica y funcional
- **Carga de Archivos**: Soporte para documentos complementarios

## Validaciones y Cálculos:
- **Unidades Estándar**: Mediciones en decibeles (dB)
- **Porcentajes**: Cálculo automático de pérdidas auditivas
- **Estados Predefinidos**: Opciones estandarizadas para diagnósticos
- **Evaluación Completa**: Desde conducto auditivo hasta diagnóstico final



## Sección: DETALLES OD (Oído Derecho)

21. **Descripción Audiométrica** (Índice 12)
    - Etiqueta: "Descripción Audiométrica:"
    - Tipo: Textarea
    - Obligatorio: No
    - Observaciones: Campo de texto libre para descripción detallada del examen audiométrico del oído derecho

22. **Comentarios 1** (Índice 13)
    - Etiqueta: "Comentarios:"
    - Tipo: Textarea
    - Obligatorio: No
    - Observaciones: Campo para comentarios adicionales sobre el oído derecho

23. **Impresión Diagnóstica** (Índice 14)
    - Etiqueta: "Impresión Diagnóstica:"
    - Tipo: Textarea
    - Obligatorio: No
    - Observaciones: Campo para la impresión diagnóstica del oído derecho

24. **Comentarios 2** (Índice 15)
    - Etiqueta: "Comentarios:"
    - Tipo: Textarea
    - Obligatorio: No
    - Observaciones: Campo adicional de comentarios para el oído derecho

25. **Recomendaciones** (Índice 16)
    - Etiqueta: "Recomendaciones:"
    - Tipo: Textarea
    - Obligatorio: No
    - Observaciones: Campo para recomendaciones médicas relacionadas con el oído derecho

26. **Comentarios 3** (Índice 17)
    - Etiqueta: "Comentarios:"
    - Tipo: Textarea
    - Obligatorio: No
    - Observaciones: Campo adicional de comentarios para el oído derecho

## Sección: DIAGNÓSTICO OI (Oído Izquierdo)

27. **ETIOLÓGICO OI** (Índice 19)
    - Etiqueta: "ETIOLÓGICO"
    - Tipo: Select dropdown
    - Observaciones: Diagnóstico etiológico del oído izquierdo

28. **NOSOLÓGICO OI** (Índice 21)
    - Etiqueta: "NOSOLÓGICO"
    - Tipo: Select dropdown
    - Observaciones: Diagnóstico nosológico del oído izquierdo

29. **HIPOACUSIA OI** (Índice 23)
    - Etiqueta: "HIPOACUSIA"
    - Tipo: Select dropdown
    - Observaciones: Clasificación de hipoacusia del oído izquierdo

## Características Adicionales del Módulo:

### Estructura Diagnóstica:
- **Evaluación Bilateral**: Diagnósticos separados para cada oído (OD y OI)
- **Múltiples Campos de Texto**: Permite documentación detallada y comentarios extensos
- **Flexibilidad Diagnóstica**: Campos libres para descripciones personalizadas

### Campos de Documentación:
- **Descripción Audiométrica**: Interpretación técnica de los resultados
- **Impresión Diagnóstica**: Conclusión médica del examen
- **Recomendaciones**: Sugerencias de tratamiento o seguimiento
- **Comentarios Múltiples**: Varios campos para observaciones adicionales

### Flujo de Trabajo:
1. **Mediciones Técnicas**: Captura de valores por frecuencia
2. **Cálculos Automáticos**: Porcentajes de pérdida auditiva
3. **Evaluación Anatómica**: Estado de conductos y membranas
4. **Diagnóstico Médico**: Clasificación etiológica y nosológica
5. **Documentación Detallada**: Descripciones y recomendaciones

## Resumen del Módulo Audiometría:
- **Total de Campos**: 29 campos identificados
- **Tipos de Datos**: Numéricos (dB), porcentajes, listas desplegables, texto libre
- **Cobertura**: Evaluación completa desde medición hasta diagnóstico
- **Documentación**: Extensa capacidad de registro de observaciones médicas

