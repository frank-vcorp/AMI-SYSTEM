# Campos Identificados - Alta de Perfil

## URL: https://devcami.azurewebsites.net/Catalogos/Perfiles/AltaPerfiles.aspx

## Sección: Datos de Contacto

### Campos Identificados:

1. **Asesor** (Índice 11)
   - Etiqueta: "Asesor: *"
   - Tipo: Select dropdown
   - Valores posibles: "Seleccionar...", "LETICIA URIBE", "RUBEN MARES", "IRAIS MARTINEZ", "ALAN HERNANDEZ", "CRISTINA RAMIREZ", "CARMEN GALLEGOS"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Lista de asesores disponibles en el sistema

2. **Razón Social** (Índice 12)
   - Etiqueta: "Razon Social: *"
   - Tipo: Select dropdown
   - Valores posibles: Lista extensa de empresas (misma que en otros módulos)
   - Obligatorio: Sí (asterisco)
   - Observaciones: Selección de cliente/empresa

3. **Empresa** (Índice 13)
   - Etiqueta: "Empresa: *"
   - Tipo: Input text
   - Placeholder: "EMPRESA"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Nombre específico de la empresa

4. **Contacto** (Índice 14)
   - Etiqueta: "Contacto: *"
   - Tipo: Input text
   - Placeholder: "CONTACTO"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Nombre de la persona de contacto

5. **Email** (Índice 15)
   - Etiqueta: "Email: *"
   - Tipo: Input email
   - Placeholder: "example@dominio.com"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Email principal de contacto

6. **Email 2** (Índice 16)
   - Etiqueta: "Email 2:"
   - Tipo: Input email
   - Placeholder: "example@dominio.com"
   - Obligatorio: No
   - Observaciones: Email secundario opcional

7. **Email 3** (Índice 17)
   - Etiqueta: "Email 3:"
   - Tipo: Input email
   - Placeholder: "example@dominio.com"
   - Obligatorio: No
   - Observaciones: Email terciario opcional

8. **Teléfono** (Índice 18)
   - Etiqueta: "Telefono: *"
   - Tipo: Input text
   - Placeholder: "TELEFONO"
   - Obligatorio: Sí (asterisco)
   - Observaciones: Número telefónico de contacto

9. **Extensión** (Índice 19)
   - Etiqueta: "Extension:"
   - Tipo: Input text
   - Placeholder: "EXTENSION"
   - Obligatorio: No
   - Observaciones: Extensión telefónica opcional

10. **Puesto** (Índice 20)
    - Etiqueta: "Puesto: *"
    - Tipo: Input text
    - Placeholder: "PUESTO"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Cargo de la persona de contacto

## Sección: Datos del Perfil

11. **Nombre Perfil** (Índice 21)
    - Etiqueta: "Nombre: *"
    - Tipo: Input text
    - Placeholder: "NOMBRE PERFIL"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Nombre identificativo del perfil de exámenes

12. **Tipo de Perfil** (Índice 22)
    - Etiqueta: "Tipo de Perfil: *"
    - Tipo: Select dropdown
    - Valores posibles: "Seleccionar...", "INGRESO", "PERIODICO", "ESPECIAL"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Clasificación del tipo de perfil médico

13. **Proyecto** (Índice 23)
    - Etiqueta: "Proyecto: *"
    - Tipo: Input text
    - Placeholder: "PROYECTO"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Nombre del proyecto asociado

14. **Tipo Examen** (Índice 24)
    - Etiqueta: "Tipo Examen: *"
    - Tipo: Input text
    - Placeholder: "TIPO DE EXAMEN"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Clasificación del tipo de examen

15. **T.E. ELECTRONICA** (Índice 25)
    - Etiqueta: "T.E. ELECTRONICA: *"
    - Tipo: Select dropdown
    - Valores posibles: "Seleccionar...", "24 HORAS", "NO APLICA"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Tiempo de entrega electrónica

16. **T.E. Físico** (Índice 26)
    - Etiqueta: "T.E. Fisico: *"
    - Tipo: Input text
    - Placeholder: "TIEMPO DE ENTEGA FISICO"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Tiempo de entrega física del reporte



17. **Forma de Entrega** (Índice 13)
    - Etiqueta: "Forma de Entrega: *"
    - Tipo: Select dropdown
    - Valores posibles: "Seleccionar...", "FISICO", "ELECTRONICO", "AMBOS"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Método de entrega de resultados

18. **Formato de Reporte** (Índice 14)
    - Etiqueta: "Formato de Reporte: *"
    - Tipo: Select dropdown
    - Valores posibles: "Seleccionar...", "REPORTE+EVALUACIONES", "REPORTE+CONCENTRADO+EVALUACION...", "SOLO REPORTE", "SOLO CONCENTRADO", "SOLO EVALUACIONES"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Tipo de formato para el reporte médico

19. **Género** (Índice 15)
    - Etiqueta: "Genero: *"
    - Tipo: Select dropdown
    - Valores posibles: "Seleccionar...", "MASCULINO", "FEMENINO", "INDISTINTO"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Género aplicable para el perfil

20. **Estatus** (Índice 16)
    - Etiqueta: "Estatus: *"
    - Tipo: Select dropdown
    - Valores posibles: "Seleccionar...", "ACTIVADO", "DESACTIVADO"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Estado del perfil en el sistema

## Sección: Selecciona Examenes

