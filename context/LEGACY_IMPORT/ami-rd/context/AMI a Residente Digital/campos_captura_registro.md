# Campos Identificados - Captura de Registros

## URL: https://devcami.azurewebsites.net/Catalogos/Pacientes/CapturaRegistro.aspx

## Sección: Parámetros de Búsqueda

### Campos Identificados:

1. **PAPELETA** (Índice 11)
   - Etiqueta: "PAPELETA: *"
   - Tipo: Input text
   - Placeholder: "#"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Campo obligatorio para buscar registros por número de papeleta

## Botones de Acción:

2. **Buscar** (Índice 12)
   - Tipo: Button
   - Función: Buscar registro por número de papeleta
   - Observaciones: Botón para ejecutar la búsqueda del registro

## Características del Módulo:
- **Título**: "Captura de Registros"
- **Función**: Búsqueda y captura de registros específicos por papeleta
- **Requisito**: Número de papeleta obligatorio para proceder
- **Flujo**: Primero buscar por papeleta, luego capturar/editar registro

## Observaciones Adicionales:
- El sistema requiere un número de papeleta específico para acceder al registro
- Esta funcionalidad parece ser para editar/completar registros existentes
- Es diferente del "Alta Pacientes" que crea registros nuevos

