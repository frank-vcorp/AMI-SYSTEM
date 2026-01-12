# Estructura de Mapeo AMI a Residente Digital

## Descripción General

Este archivo Excel (`Mapa_Campos_Sistema_AMI_RD.xlsx`) contiene la estructura completa de mapeo para normalizar los datos del sistema AMI al proyecto Residente Digital (RD). La estructura está diseñada para preservar toda la información del sistema actual, pero de forma optimizada y trazable.

## Estructura del Archivo

### Hojas Principales (01-05)

1. **01_Identidad**: Datos de identificación del paciente
   - CURP, RFC, NSS y otros identificadores únicos
   - Campos marcados como PII/PHI y anclas de identidad

2. **02_Paciente**: Información general del paciente
   - Datos demográficos, contacto y información personal
   - Incluye validaciones de edad y formato

3. **03_Empresa**: Datos de la empresa
   - Información corporativa y de contacto
   - RFC empresarial y datos fiscales

4. **04_Orden**: Órdenes de servicio/estudio
   - Información de órdenes médicas y servicios
   - Trazabilidad de estudios solicitados

5. **05_Estudio_General**: Información general de estudios
   - Datos comunes a todos los tipos de estudios
   - Metadatos y información de contexto

### Hojas de Módulos Específicos (06-14)

6. **06_Audiometria**: Módulo de Audiometría
7. **07_Espirometria**: Módulo de Espirometría  
8. **08_ECG_Campimetria**: Módulo de ECG/Campimetría
9. **09_RX**: Módulo de Rayos X
10. **10_Laboratorio**: Módulo de Laboratorio
11. **11_Toxicologia**: Módulo de Toxicología
12. **12_Riesgo_CV**: Módulo de Riesgo Cardiovascular
13. **13_Examen_Medico**: Módulo de Examen Médico
14. **14_Resumen_Medico**: Módulo de Resumen Médico

### Hoja de Catálogo (99)

15. **99_Cat_Datos**: Catálogo de datos estandarizados
    - Tipos de datos válidos
    - Entidades RD disponibles
    - Valores estándar para campos S/N
    - Códigos de semáforo

## Columnas de Mapeo

Cada hoja de mapeo contiene las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| **Módulo/Sec** | Sección o módulo del sistema AMI |
| **Pantalla/URL** | Pantalla específica donde aparece el campo |
| **Etiqueta en sistema** | Nombre del campo tal como aparece en AMI |
| **Clave interna** | Identificador interno del campo (si existe) |
| **Tipo de dato** | Clasificación: texto/número/fecha/categoría/booleano |
| **Formato/Unidad** | Formato esperado o unidad de medida |
| **Obligatorio (S/N)** | Si el campo es requerido |
| **PII/PHI (S/N)** | Si contiene información personal/médica sensible |
| **Ancla de identidad (S/N)** | Si es clave para identificar registros |
| **Entidad RD destino** | Entidad en el modelo RD donde se mapea |
| **Campo RD destino** | Campo específico en la entidad RD |
| **Regla de normalización** | Transformaciones necesarias (ej: mayúsculas) |
| **Regla de validación** | Validaciones de integridad de datos |
| **Semáforo** | Reglas de alertas por umbrales |
| **Bloqueante (S/N)** | Si errores impiden continuar el proceso |
| **Ejemplo sistema** | Valor real capturado del sistema |
| **Ejemplo PDF** | Valor como aparece en reportes PDF |
| **Fuente** | Origen del dato (captura/ID/URL) |
| **Notas** | Observaciones, inconsistencias o riesgos |

## Características de Seguridad

- **Identificación PII/PHI**: Todos los campos de identidad y salud están marcados apropiadamente
- **Trazabilidad**: Cada campo tiene su fuente y reglas de transformación documentadas
- **Validaciones**: Reglas de integridad para mantener calidad de datos
- **Semáforos**: Sistema de alertas para valores críticos

## Uso del Archivo

1. **Análisis del Sistema AMI**: Use las credenciales proporcionadas para explorar cada módulo
2. **Mapeo Completo**: Complete cada fila con los campos encontrados
3. **Validación**: Verifique que no se omita ningún campo visible
4. **Normalización**: Defina las reglas de transformación necesarias
5. **Entrega**: El archivo completo servirá como matriz de normalización

## Acceso al Sistema AMI

- **URL**: https://devcami.azurewebsites.net/Seguridad/Login.aspx?ReturnUrl=%2F
- **Usuario**: DEMO  
- **Contraseña**: 123456

## Objetivo Final

Este mapeo permitirá demostrar que toda la información del sistema AMI se preserva en el proyecto Residente Digital, pero de forma optimizada, normalizada y completamente trazable.

