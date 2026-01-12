# 04 - Plan de Pruebas Preliminar RD-AMI

## 1. Introducción

Este documento describe el plan de pruebas preliminar para el sistema RD-AMI. El objetivo es asegurar que el sistema cumpla con los requisitos funcionales y no funcionales definidos, garantizando su calidad, fiabilidad y rendimiento antes de su despliegue en producción.

## 2. Estrategia de Pruebas

Se adoptará una estrategia de pruebas por fases, cubriendo diferentes niveles de abstracción y tipos de pruebas:

*   **Pruebas Unitarias:** Verificación de componentes individuales (funciones, clases, módulos) de forma aislada.
*   **Pruebas de Integración:** Verificación de la interacción entre diferentes módulos y servicios del sistema.
*   **Pruebas Funcionales (End-to-End):** Verificación del flujo de trabajo completo del usuario a través de la interfaz de usuario.
*   **Pruebas de Rendimiento:** Evaluación del comportamiento del sistema bajo carga y estrés.
*   **Pruebas de Seguridad:** Identificación de vulnerabilidades y aseguramiento de la protección de datos.
*   **Pruebas de Usabilidad/UX:** Evaluación de la facilidad de uso y la experiencia del usuario.
*   **Pruebas de Aceptación de Usuario (UAT):** Verificación por parte de los usuarios finales para asegurar que el sistema cumple con sus expectativas y necesidades de negocio.

## 3. Alcance de las Pruebas (Fase Piloto)

Durante la fase piloto, las pruebas se centrarán en los módulos y funcionalidades clave:

### 3.1. Módulo de Ingesta
*   **Funcionalidad:** Carga de PDFs desde diferentes fuentes (simuladas o reales).
*   **Casos de Prueba:**
    *   Carga exitosa de un PDF válido.
    *   Carga de múltiples PDFs simultáneamente.
    *   Manejo de archivos no PDF.
    *   Detección y manejo de PDFs duplicados.
    *   Manejo de archivos corruptos o de gran tamaño.

### 3.2. Módulo de Clasificación
*   **Funcionalidad:** Asignación de folio único y organización de estudios.
*   **Casos de Prueba:**
    *   Asignación correcta de folio único para un nuevo expediente.
    *   Agrupación correcta de estudios para el mismo paciente/empresa/orden.
    *   Manejo de PDFs sin metadatos claros para clasificación.

### 3.3. Módulo de Extracción y Normalización (IA/OCR)
*   **Funcionalidad:** Extracción de datos de PDFs y semaforización inicial.
*   **Casos de Prueba:**
    *   Extracción correcta de datos de PDFs de laboratorio con diferentes formatos.
    *   Extracción correcta de datos de PDFs de RX, Audiometría, Espirometría, ECG/Campimetría, Toxicológico.
    *   Verificación de la normalización de unidades y formatos.
    *   Evaluación de la precisión de la IA en la extracción (comparación con datos manuales).
    *   Manejo de PDFs escaneados (si aplica OCR).
    *   Identificación correcta de valores fuera de rango (semaforización).

### 3.4. Módulo de Validación Médica
*   **Funcionalidad:** Interfaz para la revisión y validación de datos por parte del médico.
*   **Casos de Prueba:**
    *   Acceso al panel de validación con diferentes roles de usuario.
    *   Visualización correcta de PDFs originales y datos extraídos.
    *   Edición y corrección de datos extraídos por la IA.
    *   Selección y confirmación del dictamen de aptitud.
    *   Adición de observaciones y recomendaciones.
    *   Firma electrónica del expediente.
    *   Verificación de la persistencia de los cambios realizados.

### 3.5. Módulo de Emisión
*   **Funcionalidad:** Generación de Papeletas y Reportes Completos.
*   **Casos de Prueba:**
    *   Generación correcta de Papeleta de Aptitud con datos validados.
    *   Generación correcta de Reporte Completo con todos los estudios y dictamen.
    *   Verificación de la inclusión del folio y QR en los documentos generados.
    *   Validación del formato y diseño de los PDFs generados.

### 3.6. Módulo de Entrega Segura
*   **Funcionalidad:** Distribución controlada de expedientes.
*   **Casos de Prueba:**
    *   Generación de enlace caducable para un expediente.
    *   Envío de correo electrónico con enlace seguro a destinatarios.
    *   Verificación del acceso al expediente a través del enlace (antes y después de caducidad).
    *   Registro correcto de accesos y descargas en la bitácora.

### 3.7. Módulo de Auditoría y Métricas
*   **Funcionalidad:** Trazabilidad y monitoreo.
*   **Casos de Prueba:**
    *   Registro correcto de eventos clave (ingesta, validación, emisión, entrega).
    *   Verificación de la integridad de los logs (sellos de tiempo, usuario).
    *   Visualización correcta de métricas en el dashboard (TAT, etc.).

## 4. Entorno de Pruebas

*   **Ambiente:** Un entorno de desarrollo/staging que replique lo más fielmente posible el entorno de producción (GCP).
*   **Datos de Prueba:** Se utilizarán un conjunto de PDFs de estudios clínicos reales (anonimizados) y sintéticos que cubran diferentes escenarios y variaciones de formato.
*   **Herramientas:**
    *   **Unitarias/Integración:** Jest (JavaScript), Pytest (Python).
    *   **End-to-End:** Cypress o Playwright para pruebas de UI.
    *   **Rendimiento:** JMeter o k6.
    *   **Seguridad:** Herramientas de escaneo de vulnerabilidades (SAST/DAST).

## 5. Criterios de Éxito

*   Todos los casos de prueba críticos pasan con éxito.
*   Los defectos encontrados son registrados, priorizados y resueltos.
*   El sistema cumple con los requisitos funcionales y no funcionales definidos.
*   El rendimiento del sistema está dentro de los umbrales aceptables.
*   No se encuentran vulnerabilidades de seguridad críticas.
*   Los usuarios finales validan la funcionalidad y usabilidad del sistema (UAT).

## 6. Roles y Responsabilidades

*   **Equipo de Desarrollo:** Responsable de las pruebas unitarias y de integración.
*   **QA/Tester:** Responsable de las pruebas funcionales, de rendimiento, seguridad y usabilidad.
*   **Médicos/Usuarios Clave:** Responsables de las pruebas de aceptación de usuario (UAT).
*   **Arquitecto/Líder Técnico:** Revisión y aprobación del plan de pruebas y resultados.

## 7. Próximos Pasos

*   Definición detallada de casos de prueba para cada funcionalidad.
*   Preparación del entorno y datos de prueba.
*   Ejecución de pruebas y seguimiento de defectos.
