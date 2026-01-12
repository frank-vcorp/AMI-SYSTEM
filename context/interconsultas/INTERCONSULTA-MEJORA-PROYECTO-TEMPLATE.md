# INTERCONSULTA: Mejora de PROYECTO-template.md en Metodología INTEGRA

**ID:** INTERCONSULTA-20260112-01  
**Fecha:** 2026-01-12  
**Autor:** INTEGRA (desde proyecto AMI-SYSTEM)  
**Destino:** Repositorio `metodologia-integra` (plantilla oficial)  
**Estado:** Pendiente de aplicar

---

## Contexto

Durante la documentación del proyecto AMI-SYSTEM, se identificaron mejoras para la plantilla `PROYECTO-template.md` de la Metodología INTEGRA:

1. **Falta sección de cronograma por fases** - crítica para vincular entregables con tiempos
2. **Campo `owner` usaba agentes en lugar de departamentos** - mejor usar departamentos para consistencia

El proyecto legacy `ami-rd` tenía esta estructura que resultó muy útil para:
1. Visualizar el cronograma por fases con semanas
2. Vincular entregables con hitos de pago (documentados aparte)
3. Alimentar el progress dashboard con contexto de tiempo
4. Asignar responsabilidades por departamento (no por agente)

---

## Cambios Propuestos

### 1. Agregar sección de Cronograma por Fases

Agregar a `templates/PROYECTO-template.md` la sección **"Entregables Clave por Fase (Cronograma)"** ANTES de la tabla de módulos del dashboard:

```markdown
## Entregables Clave por Fase (Cronograma)

| Fase | Semanas | Objetivo | Entregables de salida | Estado |
|------|---------|----------|----------------------|--------|
| FASE 0 – [Nombre] | Sem X-Y | [Objetivo principal] | [Lista de entregables] | Planeado |
| FASE 1 – [Nombre] | Sem X-Y | [Objetivo principal] | [Lista de entregables] | Planeado |
| FASE N – [Nombre] | Sem X-Y | [Objetivo principal] | [Lista de entregables] | Planeado |

> **Nota:** El cronograma está alineado con los hitos de pago acordados. Cualquier cambio se documentará aquí.
```

### 2. Usar Departamentos en lugar de Agentes para `owner`

En la tabla de módulos, el campo `owner` debe usar **departamentos** en lugar de nombres de agentes:

- `Frontend` - UI, componentes, PWA
- `Backend` - APIs, auth, database, storage
- `Frontend · Backend` - Módulos completos con UI y API
- `Backend · Data` - Procesamiento, IA, ETL
- `Data` - Analytics, métricas, calidad
- `DevOps` - Infraestructura, CI/CD, monitoreo
- `Arquitectura` - Diseño, documentación, ADRs
- `Operaciones` - Procesos, capacitación, soporte

### 3. Agregar marcadores de dashboard con instrucciones

```markdown
## Tablero — Módulos (Progress Dashboard)

Este listado alimenta el progress dashboard y debe mantenerse actualizado.  
Usa los campos `status` (`pending|progress|blocked|done`) y `progress` (0-100).  
En `owner` usa departamentos: `Frontend`, `Backend`, `Frontend · Backend`, `Backend · Data`, `Data`, `DevOps`, `Arquitectura`, `Operaciones`.

<!-- progress-modules:start -->
| id | name | phase | phaseOrder | owner | status | progress | summary | needs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| modulo-ejemplo | Módulo Ejemplo | FASE 0 – [Nombre] | 0 | Frontend · Backend | pending | 0 | Descripción (Sem X-Y) | Dependencias |
<!-- progress-modules:end -->
```

---

## Beneficios

1. **Trazabilidad financiera**: Vincula trabajo técnico con pagos
2. **Visibilidad para el cliente**: Tabla clara de entregables por hito
3. **Compatibilidad dashboard**: Marcadores `<!-- progress-modules -->` ya incluidos
4. **Estimaciones de tiempo**: Columna `Semanas` da contexto temporal
5. **Consistencia**: Todos los proyectos INTEGRA tendrán esta estructura

---

## Acción Requerida

1. Actualizar `templates/PROYECTO-template.md` en el repo oficial de metodología INTEGRA
2. Documentar en el README de la metodología el propósito de cada sección
3. Considerar agregar al `scripts/generate-dashboard.js` la lectura de la tabla de fases

---

## Ya Aplicado en AMI-SYSTEM

Este cambio ya fue aplicado localmente en:
- `/workspaces/AMI-SYSTEM/templates/PROYECTO-template.md`
- `/workspaces/AMI-SYSTEM/PROYECTO.md`

Puede usarse como referencia para el merge al repo oficial.

---

## ANEXO: Progress Dashboard - Lecciones Aprendidas (2026-01-12)

### Arquitectura del Dashboard

El progress dashboard es un **sitio estático** que:
1. Lee `PROYECTO.md` con un parser Node.js (`progressdashboard/parser.js`)
2. Genera `progressdashboard/data/project_data.json`
3. El frontend (`app.js`) hace fetch del JSON y renderiza

### Deployment: Webhook Plesk vs FTP

**❌ FTP desde GitHub Actions NO funciona bien:**
- Timeout en conexiones de datos (modo pasivo)
- Firewalls de hosting bloquean IPs de GitHub
- La action `SamKirkland/FTP-Deploy-Action` falla frecuentemente

**✅ Webhook de Plesk SÍ funciona:**
- Plesk detecta push en GitHub y hace `git pull` automático
- Configuración: Git > Repositories > Remote Repository
- El workflow de GitHub Actions solo genera y hace commit del JSON
- Plesk sincroniza automáticamente

### Configuración Recomendada

**GitHub Actions (`.github/workflows/deploy-progress-dashboard.yml`):**
```yaml
name: Deploy Progress Dashboard
on:
  push:
    branches: [master, main]
    paths: ['PROYECTO.md', 'progressdashboard/**']
  workflow_dispatch:

jobs:
  update-data:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: node progressdashboard/parser.js
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore(dashboard): Auto-update progress data'
          file_pattern: 'progressdashboard/data/project_data.json'
```

**Plesk:**
- URL: `https://github.com/{org}/{repo}`
- Branch: `master` o `main`
- Deployment mode: `Automatic`
- Server path: `/httpdocs/{ruta-al-dashboard}`

### Cache-Buster para el JSON

El navegador cachea el JSON. Para evitar que el cliente vea datos viejos:

```javascript
// app.js
const cacheBuster = new Date().getTime();
fetch(`data/project_data.json?v=${cacheBuster}`)
```

Esto agrega un query param único en cada carga, forzando al navegador a pedir el archivo fresco.

### Checklist para Nuevos Proyectos

- [ ] Crear `progressdashboard/` con parser.js, app.js, index.html, styles.css
- [ ] Agregar marcadores `<!-- progress-modules:start/end -->` a PROYECTO.md
- [ ] Configurar workflow de GitHub Actions (solo commit, sin FTP)
- [ ] Configurar webhook de Plesk apuntando al repo correcto
- [ ] Agregar cache-buster al fetch del JSON
- [ ] Verificar que el JSON se genera correctamente con `node progressdashboard/parser.js`

---

**🏗️ ARCH REFERENCE:** INTERCONSULTA-20260112-01  
**🤖 AUTHOR:** INTEGRA (Arquitecto IA)
