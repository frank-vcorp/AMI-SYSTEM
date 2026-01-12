# 01 - Visión General del Proyecto RD-AMI

## 1. Introducción

El proyecto **RD-AMI (Residente Digital con IA)** tiene como objetivo principal la digitalización y automatización del proceso de gestión de expedientes médicos ocupacionales. Utilizando inteligencia artificial, el sistema busca centralizar la ingesta de estudios clínicos en formato PDF, extraer y normalizar datos, aplicar reglas de semaforización clínica, facilitar la validación médica y generar reportes institucionales con folio y código QR, garantizando una entrega controlada y trazabilidad completa.

Este documento proporciona una visión general del proyecto, sus objetivos, el alcance del piloto, los componentes clave y la propuesta arquitectónica inicial.

## 2. Objetivos del Proyecto

*   **Centralizar la Ingesta:** Consolidar estudios clínicos (SIM, RX, Audiometría, Espirometría, ECG/Campimetría, Laboratorio, Toxicológico) provenientes de diversas fuentes (buzón, carpeta, SFTP) en un único sistema.
*   **Automatizar la Extracción y Normalización:** Utilizar IA (OCR y parsing) para extraer datos relevantes de PDFs nativos y normalizarlos según estándares definidos.
*   **Aplicar Lógica Clínica:** Implementar un motor de reglas para la semaforización automática de resultados clínicos, identificando valores críticos o fuera de rango.
*   **Optimizar la Validación Médica:** Proporcionar una interfaz para que el personal médico valide los datos extraídos por la IA, realice dictámenes y añada observaciones.
*   **Generar Expedientes y Reportes Institucionales:** Producir reportes de aptitud y expedientes completos en formato PDF, con elementos de seguridad como folio único y QR.
*   **Garantizar la Entrega Segura y Trazabilidad:** Implementar mecanismos de entrega controlada (enlaces caducables) y mantener una bitácora detallada de todas las interacciones.
*   **Proveer Métricas Operativas:** Ofrecer dashboards y métricas sobre el tiempo de respuesta (TAT), tasa de rechazo y reprocesos.

## 3. Alcance del Piloto

El piloto de RD-AMI se enfocará en las siguientes funcionalidades clave, con una duración estimada de 6 a 8 semanas:

*   **Ingesta:** Soporte para PDFs nativos vía buzón/carpeta/SFTP.
*   **Clasificación:** Organización de estudios por Empresa → Paciente → Orden → Estudio → Fecha.
*   **Extracción y Normalización:** Procesamiento de datos para Laboratorio, RX, Audiometría, Espirometría, ECG/Campimetría y Toxicológico, utilizando plantillas con "anclas".
*   **Semaforización:** Aplicación de reglas clínicas para la identificación automática de hallazgos relevantes.
*   **Validación Médica:** Panel web para la revisión y validación obligatoria por parte del médico.
*   **Emisión:** Generación de Reporte de Aptitud y Expediente Institucional en PDF con QR y folio.
*   **Entrega:** Enlaces caducables para la entrega segura de documentos.
*   **Trazabilidad:** Bitácora de eventos y acciones.
*   **Métricas:** Recopilación de datos operativos (TAT, tasa de rechazo).

## 4. Componentes Principales (Módulos Propuestos)

La arquitectura propuesta se basa en los siguientes módulos interconectados:

*   **Ingesta/ETL:** Responsable de la recepción, monitoreo y control de duplicados de los archivos de entrada.
*   **OCR y Parsing PDF:** Módulo encargado de la extracción de texto y datos estructurados de los PDFs, utilizando herramientas como `pdfminer`/`ocrmypdf` y plantillas configurables.
*   **Normalizador:** Transforma los datos extraídos a un formato estandarizado, mapeando valores por tipo de estudio.
*   **Motor de Reglas:** Un sistema declarativo (ej. JSON Rules) para aplicar la lógica de semaforización clínica.
*   **Validador Médico:** Una aplicación web (panel) que permite a los médicos revisar, editar y validar los datos y dictámenes generados por la IA.
*   **Generador de PDFs:** Crea los documentos finales (Reporte de Aptitud, Expediente) utilizando plantillas institucionales, incorporando QR y folio.
*   **Entrega Segura:** Gestiona la distribución de los documentos mediante enlaces firmados y caducables, con verificación de acceso.
*   **Auditoría:** Registra todas las acciones y eventos del sistema para garantizar la trazabilidad y el cumplimiento.
*   **Métricas/Dashboard:** Proporciona visualizaciones y reportes sobre el rendimiento operativo del sistema.

## 5. Propuesta Arquitectónica y Tecnológica (Alto Nivel)

La propuesta arquitectónica se orienta hacia un enfoque moderno, escalable y basado en la nube, con énfasis en la experiencia de usuario y la seguridad.

*   **UI/UX Web:** Se propone el uso de **Next.js** con **TypeScript**, **Tailwind CSS** para el estilizado, **shadcn/ui** (basado en Radix UI) para componentes accesibles y **Framer Motion** para animaciones.
*   **Backend/API:** Se prevé una arquitectura de microservicios o funciones serverless para los módulos de ingesta, OCR, normalización y reglas.
*   **Base de Datos:** Se considerarán opciones escalables y gestionadas, adecuadas para datos estructurados y no estructurados.
*   **Almacenamiento de Archivos:** Soluciones de almacenamiento en la nube (ej. S3-compatible o Google Cloud Storage) para los PDFs originales y generados.
*   **Infraestructura Cloud:** Se priorizará el ecosistema de **Google Cloud Platform (GCP)** y **Firebase** (Hosting, Functions, Firestore/Storage/Auth) para el despliegue, manteniendo la independencia del proveedor mediante adaptadores.
*   **Seguridad:** Cifrado en reposo y en tránsito, mínimos privilegios, control de acceso basado en roles.
*   **Observabilidad:** Implementación de logs estructurados y tracing por ID de expediente.

## 6. Riesgos y Mitigaciones (Resumen)

*   **Variabilidad de Formatos PDF:** Mitigado con un motor de anclas flexible y tolerancia en el parsing, además de la validación médica obligatoria.
*   **Errores de Extracción de IA:** Mitigado por la validación médica humana como paso final y obligatorio.
*   **Privacidad y Cumplimiento (LFPDPPP, NOM-024-SSA3-2012):** Abordado con cifrado, control de acceso por rol, logs detallados y enlaces caducables.
*   **Indisponibilidad de Modelos de IA (ej. gpt-5):** Mitigado con fallbacks a modelos alternativos (ej. gpt-4o), aunque podría impactar los tiempos de procesamiento.

## 7. Próximos Pasos

Los siguientes pasos incluyen la elaboración de documentos de especificación funcional y diseño técnico detallado, así como la planificación de pruebas y despliegue, antes de iniciar cualquier fase de programación.
