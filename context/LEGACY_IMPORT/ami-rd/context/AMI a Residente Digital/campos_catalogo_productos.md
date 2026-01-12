# Campos Identificados - Catálogo de Productos

## URL: https://devcami.azurewebsites.net/Catalogos/Productos/ListarProductos.aspx

## Sección: Parámetros de Búsqueda

1. **Clave de producto** (Índice 12)
   - Etiqueta: "Clave de producto:"
   - Tipo: Input text
   - Obligatorio: No
   - Observaciones: Campo de búsqueda por clave del producto

2. **Descripción del producto** (Índice 13)
   - Etiqueta: "Descripción del producto:"
   - Tipo: Input text
   - Obligatorio: No
   - Observaciones: Campo de búsqueda por descripción

3. **Buscar** (Índice 14)
   - Tipo: Button
   - Función: Ejecutar búsqueda de productos
   - Observaciones: Botón para filtrar productos

## Sección: Gestión de Productos

4. **Alta de Producto** (Índice 11)
   - Tipo: Link/Button
   - Función: Crear nuevo producto
   - Observaciones: Acceso a formulario de alta de productos

## Sección: Productos Registrados (Tabla)

### Estructura de la Tabla:
- **productoid**: Identificador único del producto
- **Clave**: Código alfanumérico del producto
- **Descripción**: Nombre descriptivo del producto

### Productos Identificados (muestra):

5. **Producto 458559**
   - Clave: "01-CUR"
   - Descripción: "CURSO"
   - Observaciones: Producto tipo curso

6. **Producto 458495**
   - Clave: "01-LENFENTB"
   - Descripción: "LIC EN ENFERMERIA ENTRY"
   - Observaciones: Servicio de enfermería nivel básico

7. **Producto 458504**
   - Clave: "01-LENFENTP"
   - Descripción: "LIC EN ENFERMERIA ENTRY"
   - Observaciones: Servicio de enfermería nivel básico

8. **Producto 458573**
   - Clave: "01-LENFENTTRO"
   - Descripción: "LIC EN ENFERMERIA ENTRY"
   - Observaciones: Servicio de enfermería nivel básico

9. **Producto 458804**
   - Clave: "01-LENFENTTRO01"
   - Descripción: "SERVICIOS PROFESIONALES MÉDICOS / ENFERM"
   - Observaciones: Servicios médicos profesionales

10. **Producto 458496**
    - Clave: "01-LENFJUNB"
    - Descripción: "LIC EN ENFERMERIA JUNIOR"
    - Observaciones: Servicio de enfermería nivel intermedio

11. **Producto 458505**
    - Clave: "01-LENFJUNP"
    - Descripción: "LIC EN ENFERMERIA JUNIOR"
    - Observaciones: Servicio de enfermería nivel intermedio

12. **Producto 458574**
    - Clave: "01-LENFJUNTRO"
    - Descripción: "LIC EN ENFERMERIA JUNIOR"
    - Observaciones: Servicio de enfermería nivel intermedio

13. **Producto 458497**
    - Clave: "01-LENFSENB"
    - Descripción: "LIC EN ENFERMERIA SENIOR"
    - Observaciones: Servicio de enfermería nivel avanzado

14. **Producto 458506**
    - Clave: "01-LENFSENP"
    - Descripción: "LIC EN ENFERMERIA SENIOR"
    - Observaciones: Servicio de enfermería nivel avanzado

## Sección: Navegación

15. **Paginación**
    - Páginas disponibles: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...
    - Observaciones: Sistema de paginación para navegar entre productos

## Características del Catálogo:

### Tipos de Productos Identificados:
- **Servicios de Enfermería**: Clasificados por niveles (ENTRY, JUNIOR, SENIOR)
- **Servicios Médicos**: Servicios profesionales médicos
- **Cursos**: Productos educativos o de capacitación

### Estructura de Codificación:
- **Prefijo**: "01-" para la mayoría de productos
- **Categoría**: LENF (Licenciado en Enfermería)
- **Nivel**: ENT (Entry), JUN (Junior), SEN (Senior)
- **Sufijo**: B, P, TRO, TRO01 (posibles variaciones de servicio)

### Funcionalidades:
- **Búsqueda**: Por clave o descripción
- **Gestión**: Alta de nuevos productos
- **Navegación**: Sistema de paginación
- **Visualización**: Tabla organizada con ID, clave y descripción

### Control de Datos:
- **Identificadores Únicos**: Cada producto tiene un productoid único
- **Códigos Estandarizados**: Sistema de claves alfanuméricas
- **Descripciones Claras**: Nombres descriptivos de servicios

