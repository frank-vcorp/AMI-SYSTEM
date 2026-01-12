# Campos Identificados - Datos Generales de Exámenes

## URL: https://devcami.azurewebsites.net/Examenes/DatosGenerales.aspx

## Sección: Búsqueda Empleados

### Campos de Búsqueda:

1. **ID Paciente** (Índice 11)
   - Etiqueta: "ID PACIENTE"
   - Tipo: Input text
   - Placeholder: "Id Paciente"
   - Obligatorio: No
   - Observaciones: Identificador único del paciente

2. **Nombre de Paciente** (Índice 12)
   - Etiqueta: "NOMBRE DE PACIENTE"
   - Tipo: Input text
   - Placeholder: "Nombre de Paciente"
   - Obligatorio: No
   - Observaciones: Campo de búsqueda por nombre

3. **Apellido Paterno** (Índice 13)
   - Etiqueta: "APELLIDO PATERNO"
   - Tipo: Input text
   - Placeholder: "Apellido Paterno"
   - Obligatorio: No
   - Observaciones: Campo de búsqueda por apellido paterno

4. **Fecha** (Índice 14)
   - Etiqueta: "DD/MM/YYYY"
   - Tipo: Input date
   - Placeholder: "dd/mm/yyyy"
   - Obligatorio: No
   - Observaciones: Campo de búsqueda por fecha

### Botones de Búsqueda:

5. **Buscar** (Índice 15)
   - Tipo: Button
   - Función: Ejecutar búsqueda de empleados
   - Observaciones: Botón principal de búsqueda

6. **Limpiar** (Índice 16)
   - Tipo: Button
   - Función: Limpiar campos de búsqueda
   - Observaciones: Resetea los filtros de búsqueda

## Sección: Pacientes (Datos del Empleado)

### Información Personal:

7. **Primer Nombre** (Índice 18)
   - Etiqueta: "PRIMER NOMBRE"
   - Tipo: Input text
   - Placeholder: "Primer Nombre"
   - Obligatorio: Sí
   - Observaciones: Primer nombre del empleado

8. **Segundo Nombre** (Índice 20)
   - Etiqueta: "SEGUNDO NOMBRE"
   - Tipo: Input text
   - Placeholder: "Primer Nombre" (placeholder incorrecto)
   - Obligatorio: No
   - Observaciones: Segundo nombre opcional

9. **Apellido Paterno** (Índice 22)
   - Etiqueta: "APELLIDO PATERNO"
   - Tipo: Input text
   - Placeholder: "Paterno"
   - Obligatorio: Sí
   - Observaciones: Apellido paterno obligatorio

10. **Apellido Materno** (Índice 24)
    - Etiqueta: "APELLIDO MATERNO"
    - Tipo: Input text
    - Placeholder: "Materno"
    - Obligatorio: Sí
    - Observaciones: Apellido materno obligatorio

11. **Fecha de Nacimiento** (Índice 26)
    - Etiqueta: "FECHA DE NACIMIENTO"
    - Tipo: Input date
    - Placeholder: "dd/mm/yyyy"
    - Obligatorio: Sí
    - Observaciones: Fecha de nacimiento del empleado

12. **Sexo** (Índice 28)
    - Etiqueta: "SEXO"
    - Tipo: Select dropdown
    - Valores posibles: "FEMENINO", "MASCULINO"
    - Obligatorio: Sí
    - Observaciones: Género del empleado

### Información Laboral:

13. **Empresa** (Índice 30)
    - Etiqueta: "EMPRESA"
    - Tipo: Select dropdown
    - Valores posibles: "PHRAC INTERNATIONAL S DE RL DE..."
    - Obligatorio: Sí
    - Observaciones: Empresa donde labora el empleado

14. **Estatus** (Índice 32)
    - Etiqueta: "ESTATUS"
    - Tipo: Select dropdown
    - Valores posibles: "ALTA", "MODIFICACION", "BAJA", "ACTIVO", "INACTIVO", "SUSPENDIDO"
    - Obligatorio: Sí
    - Observaciones: Estado laboral del empleado

15. **Puesto** (Índice 34)
    - Etiqueta: "PUESTO"
    - Tipo: Select dropdown
    - Valores posibles: "DIRECTOR", "GERENTE", "SUPERINTENDENTE", "SUPERVISOR", "ING. DE CONTROL", "INGENIERO", "TECNICO", "JEFE", "COORDINADOR"
    - Obligatorio: Sí
    - Observaciones: Cargo del empleado en la empresa

16. **Teléfono** (Índice 36)
    - Etiqueta: "TELEFONO"
    - Tipo: Input text
    - Placeholder: "TELEFONO"
    - Obligatorio: No
    - Observaciones: Número telefónico de contacto

### Botón de Acción:

17. **Guardar** (Índice 37)
    - Tipo: Button
    - Función: Guardar datos del empleado
    - Observaciones: Botón para confirmar el registro

## Características del Módulo:
- **Función**: Gestión de datos generales de empleados para exámenes médicos
- **Contexto**: Módulo específico del proyecto TOYOTA
- **Integración**: Conecta datos de empleados con exámenes médicos
- **Validaciones**: Múltiples campos obligatorios para completitud de datos