Esta sección contiene una extensa lista de exámenes médicos disponibles, cada uno con:
- **Código del examen** (ej: EXMPCG, EXD20F, EXI9L1, etc.)
- **Nombre del examen** (ej: "25- OH HIDRO VITAMINA D", "ÁCIDO HIPURICO EN ORINA", etc.)
- **Checkbox "Habilitar"** para incluir el examen en el perfil
- **Campo "Costo"** para establecer el precio del examen

### Tipos de Exámenes Identificados (muestra):

21. **Exámenes de Laboratorio**:
    - 25- OH HIDRO VITAMINA D (EXMPCG)
    - ÁCIDO HIPURICO EN ORINA (EXD20F)
    - ÁCIDO METIL HIPÚRICO (EXI9L1)
    - ÁCIDO ÚRICO (EXP8Y1)
    - ALBUMINA (EXRQJL)
    - ALCOHOL EN SANGRE (EXNLFW)
    - CREATININA (EXIZ0H)
    - GLUCOSA (EGA110)
    - COLESTEROL (EXZG5D)

22. **Exámenes Clínicos**:
    - AGUDEZA VISUAL (EX8SGV)
    - AUDIOMETRIA (EAA101)
    - ESPIROMETRIA (EEA102)
    - ECG (EEG104)
    - CAMPIMETRIA (ECA103)

23. **Exámenes Especializados**:
    - BIOMETRIA HEMATICA (EBA116)
    - COPROLOGICO (ECO119)
    - EGO (EEO118)
    - EXAMEN MÉDICO (EMO100)

24. **Servicios Adicionales**:
    - CONSULTA MÉDICA (EXJX2Q)
    - CERTIFICADO MEDICO (EX0LJU)
    - AMBULANCIA TRASLADO (EXN6DH)

## Características del Módulo:
- **Función**: Creación de perfiles personalizados de exámenes médicos
- **Flexibilidad**: Permite seleccionar múltiples exámenes por perfil
- **Configuración**: Cada examen puede habilitarse/deshabilitarse y tener costo específico
- **Gestión**: Control completo sobre tiempos de entrega y formatos de reporte



### Exámenes Adicionales Identificados (continuación):

- VDRL (EXP119)
- VACUNA DE HEPATITIS (EXJ3PT)
- VACUNA INFLUENZA A Y B (EXA4AS)
- VACUNA TETANOS (EXW6LG)
- VALORACION ANTROPOMETRICA (EXX4H2)
- VALORACION POSTURAL (EXH6T8)
- ULTRASONIDO DE ABDOMEN SUPERIOR (EXG6GG)
- URGENCIA MEDICA (EXH8HV)
- UROCULTIVO C/AMB (EXC8GR)
- USG MAMARIO (EXC4AH)
- TIEMPO DE PROTROMBINA (TP) (EXC4V8)
- TIEMPO DE TROMBOPLASTINA (TPT) (EXM4GP)
- TIEMPOS DE COAGULACION (EXL2BU)
- TOMOGRAFIA (EXY7H8)
- TRIO HEPATICO (EXC4LT)
- TSHORMONA ESTIMULANTE DE TIROIDES (EXA5BX)
- ZINC EN SANGRE (EXA4AA)

## Sección: Comentarios

25. **Comentarios** (Índice 73)
    - Etiqueta: "Comentarios"
    - Tipo: Textarea
    - Placeholder: "COMENTARIOS"
    - Obligatorio: No
    - Observaciones: Campo de texto libre para observaciones del perfil

## Botones de Acción:

26. **Limpiar** (Índice 74)
    - Tipo: Button
    - Función: Limpiar todos los campos del formulario
    - Observaciones: Resetea el formulario completo

27. **Guardar** (Índice 75)
    - Tipo: Button
    - Función: Guardar el perfil creado
    - Observaciones: Botón principal para confirmar la creación del perfil

## Resumen del Módulo Alta de Perfil:

### Campos por Categoría:
- **Datos de Contacto**: 10 campos (asesor, razón social, empresa, contacto, emails, teléfono, extensión, puesto)
- **Datos del Perfil**: 10 campos (nombre, tipo, proyecto, tipo examen, tiempos entrega, forma entrega, formato reporte, género, estatus)
- **Selección de Exámenes**: 100+ exámenes disponibles (cada uno con checkbox habilitar y campo costo)
- **Comentarios**: 1 campo de texto libre
- **Acciones**: 2 botones (limpiar, guardar)

### Funcionalidades Clave:
- **Configuración Completa**: Permite crear perfiles personalizados de exámenes médicos
- **Gestión de Costos**: Cada examen puede tener un costo específico
- **Flexibilidad**: Múltiples opciones de entrega y formato de reportes
- **Catálogo Extenso**: Más de 100 tipos de exámenes disponibles
- **Control de Estado**: Perfiles pueden activarse/desactivarse

### Tipos de Exámenes Disponibles:
- **Laboratorio Clínico**: Análisis de sangre, orina, heces
- **Imagenología**: Rayos X, ultrasonido, tomografía, mamografía
- **Función Pulmonar**: Espirometría
- **Cardiología**: ECG
- **Oftalmología**: Agudeza visual, campimetría
- **Audiología**: Audiometría
- **Toxicología**: Detección de drogas y metales
- **Vacunación**: Diversas vacunas
- **Consultas Médicas**: Medicina general, nutrición, fisioterapia
- **Servicios Especiales**: Ambulancia, certificados médicos

