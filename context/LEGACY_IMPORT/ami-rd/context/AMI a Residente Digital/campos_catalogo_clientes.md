# Campos Identificados - Catálogo de Clientes

## URL: https://devcami.azurewebsites.net/Catalogos/Clientes/ListarClientes.aspx

## Sección: Parámetros de Búsqueda

1. **RFC** (Índice 12)
   - Etiqueta: "RFC:"
   - Tipo: Input text
   - Obligatorio: No
   - Observaciones: Campo de búsqueda por Registro Federal de Contribuyentes

2. **Nombre** (Índice 13)
   - Etiqueta: "Nombre:"
   - Tipo: Input text
   - Obligatorio: No
   - Observaciones: Campo de búsqueda por nombre de la empresa

3. **Buscar** (Índice 14)
   - Tipo: Button
   - Función: Ejecutar búsqueda de clientes
   - Observaciones: Botón para filtrar clientes

## Sección: Gestión de Clientes

4. **Alta de Cliente** (Índice 11)
   - Tipo: Link/Button
   - Función: Crear nuevo cliente
   - Observaciones: Acceso a formulario de alta de clientes

## Sección: Clientes Registrados (Tabla)

### Estructura de la Tabla:
- **Código Cliente**: Identificador único numérico del cliente
- **Nombre**: Razón social de la empresa
- **RFC**: Registro Federal de Contribuyentes
- **Facturación**: Tipo de facturación (SME)
- **Activo**: Estado del cliente (0=Inactivo, 1=Activo)

### Clientes Identificados (muestra):

5. **Cliente 0050**
   - Código: "0050"
   - Nombre: "YANFENG INTERNATIONAL AUTOMOTIVE TECHNOLOGY MEXICO"
   - RFC: "JCF141217C37"
   - Facturación: "SME"
   - Activo: "0" (Inactivo)
   - Observaciones: Empresa automotriz internacional

6. **Cliente 0026**
   - Código: "0026"
   - Nombre: "SERVICIOS ADMINISTRATIVOS ALUMINICASTE S DE RL DE CV"
   - RFC: "SAA1009306QA"
   - Facturación: "SME"
   - Activo: "1" (Activo)
   - Observaciones: Servicios administrativos

7. **Cliente 0003**
   - Código: "0003"
   - Nombre: "PRETTL DE MEXICO"
   - RFC: "PME960930B53"
   - Facturación: "SME"
   - Activo: "1" (Activo)
   - Observaciones: Empresa manufacturera

8. **Cliente 0004**
   - Código: "0004"
   - Nombre: "FIT VOLTAIRA MEXICO"
   - RFC: "PEB060831943"
   - Facturación: "SME"
   - Activo: "1" (Activo)
   - Observaciones: Empresa del sector eléctrico

9. **Cliente 0005**
   - Código: "0005"
   - Nombre: "PRODUCTOS ALIMENTARIOS EL PLAN"
   - RFC: "PAP880921NP8"
   - Facturación: "SME"
   - Activo: "1" (Activo)
   - Observaciones: Industria alimentaria

10. **Cliente 0007**
    - Código: "0007"
    - Nombre: "PROTECCION CATODICA DE MEXICO"
    - RFC: "PCM071009JC6"
    - Facturación: "SME"
    - Activo: "1" (Activo)
    - Observaciones: Servicios de protección industrial

11. **Cliente 0008**
    - Código: "0008"
    - Nombre: "PROTEINAS Y OLEICOS SA DE CV"
    - RFC: "POL0204177E8"
    - Facturación: "SME"
    - Activo: "1" (Activo)
    - Observaciones: Industria de proteínas y aceites

12. **Cliente 0009**
    - Código: "0009"
    - Nombre: "PUBLICO EN GENERAL"
    - RFC: "XAXX010101000"
    - Facturación: "SME"
    - Activo: "1" (Activo)
    - Observaciones: Cliente genérico para público general

13. **Cliente 0011**
    - Código: "0011"
    - Nombre: "QUIMICA ATSA SA DE CV"
    - RFC: "QAT760930DJ2"
    - Facturación: "SME"
    - Activo: "1" (Activo)
    - Observaciones: Industria química

14. **Cliente 0012**
    - Código: "0012"
    - Nombre: "RBP METALURGIA SA DE CV"
    - RFC: "RME000724TW7"
    - Facturación: "SME"
    - Activo: "1" (Activo)
    - Observaciones: Industria metalúrgica

## Sección: Navegación

15. **Paginación**
    - Páginas disponibles: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...
    - Observaciones: Sistema de paginación para navegar entre clientes

## Características del Catálogo:

### Tipos de Industrias Identificadas:
- **Automotriz**: Yanfeng International, Prettl de Mexico
- **Alimentaria**: Productos Alimentarios El Plan, Proteínas y Oleicos
- **Química**: Química Atsa
- **Metalúrgica**: RBP Metalurgia, Aluminicaste
- **Eléctrica**: Fit Voltaira Mexico
- **Servicios**: Protección Catódica, Servicios Administrativos
- **Público General**: Cliente genérico

### Estructura de Codificación:
- **Códigos Numéricos**: Secuenciales de 4 dígitos (0003, 0004, 0005, etc.)
- **RFC Válidos**: Cumplimiento con formato fiscal mexicano
- **Estados**: Control de activación/desactivación de clientes

### Funcionalidades:
- **Búsqueda**: Por RFC o nombre de empresa
- **Gestión**: Alta de nuevos clientes
- **Control de Estado**: Activación/desactivación de clientes
- **Navegación**: Sistema de paginación
- **Facturación**: Clasificación SME (Sistema de Facturación)

### Integración Fiscal:
- **RFC Válidos**: Todos los clientes tienen RFC válido
- **Facturación SME**: Sistema de facturación estandarizado
- **Público General**: RFC genérico XAXX010101000 para ventas al público

## Resumen del Catálogo de Clientes:
- **Total de Campos de Búsqueda**: 3 campos (RFC, nombre, buscar)
- **Gestión**: 1 función (alta de cliente)
- **Estructura de Datos**: 5 columnas principales (código, nombre, RFC, facturación, activo)
- **Cobertura**: Empresas de múltiples sectores industriales
- **Control**: Estados activo/inactivo para gestión de clientes
- **Navegación**: Sistema de paginación para grandes volúmenes

