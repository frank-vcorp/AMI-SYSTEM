# **📊 EXTRACCIÓN DE DATOS: EXAMEN MÉDICO MOD (Excel)**

ID de Referencia: DATA-20260111-06  
Fuente: EXAMEN MEDICO MOD.xlsx (Hojas: EMI, R, Validación)

## **1\. 📑 ESTRUCTURA DE EXPLORACIÓN FÍSICA (Hoja: EMI)**

Esta sección contiene los campos de la exploración física y los valores que el sistema debe cargar por defecto para agilizar la captura.

| Sección | Hallazgo / Valor por Defecto (Editable) |
| :---- | :---- |
| **Neurológico** | Alerta, orientado en tiempo, lugar y persona. Lenguaje y marcha normal. |
| **Cabeza** | Normocéfalo, con adecuada implantación de cabello. |
| **Piel y Faneras** | Sin datos de palidez, cianosis, sin tatuajes, sin perforaciones. |
| **Oídos (C.A.D / C.A.I)** | Permeable, MT integra, cono luminoso. |
| **Ojos** | Pupilas isocóricas, normorreflexicas, fondo de ojo sin datos patológicos, sin estrabismo o nistagmus, sin pterigion. |
| **Boca** | Sin datos de caries y sarro. Centrada, dentadura completa. |
| **Nariz** | Simétrica, septum alineado, sin datos patológicos. |
| **Faringe** | Sin datos patológicos. |
| **Cuello** | Cilíndrico, tráquea central, sin presencia de masas, no se palpan adenomegalias. |
| **Tórax** | Mesomórfico, movimientos de amplexión y amplexación normales, sin deformidades. |
| **Corazón** | Precordio sin datos de soplos o ruidos agregados, ruidos cardiacos rítmicos. |
| **Campos Pulmonares** | Con adecuada entrada y salida de aire, sin ruidos agregados. |
| **Abdomen** | Globoso, blando, depresible, peristalsis presente, no se palpan visceromegalias, sin abultamientos/hernias. |
| **Genitourinario** | Giordano Negativo. |
| **Columna Vertebral** | Alineada, sin xifosis o lordosis anormales. Sin datos de radiculopatías. |
| **Test de Adam** | Negativo. |
| **Ms Superiores** | Íntegros, sensibilidad conservada, sin datos de artrosis, sin radiculopatías, arcos de movilidad normal. |
| **Ms Inferiores** | Íntegros, sensibilidad conservada, sin radiculopatías, ROTs presentes y normales, pulsos presentes. |
| **Fuerza (Daniels)** | 5 de 5\. |
| **Circulación Venosa** | Sin varices. |
| **Arco de Movilidad** | Presentes, normales. |

## **2\. 🗄️ CATÁLOGOS DE VALIDACIÓN (Hoja: Validación de datos)**

Opciones disponibles para los campos de selección (dropdowns).

### **A. Datos Generales y Antecedentes**

* **Sexo:** FEMENINO, MASCULINO.  
* **Estado Civil:** SOLTERO(A), CASADO(A), UNION LIBRE, DIVORCIADO(A), VIUDO(A).  
* **Escolaridad:** SIN ESTUDIOS, PRIMARIA, SECUNDARIA, PREPARATORIA, TECNICA, LICENCIATURA, POSGRADO.  
* **Accidentes / Heredo-familiares:** SI, NO, NEGADOS, MADRE, PADRE, HERMANOS, ABUELOS.  
* **Hábitos (Frecuencia):** N/A, DIARIO, SEMANAL, QUINCENAL, MENSUAL, OCASIONAL.  
* **Alimentación:** MALA, REGULAR, BUENA.  
* **Grupo y RH:** A+, A-, B+, B-, O+, O-, AB+, AB-.

### **B. Mediciones Clínicas**

* **Visión Lejana (Escala 20/X):** 20/20, 20/25, 20/30, 20/40, 20/50, 20/70, 20/100, 20/200.  
* **Visión Cercana (Jaeger):** 0.5, 0.75, 1, 1.25, 1.5, 1.75.  
* **Tensión Arterial (TA):** Baja, Normal, Normal Alta, Hipertensión grado 1, Hipertensión grado 2\.  
* **Salud Dental:** Caries, Sarro, Caries y Sarro, Negativo.

### **C. Ginecología (Condicional)**

* **Quiste / Gesta:** POSITIVO, NEGATIVO, N/A.  
* **Vida Sexual:** NUBIL, ACTIVA, NO ACTIVA.  
* **Método Planificación (MPF):** NINGUNO, PRESERVATIVO, HORMONAL, DIU, OTRO.

### **D. Otros**

* **Circulación:** Sin varices, Telangiectasias incipientes, Varices grado I-IV.  
* **Nacionalidad:** MEXICANA, OTRA.

## **3\. 📝 SECCIÓN DE RESULTADOS (Hoja: R)**

Campos finales de cierre del examen médico:

* **Impresión Diagnóstica:** (Campo de texto abierto / Basado en hallazgos).  
* **Recomendaciones:** (Campo de texto abierto / Editable).