## Resumen del Catálogo de Productos:
- **Total de Campos de Búsqueda**: 3 campos (clave, descripción, buscar)
- **Gestión**: 1 función (alta de producto)
- **Estructura de Datos**: 3 columnas principales (ID, clave, descripción)
- **Cobertura**: Servicios médicos y de enfermería principalmente
- **Navegación**: Sistema de paginación para grandes volúmenes de datos



# Formulario Alta Producto

## URL: https://devcami.azurewebsites.net/Catalogos/Productos/AltaProductoKepler.aspx

## Sección: Datos del Producto

16. **Razón Social** (Índice 11)
    - Etiqueta: "Razón Social:"
    - Tipo: Select dropdown
    - Valores posibles: "SELECCIONA", "adAMI_SALUD_RESPONSABL", "adSOLUCIONES_MEDICO_EM"
    - Obligatorio: Sí
    - Observaciones: Selección de la empresa/razón social responsable

17. **Tipo de Producto** (Índices 13, 15)
    - Etiqueta: "Tipo de Producto:"
    - Tipo: Radio buttons
    - Valores posibles: "Interno", "Externo"
    - Obligatorio: Sí
    - Observaciones: Clasificación del producto como interno o externo

18. **Clave de Producto** (Índice 17)
    - Etiqueta: "Clave de Producto: *"
    - Tipo: Input text
    - Validación: "Mínimo 3 caracteres Alfanuméricos"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Código único identificador del producto

19. **Descripción** (Índice 19)
    - Etiqueta: "Descripción: *"
    - Tipo: Input text
    - Obligatorio: Sí (asterisco)
    - Observaciones: Nombre descriptivo del producto

20. **Precio** (Índice 21)
    - Etiqueta: "Precio: *"
    - Tipo: Input numérico
    - Validación: "Valor Numérico"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Precio del producto

21. **Moneda** (Índice 16)
    - Etiqueta: "Moneda: *"
    - Tipo: Select dropdown
    - Valores posibles: "SELECCIONA", "PESOS"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Tipo de moneda para el precio

22. **Unidad de Medida** (Índice 18)
    - Etiqueta: "Unidad de Medida: *"
    - Tipo: Select dropdown
    - Valores posibles: "SELECCIONA", "(Ninguno)", "PIEZA - H87", "SERVICIO - E48"
    - Obligatorio: Sí (asterisco)
    - Observaciones: Unidad de medida del producto

23. **Clave SAT** (Índice 20)
    - Etiqueta: "Clave SAT: *"
    - Tipo: Input text
    - Obligatorio: Sí (asterisco)
    - Observaciones: Clave del Servicio de Administración Tributaria

24. **Aplica Rango** (Índices 23, 25)
    - Etiqueta: "Aplica Rango:"
    - Tipo: Radio buttons
    - Valores posibles: "No", "Si"
    - Obligatorio: No
    - Observaciones: Indica si el producto aplica rangos de precio

## Botones de Acción:

25. **Guardar** (Índice 26)
    - Tipo: Button
    - Función: Guardar nuevo producto
    - Observaciones: Confirma la creación del producto

26. **Limpiar** (Índice 27)
    - Tipo: Button
    - Función: Limpiar formulario
    - Observaciones: Resetea todos los campos del formulario

## Características del Formulario Alta Producto:

### Validaciones Identificadas:
- **Clave de Producto**: Mínimo 3 caracteres alfanuméricos
- **Precio**: Solo valores numéricos
- **Campos Obligatorios**: Marcados con asterisco (*)

### Tipos de Productos:
- **Interno**: Productos/servicios propios de la organización
- **Externo**: Productos/servicios de terceros

### Unidades de Medida Disponibles:
- **PIEZA - H87**: Para productos físicos
- **SERVICIO - E48**: Para servicios profesionales

### Integración Fiscal:
- **Clave SAT**: Cumplimiento con regulaciones fiscales mexicanas
- **Moneda**: Configuración en pesos mexicanos

### Funcionalidades Avanzadas:
- **Aplica Rango**: Posible configuración de precios por rangos o volúmenes
- **Razón Social**: Vinculación con entidades empresariales específicas

## Resumen Completo del Catálogo de Productos:
- **Campos de Listado**: 3 campos de búsqueda + tabla de resultados
- **Campos de Alta**: 11 campos de captura + 2 botones de acción
- **Total de Funcionalidades**: Búsqueda, listado, creación y gestión completa
- **Integración**: Sistema fiscal (SAT) y empresarial (razones sociales)
- **Validaciones**: Controles de formato y obligatoriedad

