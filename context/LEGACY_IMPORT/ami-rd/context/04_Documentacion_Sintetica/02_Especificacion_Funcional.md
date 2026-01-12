# 02 - Especificación Funcional RD-AMI

## 1. Módulos y Flujo de Trabajo

El sistema RD-AMI se estructura en los siguientes módulos principales, que en conjunto orquestan el flujo de trabajo de un expediente médico:

### 1.1. Ingesta
*   **Descripción:** Punto de entrada para los documentos clínicos (PDFs nativos). El sistema monitorea una o varias fuentes (carpetas locales, SFTP, buzones de correo) para nuevos archivos.
*   **Funcionalidades:**
    *   Monitoreo continuo de directorios/fuentes configuradas.
    *   Recepción de PDFs nativos.
    *   Control de duplicados basado en hashes de archivo y/o metadatos.
    *   Almacenamiento inicial de los PDFs en un sistema de almacenamiento seguro.
    *   Trigger para iniciar el proceso de clasificación.
*   **Entradas:** Archivos PDF (estudios clínicos).
*   **Salidas:** PDFs almacenados, eventos de archivo nuevo, metadatos básicos de archivo.

### 1.2. Clasificación
*   **Descripción:** Organiza los documentos entrantes y establece la identidad única del expediente.
*   **Funcionalidades:**
    *   Extracción de metadatos clave (Ej. Nombre Paciente, Empresa, Tipo de Estudio, Fecha) de la estructura del archivo o de patrones predefinidos en el PDF (anclas).
    *   Asignación de un folio único al expediente utilizando una llave compuesta (Empresa–Paciente–Orden–Estudio–Fecha).
    *   Agrupación de estudios bajo un mismo expediente de paciente.
    *   Registro en la bitácora de auditoría.
*   **Entradas:** PDFs y metadatos básicos.
*   **Salidas:** Expedientes con folio asignado, estudios clasificados, metadatos estructurados.

### 1.3. Extracción y Normalización (IA/OCR)
*   **Descripción:** Procesa los PDFs para extraer datos estructurados de su contenido y los transforma a un formato estandarizado.
*   **Funcionalidades:**
    *   Aplicación de técnicas de OCR y parsing (ej. `pdfminer`, `ocrmypdf`) para extraer texto de PDFs.
    *   Utilización de plantillas de extracción basadas en "anclas" y patrones para capturar valores específicos (rangos, resultados, parámetros).
    *   Normalización de unidades de medida, terminología y formatos de fecha/número.
    *   Calificación de la confianza de la extracción de IA.
    *   Detección de valores críticos o fuera de los rangos de referencia definidos para cada estudio.
*   **Entradas:** PDFs clasificados, plantillas de anclas.
*   **Salidas:** Datos clínicos estructurados (JSON/XML), indicadores de confianza, semáforización inicial de resultados.

### 1.4. Motor de Reglas (Semaforización)
*   **Descripción:** Aplica un conjunto de reglas declarativas para evaluar los datos normalizados y generar alertas o indicadores de aptitud.
*   **Funcionalidades:**
    *   Ejecución de reglas de negocio configurables (ej. JSON Rules) sobre los datos clínicos extraídos.
    *   Generación de semáforos (rojo, amarillo, verde) para cada estudio o parámetro, indicando criticidad o necesidad de seguimiento.
    *   Sugerencia de dictámenes de aptitud (Apto, Apto con Restricciones, No Apto) basada en los hallazgos.
    *   Generación de sugerencias para observaciones o recomendaciones para el médico validador.
*   **Entradas:** Datos clínicos normalizados.
*   **Salidas:** Semáforos asignados, dictamen sugerido, observaciones/recomendaciones sugeridas por IA.

### 1.5. Validación Médica
*   **Descripción:** Interfaz web donde los médicos revisan, corrigen y validan los datos y dictámenes generados por la IA.
*   **Funcionalidades:**
    *   Panel de control con expedientes pendientes de validación.
    *   Visualizador de PDF (posiblemente con campos resaltados de extracción).
    *   Formularios editables para los datos extraídos con la confianza de la IA.
    *   Capacidad para aceptar, corregir o añadir observaciones a los datos y semáforos.
    *   Selección del dictamen final de aptitud.
    *   Firma electrónica del expediente por el médico validador.
    *   Gestión de roles y permisos por sede/cliente.
*   **Entradas:** Datos con semáforos y dictámenes sugeridos, PDFs originales.
*   **Salidas:** Expedientes con dictamen médico final, datos validados, firma médica, eventos de auditoría.

### 1.6. Emisión
*   **Descripción:** Genera los documentos finales institucionales del expediente.
*   **Funcionalidades:**
    *   Generación de "Papeleta de Aptitud" (resumen compacto).
    *   Generación de "Reporte Médico Completo" (expediente detallado).
    *   Inclusión de folio único y código QR en el PDF final.
    *   Utilización de plantillas personalizables para los formatos de reporte.
    *   Versionado de los documentos emitidos.
