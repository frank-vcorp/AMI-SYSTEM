# Campos Identificados - Alta de Pacientes

## URL: https://devcami.azurewebsites.net/Catalogos/Pacientes/AltaPaciente.aspx

## Sección: Datos del Paciente

### Campos Identificados:

1. **Nombre** (Índice 11)
   - Etiqueta: "Nombre: *"
   - Tipo: Input text
   - Placeholder: "NOMBRE"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Campo obligatorio para identificación

2. **Apellido Paterno** (Índice 12)
   - Etiqueta: "Apellido Paterno: *"
   - Tipo: Input text
   - Placeholder: "APELLIDO PATERNO"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Campo obligatorio

3. **Apellido Materno** (Índice 13)
   - Etiqueta: "Apellido Materno: *"
   - Tipo: Input text
   - Placeholder: "APELLIDO MATERNO"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Campo obligatorio

4. **Fecha de Nacimiento** (Índice 14)
   - Etiqueta: "Fecha de Nacimiento: *"
   - Tipo: Input date
   - Formato: "DD/MM/YYYY"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Formato específico de fecha

5. **Género** (Índice 15)
   - Etiqueta: "Genero: *"
   - Tipo: Select dropdown
   - Valores posibles: "Seleccionar...", "FEMENINO", "MASCULINO"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Lista desplegable con opciones binarias

6. **Teléfono** (Índice 16)
   - Etiqueta: "TELEFONO: *"
   - Tipo: Input text
   - Placeholder: "TELEFONO"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Campo de contacto

7. **RFC** (Índice 17)
   - Etiqueta: "RFC: *"
   - Tipo: Input text
   - Placeholder: "RFC"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Registro Federal de Contribuyentes, botón "Generar..." disponible

8. **Razón Social** (Índice 19)
   - Etiqueta: "RAZON SOCIAL: *"
   - Tipo: Select dropdown
   - Valores posibles: Múltiples empresas listadas
   - Obligatorio: Sí (asterisco)
   - Observaciones: Lista extensa de empresas registradas

9. **Perfil** (Índice 20)
   - Etiqueta: "PERFIL: *"
   - Tipo: Select dropdown
   - Valores posibles: "[Seleccionar]"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Dependiente de la razón social seleccionada

## Sección: Comentarios

10. **Comentarios** (Índice 21)
    - Etiqueta: "Comentarios"
    - Tipo: Textarea
    - Placeholder: "COMENTARIOS"
    - Obligatorio: No
    - Observaciones: Campo de texto libre para observaciones

11. **Imprimir Comentarios** (Índice 22)
    - Etiqueta: "IMPRIMIR COMENTARIOS:"
    - Tipo: Select dropdown
    - Valores posibles: "Seleccionar...", "SI", "NO"
    - Obligatorio: No
    - Observaciones: Control para incluir comentarios en reportes



## Botones de Acción

12. **Vista Previa** (Índice 23)
    - Tipo: Button
    - Función: Previsualizar datos antes de guardar
    - Observaciones: Permite revisar información antes del guardado

13. **Guardar** (Índice 24)
    - Tipo: Button
    - Función: Guardar registro del paciente
    - Observaciones: Botón principal para confirmar el alta del paciente

## Resumen de Campos por Tipo:
- **Campos de texto obligatorios**: 6 (Nombre, Apellido Paterno, Apellido Materno, Teléfono, RFC)
- **Campos de fecha obligatorios**: 1 (Fecha de Nacimiento)
- **Campos de selección obligatorios**: 3 (Género, Razón Social, Perfil)
- **Campos de texto libre opcionales**: 1 (Comentarios)
- **Campos de selección opcionales**: 1 (Imprimir Comentarios)
- **Botones de acción**: 3 (Generar RFC, Vista Previa, Guardar)

