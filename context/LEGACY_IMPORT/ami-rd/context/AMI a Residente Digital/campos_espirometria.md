# Campos Identificados - Módulo de Espirometría

## URL: https://devcami.azurewebsites.net/Examenes/Espirometria.aspx

## Sección: Examen de Espirometría

### Campo de Carga de Archivo:

1. **Archivo de Espirometría** (Índice 11)
   - Etiqueta: "Choose File"
   - Tipo: File upload
   - Función: Cargar archivo de espirometría
   - Observaciones: Permite subir archivos relacionados con el examen

## Sección: REPETIBILIDAD - Mediciones Principales

### FVC (Capacidad Vital Forzada):

2. **FVC Medición 1** (Índice 13)
   - Etiqueta: "FVC"
   - Tipo: Input numérico
   - Formato: "0.00"
   - Unidad: Litros (L)
   - Observaciones: Primera medición de capacidad vital forzada

3. **FVC Medición 2** (Índice 14)
   - Etiqueta: "FVC"
   - Tipo: Input numérico
   - Formato: "0.00"
   - Unidad: Litros (L)
   - Observaciones: Segunda medición de capacidad vital forzada

4. **FVC Medición 3** (Índice 15)
   - Etiqueta: "FVC"
   - Tipo: Input numérico
   - Formato: "0.00"
   - Unidad: Litros (L)
   - Observaciones: Tercera medición de capacidad vital forzada

5. **FVC Medición 4** (Índice 16)
   - Etiqueta: "FVC"
   - Tipo: Input numérico
   - Formato: "0.00"
   - Unidad: Litros (L)
   - Observaciones: Cuarta medición de capacidad vital forzada

### FEV1 (Volumen Espiratorio Forzado en 1 segundo):

6. **FEV1 Medición 1** (Índice 18)
   - Etiqueta: "FEV1"
   - Tipo: Input numérico
   - Formato: "0.00"
   - Unidad: Litros (L)
   - Observaciones: Primera medición de volumen espiratorio forzado en 1 segundo

7. **FEV1 Medición 2** (Índice 19)
   - Etiqueta: "FEV1"
   - Tipo: Input numérico
   - Formato: "0.00"
   - Unidad: Litros (L)
   - Observaciones: Segunda medición de FEV1

8. **FEV1 Medición 3** (Índice 20)
   - Etiqueta: "FEV1"
   - Tipo: Input numérico
   - Formato: "0.00"
   - Unidad: Litros (L)
   - Observaciones: Tercera medición de FEV1

9. **FEV1 Medición 4** (Índice 21)
   - Etiqueta: "FEV1"
   - Tipo: Input numérico
   - Formato: "0.00"
   - Unidad: Litros (L)
   - Observaciones: Cuarta medición de FEV1

## Sección: Criterios de Calidad

10. **PICO MAXIMO** (Índice 23)
    - Etiqueta: "PICO MAXIMO"
    - Tipo: Select dropdown
    - Observaciones: Evaluación del pico máximo de flujo

11. **FORMA TRIANGULAR** (Índice 25)
    - Etiqueta: "FORMA TRIANGULAR"
    - Tipo: Select dropdown
    - Observaciones: Evaluación de la forma triangular de la curva

12. **LIBRE ARTEFACTOS** (Índice 27)
    - Etiqueta: "LIBRE ARTEFACTOS"
    - Tipo: Select dropdown
    - Observaciones: Verificación de ausencia de artefactos en la medición

13. **MESETA > 1 SEG** (Índice 29)
    - Etiqueta: "MESETA > 1 SEG >"
    - Tipo: Select dropdown
    - Observaciones: Verificación de meseta mayor a 1 segundo

14. **TIEMPO > 4 SEG** (Índice 31)
    - Etiqueta: "TIEMPO > 4 SEG"
    - Tipo: Select dropdown
    - Observaciones: Verificación de tiempo de espiración mayor a 4 segundos

15. **REPETIBILIDAD FVC < 200 ML** (Índice 33)
    - Etiqueta: "REPETIBILIDAD FVC < 200 ML"
    - Tipo: Select dropdown
    - Observaciones: Verificación de repetibilidad de FVC menor a 200 ml

16. **REPETIBILIDAD FEV1 < 200 ML** (Índice 35)
    - Etiqueta: "REPETIBILIDAD FEV1 < 200 ML"
    - Tipo: Select dropdown
    - Observaciones: Verificación de repetibilidad de FEV1 menor a 200 ml

17. **PRUEBAS ACEPTABLES** (Índice 37)
    - Etiqueta: "PRUEBAS ACEPTABLES"
    - Tipo: Input numérico
    - Observaciones: Número de pruebas aceptables realizadas

## Sección: Evaluación y Diagnóstico

18. **CALIDAD** (Índice 39)
    - Etiqueta: "CALIDAD"
    - Tipo: Select dropdown
    - Observaciones: Evaluación general de la calidad del examen

19. **CRITERIOS PARA DX** (Índice 41)
    - Etiqueta: "CRITERIOS PARA DX"
    - Tipo: Select dropdown
    - Observaciones: Criterios utilizados para el diagnóstico

20. **DIAGNOSTICO** (Índice 43)
    - Etiqueta: "DIAGNOSTICO"
    - Tipo: Select dropdown
    - Observaciones: Diagnóstico espirométrico final

## Sección: Documentación Médica

21. **IMPRESIÓN DIAGNOSTICA** (Índice 45)
    - Etiqueta: "IMPRESIÓN DIAGNOSTICA"
    - Tipo: Textarea
    - Obligatorio: No
    - Observaciones: Campo de texto libre para impresión diagnóstica detallada

22. **COMENTARIO** (Índice 47)
    - Etiqueta: "COMENTARIO"
    - Tipo: Textarea
    - Obligatorio: No
    - Observaciones: Campo para comentarios adicionales sobre el examen

## Características del Módulo:

### Mediciones Técnicas:
- **Múltiples Intentos**: Hasta 4 mediciones por parámetro (FVC y FEV1)
- **Unidades Estándar**: Mediciones en litros con precisión decimal
- **Repetibilidad**: Control de calidad mediante múltiples mediciones

### Criterios de Calidad:
- **Evaluación Técnica**: Verificación de forma de curva, picos, artefactos
- **Criterios Temporales**: Control de tiempos de espiración y mesetas
- **Repetibilidad**: Verificación de consistencia entre mediciones
- **Aceptabilidad**: Conteo de pruebas válidas

### Diagnóstico Integral:
- **Evaluación Automática**: Criterios predefinidos para diagnóstico
- **Documentación Libre**: Campos de texto para interpretación médica
- **Calidad Global**: Evaluación general del examen realizado

## Resumen del Módulo Espirometría:
- **Total de Campos**: 22 campos identificados
- **Tipos de Datos**: Numéricos (litros), listas desplegables, texto libre
- **Cobertura**: Desde medición técnica hasta diagnóstico médico
- **Control de Calidad**: Múltiples criterios de validación técnica

