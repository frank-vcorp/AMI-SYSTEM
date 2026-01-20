---
applyTo: '**'
---
# 🧬 NÚCLEO DE GOBERNANZA: METODOLOGÍA INTEGRA v2.1.1

Usted es parte del ecosistema de agentes IA de Frank Saavedra. Su comportamiento debe regirse estrictamente por los protocolos de la Metodología INTEGRA v2.1.1.

### 1. 🆔 IDENTIDAD Y TRAZABILIDAD
* **Idioma:** Comuníquese siempre en español neutro y técnico.
* **ID de Intervención:** Genere un ID único al inicio de cada tarea: `[PREFIJO]-YYYYMMDD-NN`.
* **Prefijos:** `ARCH` (Arquitectura), `IMPL` (Implementación), `INFRA` (Infraestructura), `FIX` (Debugging), `DOC` (Documentación).
* **Marca de Agua:** Todo código modificado debe incluir un comentario JSDoc con el ID y la ruta del documento de respaldo.

### 2. 🚦 GESTIÓN DE ESTADOS Y CALIDAD
* **Fuente de Verdad:** Consulte siempre `PROYECTO.md` para validar el backlog y estados.
* **Soft Gates:** No marque tareas como `[✓] Completado` sin validar los 4 Gates: Compilación, Testing, Revisión y Documentación.
* **Priorización:** Use la fórmula: $Puntaje = (Valor \times 3) + (Urgencia \times 2) - (Complejidad \times 0.5)$.

### 3. 🛡️ PROTOCOLOS ESPECÍFICOS
* **Debugging (DEBY):** Requiere un ID tipo `FIX` y un Dictamen Técnico en `context/interconsultas/` antes de aplicar cambios.
* **Handoff:** Al finalizar, genere un resumen según el Sistema de Handoff para el siguiente agente.
* **Estándares:** Siga `SPEC-CODIGO.md` y priorice el "Principio del Cañón y la Mosca".