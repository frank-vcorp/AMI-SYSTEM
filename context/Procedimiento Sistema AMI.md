# **🧬 ARTEFACTO DE INTELIGENCIA: DOC-20260111-04**

Proyecto: Optimización Sistema de Información Médica AMI  
Oficial de Logística: Copilot Project (Refinería de Datos)  
Estado: Refinado / Listo para Implementación

## **1\. 📊 MATRIZ OPERATIVA (PROCESOS Y TIEMPOS)**

Definición de tiempos estándar para el cálculo de capacidad instalada y flujo de pacientes.

| Proceso | Tiempo (min) | Personal Responsable | Observaciones |
| :---- | :---- | :---- | :---- |
| Registro / Recepción | 2 \- 5 | Recepción | Inicio de trazabilidad. |
| Somatometría y Signos | 10 \- 15 | Enfermería | Datos base para cálculos. |
| Examen Médico | 25 \- 30 | Médico | Centro del proceso clínico. |
| Audiometría | 15 | Técnico / Personal | Requiere modo offline. |
| Espirometría | 15 | Técnico / Personal | Requiere modo offline. |
| Rayos X | 10 \- 15 | Radiólogo | \- |
| Laboratorio | 10 | Flebotomista | Evitar captura manual. |
| Electrocardiograma | 15 | Personal | \- |
| Campimetría | 10 | Personal | \- |
| Certificado Médico | 25 \- 30 | Médico | Firma y cierre. |

## **2\. 🆔 LÓGICA DE IDENTIDAD Y TRAZABILIDAD**

### **Estructura del RFC Interno (ID Único)**

Para garantizar un identificador único por paciente independientemente de la Unidad de Negocio (UEN), el sistema debe generar el ID siguiendo este patrón:

\[DATOS\_PERSONALES\] \+ \[FECHA\_NACIMIENTO\] \+ \[HOMOCLAVE\_INTERNA\]

**Componentes de la Homoclave:**

1. **Sexo:** (M/F)  
2. **Entidad:** (AMI / Soluciones)  
3. **Tipo:** (Clínicas / Multicliente)

## **3\. ⚙️ REGLAS DE NEGOCIO Y AUTOMATIZACIÓN (Logic Engine)**

### **A. Motor de Cálculo Clínico**

El sistema debe realizar cálculos en tiempo real tras la captura de signos vitales:

1. **Índice de Masa Corporal (IMC):**  
   * **Fórmula:** $Peso / Talla^2$  
   * **Clasificaciones Automáticas:**  
     * \< 18.5: Bajo peso  
     * 18.5 \- 24.9: Normal  
     * 25.0 \- 29.9: Sobrepeso  
     * 30.0 \- 34.9: Obesidad Grado 1  
     * 35.0 \- 39.9: Obesidad Grado 2  
     * 40.0 \- 49.9: Obesidad Grado 3  
     * \> 50.0: Obesidad Grado 4  
2. **Tensión Arterial (TA):**  
   * **Baja:** \< 80/50  
   * **Normal:** 120/80  
   * **Normal-Alta:** 120-129 / \<80  
   * **Hipertensión G1:** 130-139 / 80-89  
   * **Hipertensión G2:** \>140 / \>90

### **B. Lógica de Prellenado (Eficiencia Médica)**

Campos que deben aparecer con valores por defecto (editables):

* **Reflejos:** "Presentes y normoreflecticos".  
* **Exploración Física:** Textos base predefinidos.  
* **Interrogatorio:** Los datos patológicos detectados deben migrar automáticamente a la "Impresión Diagnóstica".

## **4\. 🛠 REQUERIMIENTOS DE SISTEMA (Backlog Técnico)**

### **Gestión de Clientes y Perfiles**

* **Integración Contpaq:** Eliminar la migración manual actual. El sistema debe enviar el número de cliente y datos fiscales automáticamente.  
* **Campos Flexibles:** Los campos de correo deben permitir múltiples destinatarios separados por ;.  
* **Nomenclatura de Perfil:** Nombre Comercial // UEN // NODO // Sexo // Puesto // Condición Especial.

### **Módulo de Notificaciones y SLAs**

* **Alertas de Envío:** Si un estudio excede el tiempo de entrega (24h, 3 días o 10 días), disparar notificación al responsable.  
* **Confirmación de Citas:** Generar pase digital automático con dirección y botón de confirmación vía WhatsApp.

### **Funcionalidades Especiales**

* **Modo Offline:** Vital para cuestionarios de Audiometría y Espirometría en sitios sin conexión.  
* **Previsualización:** Botón para revisar el PDF concentrado de resultados antes del envío final al cliente.

## **📝 NOTAS DE IMPLEMENTACIÓN (Para ARCH/IMPL)**

1. **Prioridad:** El cálculo automático de diagnósticos y el ID único son de carácter crítico para evitar errores humanos.  
2. **UX:** Se sugiere búsqueda de pruebas segmentada (Generales vs Laboratorio) debido a la extensión del catálogo.  
3. **Escalabilidad:** Diseñar la base de datos para que la UEN dependa del registro y no solo del login del usuario.