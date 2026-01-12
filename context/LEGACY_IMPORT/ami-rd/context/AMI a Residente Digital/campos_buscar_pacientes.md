# Campos Identificados - Búsqueda de Pacientes

## URL: https://devcami.azurewebsites.net/Catalogos/Pacientes/RegistroPacientes.aspx

## Sección: Búsqueda

### Campos de Búsqueda Identificados:

1. **RFC** (Índice 11)
   - Etiqueta: "RFC"
   - Tipo: Input text
   - Placeholder: "RFC"
   - Obligatorio: No
   - Observaciones: Campo de búsqueda por RFC del paciente

2. **No. de Papeleta** (Índice 12)
   - Etiqueta: "NO. DE PAPELETA"
   - Tipo: Input text
   - Placeholder: "NO. DE PAPELETA"
   - Obligatorio: No
   - Observaciones: Número de identificación interno del sistema

3. **Seleccionar Empresa** (Índice 13)
   - Etiqueta: "[SELECCIONAR EMPRESA]"
   - Tipo: Select dropdown
   - Valores posibles: Lista extensa de empresas (misma que en Alta)
   - Obligatorio: No
   - Observaciones: Filtro por empresa para búsqueda

4. **Fecha** (Índice 14)
   - Etiqueta: "DD/MM/YYYY"
   - Tipo: Input date
   - Placeholder: "dd/mm/yyyy"
   - Formato: DD/MM/YYYY
   - Obligatorio: No
   - Observaciones: Filtro por fecha (posiblemente fecha de registro o nacimiento)

5. **Nombre del Paciente** (Índice 15)
   - Etiqueta: "NOMBRE DEL PACIENTE (PATERNO MATERNO NOMBRE)"
   - Tipo: Input text
   - Placeholder: "Nombre del Paciente (Paterno Materno Nombre)"
   - Obligatorio: No
   - Observaciones: Campo de búsqueda por nombre completo con formato específico

## Botones de Acción:

6. **Buscar** (Índice 16)
   - Tipo: Button
   - Función: Ejecutar búsqueda con criterios ingresados
   - Observaciones: Botón principal para realizar la búsqueda

7. **Limpiar** (Índice 17)
   - Tipo: Button
   - Función: Limpiar todos los campos de búsqueda
   - Observaciones: Resetea el formulario de búsqueda

## Características del Módulo:
- **Título**: "Listado de Pacientes"
- **Función**: Búsqueda y filtrado de pacientes registrados
- **Campos opcionales**: Todos los campos de búsqueda son opcionales
- **Flexibilidad**: Permite búsqueda por múltiples criterios combinados