*   **Entradas:** Expediente validado, datos clínicos finales, firma médica, plantillas de reporte.
*   **Salidas:** PDFs institucionales (Papeleta, Reporte Completo).

### 1.7. Entrega Segura
*   **Descripción:** Gestiona la distribución segura de los expedientes a los destinatarios autorizados.
*   **Funcionalidades:**
    *   Generación de enlaces caducables y protegidos para la descarga de PDFs.
    *   Envío de correos electrónicos con enlaces seguros a múltiples destinatarios.
    *   Registro de acceso, descarga, IP y marca de tiempo en la bitácora.
    *   Configuración de la caducidad y número de visualizaciones permitidas por enlace.
*   **Entradas:** PDFs emitidos, listas de destinatarios.
*   **Salidas:** Enlaces compartibles, eventos de entrega y acceso registrados.

### 1.8. Auditoría y Métricas
*   **Descripción:** Proporciona trazabilidad completa y monitoreo del rendimiento del sistema.
*   **Funcionalidades:**
    *   Registro detallado de todas las acciones y cambios en el sistema (bitácora).
    *   Captura de sellos de tiempo y usuarios responsables.
    *   Generación de informes y dashboards para métricas operativas (TAT, tasa de rechazo, reprocesos).
    *   Visualización de la precisión de la IA en la extracción y semaforización. 
*   **Entradas:** Todos los eventos y datos del sistema.
*   **Salidas:** Logs estructurados, reportes de actividad, dashboards de rendimiento.

## 2. Diagrama de Flujo de Alto Nivel

```mermaid
graph TD
    A[Ingesta de PDFs] --> B{Clasificación y Folio Único}
    B --> C{Extracción y Normalización (IA/OCR)}
    C --> D{Motor de Reglas (Semaforización)}
    D --> E[Validación Médica Humana]
    E --> F{Emisión de PDFs Institucionales}
    F --> G[Entrega Segura (Email/Link Cad. / Descarga)]
    G --> H[Auditoría y Métricas]
    H --> I[Feedback para Mejora IA/Reglas]

    E -- Corrección/Feedback --> C
    E -- Revalidación --> D

    style E fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
    style D fill:#ddf,stroke:#333,stroke-width:2px
    style A fill:#bfb,stroke:#333,stroke-width:2px
    style F fill:#bdf,stroke:#333,stroke-width:2px
    style G fill:#ffb,stroke:#333,stroke-width:2px
    style H fill:#fdb,stroke:#333,stroke-width:2px
    style B fill:#bfd,stroke:#333,stroke-width:2px
    style I fill:#fbc,stroke:#333,stroke-width:2px

```

## 3. Requisitos de Datos - Folio Único

La clave de identificación única para cada expediente será una combinación de los siguientes atributos:
*   **Empresa:** Identificador único de la empresa cliente.
*   **Paciente:** Identificador único del paciente.
*   **Orden:** Número o identificador de la orden de servicios.
*   **Estudio:** Tipo específico de estudio clínico (ej. Laboratorio, RX, Espirometría).
*   **Fecha:** Fecha de realización o recepción del estudio.

Esta llave compuesta asegura la unicidad y trazabilidad de cada estudio dentro del sistema.

## 4. Interfaces (basado en la demo)

El sistema web interactivo presenta las siguientes secciones principales:

*   **Dashboard:** Visión general de métricas clave (Pacientes en proceso, Dictámenes emitidos, TAT promedio, Precisión IA) y actividad reciente.
*   **Recepción:** Formulario para la creación de nuevas papeletas (registro inicial de paciente, empresa, estudios a realizar).
*   **Examen Médico:** Formulario para la captura de signos vitales, somatometría, agudeza visual y dictamen médico.
*   **Estudios:** Sección de carga de estudios (SIM y NOVA) con arrastrar y soltar, simulación de procesamiento por IA y visualización de resultados procesados.
*   **Validación:** Interfaz para la revisión médica de los datos extraídos por la IA, con visualizador de PDF y semaforización de resultados.
*   **Reportes:** Generación y gestión de Papeletas de Aptitud y Reportes Completos, con opciones de descarga y envío controlado.
*   **Papeletas:** Gestión y listado de todas las papeletas con filtros de búsqueda y estadísticas rápidas.
*   **Empresas:** Catálogo de empresas clientes con perfiles detallados, métricas y configuración de servicios.
*   **Expedientes:** Generador de expedientes completos, previsualización y opciones de envío (email, enlace compartible, descarga).
*   **Bitácora:** Registro de actividades del sistema.
*   **Analytics:** Métricas y gráficos avanzados (no detallado en demo).
*   **Calidad:** Gestión de criterios de calidad (no detallado en demo).
*   **Comunicaciones:** Gestión de comunicaciones (no detallado en demo).
*   **Admin:** Configuración de sistema (no detallado en demo).
