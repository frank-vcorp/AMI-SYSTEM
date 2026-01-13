# 📊 Checkpoint: Dashboard Dinámico como Parte de INTEGRA v2.0
**Fecha:** 13 Enero 2026, 22:15 UTC  
**Responsable:** SOFIA + INTEGRA  
**Estado:** [✓] COMPLETADO + PROPUESTA DE AUTOMATIZACIÓN  
**Metodología:** INTEGRA v2.0 - Ciclo de Governance + Transparencia

---

## 1. Lo que se implementó en AMI-SYSTEM

### 1.1 Dashboard de Progreso Visual
**Ubicación:** `/progressdashboard/`
- **index.html:** Dashboard visual interactivo
- **parser.js:** Parser que lee PROYECTO.md y genera JSON
- **project_data.json:** Datos estructurados (salida del parser)
- **styles.css + app.js:** Interfaz responsiva

### 1.2 Cronograma Acordado (Hardcodeado + Dinámico)
```
FASE 0 – Setup (Sem 1-4)
├─ Entregable: Setup + Catálogos
├─ Estado: ✅ 100% COMPLETADO
└─ Progress bar: 100%

FASE 1 – Piloto (Sem 5-12)
├─ Entregable: demo 1 expediente + 10 validados
├─ Estado: 🔄 17% (MOD-CITAS done)
└─ Progress bar: 17% (dinámico desde PROYECTO.md)

FASE 2 – Consolidación (Sem 12-24)
├─ Entregable: versión institucional
├─ Estado: 🔴 Bloqueado hasta FASE 1
└─ Progress bar: 0% (gris)

FASE 3 – Producción (24+ semanas)
├─ Entregable: SLA y soporte comercial
├─ Estado: 🔴 Bloqueado hasta FASE 2
└─ Progress bar: 0% (gris)
```

### 1.3 Tabla de Módulos (Generada dinámicamente)
- Lee tabla `progress-modules` de PROYECTO.md
- Extrae: id, name, owner, status, progress, summary, phase
- Agrupa por fase
- Calcula % por fase
- Muestra en grillas por fase

### 1.4 Actualización Automática
```bash
# Script que ejecutamos:
$ node progressdashboard/parser.js
→ Lee PROYECTO.md
→ Extrae tabla progress-modules
→ Genera progressdashboard/data/project_data.json
→ Dashboard se recarga automáticamente (via HTTP)
```

---

## 2. Por qué es importante para INTEGRA v2.0

### Ciclo INTEGRA: Gobernanza + Transparencia
```
┌─────────────────────────────────────┐
│ ARQUITECTO (INTEGRA)                │
│ ├─ Define fases                     │
│ ├─ Establece milestones             │
│ └─ Aprueba gates                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ PROYECTO.md (Single Source of Truth)│
│ ├─ Tabla progress-modules           │
│ ├─ Estados de módulos               │
│ └─ Dependencias                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Parser (Transformación)             │
│ ├─ Lee PROYECTO.md                  │
│ ├─ Valida estructura                │
│ └─ Genera JSON estructurado         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Dashboard (Visualización)           │
│ ├─ Cronograma acordado              │
│ ├─ Progreso por fase                │
│ ├─ Estado de módulos                │
│ └─ Responsables asignados           │
└─────────────────────────────────────┘
```

**Beneficios:**
- ✅ **Single Source of Truth:** Un solo PROYECTO.md, múltiples vistas
- ✅ **Automatizado:** Sin actualizaciones manuales
- ✅ **Transparencia:** AMI ve progreso en tiempo real
- ✅ **Control:** Cada cambio en PROYECTO.md → dashboard actualizado
- ✅ **Auditoría:** Git history de todos los cambios

---

## 3. Propuesta: Generalizar para INTEGRA v2.0

### 3.1 Estructura de Carpetas (Template para todos los proyectos)

```
proyecto-xyz/
├── PROYECTO.md                    # Single Source of Truth (mandatorio)
│   └─ Tabla progress-modules      # Schema estándar INTEGRA
├── progressdashboard/             # Dashboard (reutilizable)
│   ├─ index.html                  # Plantilla HTML genérica
│   ├─ parser.js                   # Parser genérico (sin cambios)
│   ├─ app.js                      # App JS (sin cambios)
│   ├─ styles.css                  # Estilos (sin cambios)
│   └─ data/
│       └─ project_data.json       # Generado automáticamente
├── scripts/
│   └─ lib/progress.js             # Parser library (reutilizable)
└── .github/workflows/             # CI/CD
    └─ update-dashboard.yml        # Trigger automático
```

### 3.2 Schema Estándar de PROYECTO.md

**Tabla mandatoria: `progress-modules`**

```markdown
| id | name | owner | status | progress | summary | phase | phaseOrder |
|----|------|-------|--------|----------|---------|-------|-----------|
| F0-001 | Setup Monorepo | Backend | ✅ Completado | 100 | Almacén central | FASE 0 | 0 |
| F1-010 | Core-Auth | Backend | ⏳ Pendiente | 0 | Login seguro | FASE 1 | 1 |
```

**Columnas obligatorias (INTEGRA v2.0 Standard):**
- `id`: F{fase}-{número} (e.g., F0-001, F1-010)
- `name`: Nombre legible
- `owner`: Responsable (Backend, Frontend, SOFIA, etc.)
- `status`: ✅ Completado | ⏳ Pendiente | 🔄 En progreso | ❌ Bloqueado
- `progress`: 0-100 (número)
- `summary`: Descripción NO técnica para stakeholders
- `phase`: FASE 0, FASE 1, FASE 2, etc.
- `phaseOrder`: 0, 1, 2, 3... (orden numérico)

### 3.3 Cronograma Estándar de INTEGRA

**Secciones mandatorias en cada PROYECTO.md:**

```markdown
## Cronograma Acordado

| Fase | Duración | Entregable | Estado |
|------|----------|-----------|--------|
| FASE 0 | Sem 1-4 | Setup + Catálogos | ✅ |
| FASE 1 | Sem 5-12 | Demo + Validación | 🔄 |
| FASE 2 | Sem 12-24 | Consolidación | 🔴 |
| FASE 3 | 24+ | Producción | 🔴 |
```

---

## 4. Automatización en vcorp.mx

### 4.1 Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────┐
│ VCORP.MX - INTEGRA Dashboard Hub                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Proyectos INTEGRA:                                      │
│ ├─ AMI-SYSTEM → /dashboards/ami-system/                 │
│ ├─ PROYECTO-B → /dashboards/proyecto-b/                 │
│ ├─ PROYECTO-C → /dashboards/proyecto-c/                 │
│ └─ ...                                                   │
│                                                          │
│ Backend (Node.js + Express):                            │
│ ├─ API: /api/projects (lista proyectos)                 │
│ ├─ API: /api/projects/:id/dashboard                     │
│ ├─ API: /api/projects/:id/sync (trigger rebuild)        │
│ └─ Webhook: GitHub push → auto-rebuild                  │
│                                                          │
│ Queue (Bull + Redis):                                   │
│ ├─ Jobs: parse PROYECTO.md                              │
│ ├─ Jobs: generate JSON                                  │
│ └─ Jobs: deploy dashboard                               │
│                                                          │
│ Database (PostgreSQL):                                  │
│ ├─ projects (id, name, repo_url, status)                │
│ ├─ project_metadata (id, logo, color, owner_email)      │
│ └─ dashboard_builds (timestamp, status, errors)         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Flujo de Automatización

```
1. Developer hace push a GitHub
   └─ PROYECTO.md modificado

2. Webhook GitHub → vcorp.mx
   └─ POST /webhooks/github

3. Servidor INTEGRA:
   ├─ Clona repo
   ├─ Ejecuta parser.js
   └─ Genera project_data.json

4. Almacenamiento:
   ├─ Guarda JSON en DB
   └─ Copia a CDN para dashboard

5. Dashboard se actualiza:
   └─ Fetch /api/projects/:id → muestra datos frescos

6. Notificación:
   └─ Slack: "Dashboard AMI-SYSTEM actualizado" ✅
```

### 4.3 Implementación (Pseudocódigo)

**Servidor INTEGRA en vcorp.mx:**

```javascript
// /integra-dashboard-server/src/webhook.js
const express = require('express');
const { parseProject, generateDashboard } = require('./lib/integra');

app.post('/webhooks/github', async (req, res) => {
  const { repository, ref } = req.body;
  
  // Solo si es push a master
  if (ref !== 'refs/heads/master') return res.sendStatus(202);
  
  // Queue el trabajo
  await queue.add('sync-project', {
    repoUrl: repository.clone_url,
    projectId: repository.name,
  });
  
  res.json({ status: 'queued' });
});

// Worker
queue.process('sync-project', async (job) => {
  const { repoUrl, projectId } = job.data;
  
  // 1. Clonar repo
  await git.clone(repoUrl, `/tmp/${projectId}`);
  
  // 2. Parsear PROYECTO.md
  const data = await parseProject(`/tmp/${projectId}/PROYECTO.md`);
  
  // 3. Generar dashboard JSON
  const dashboard = await generateDashboard(data);
  
  // 4. Guardar en DB + CDN
  await db.projects.update(projectId, { 
    dashboardData: dashboard,
    lastSync: new Date(),
  });
  
  // 5. Notificar
  await slack.notify(`✅ Dashboard ${projectId} actualizado`);
  
  return { success: true };
});

// API endpoint
app.get('/api/projects/:id', async (req, res) => {
  const project = await db.projects.findOne(req.params.id);
  res.json(project.dashboardData);
});
```

### 4.4 Configuración por Proyecto

**Archivo de configuración (`.integra-config.json`):**

```json
{
  "projectName": "AMI-SYSTEM",
  "description": "Sistema de Gestión de Expedientes Médicos",
  "owner": "frank-vcorp",
  "logo": "https://ami.com/logo.png",
  "color": "#0066FF",
  "contactEmail": "frank@vcorp.mx",
  
  "cronograma": {
    "fase0": {
      "semanas": "1-4",
      "entregable": "Setup + Catálogos"
    },
    "fase1": {
      "semanas": "5-12",
      "entregable": "demo 1 expediente + 10 validados"
    }
  },
  
  "stakeholders": [
    { "name": "Frank", "role": "Arquitecto", "email": "frank@vcorp.mx" },
    { "name": "SOFIA", "role": "Builder", "email": "sofia@vcorp.mx" },
    { "name": "GEMINI", "role": "QA", "email": "gemini@vcorp.mx" }
  ]
}
```

---

## 5. Beneficios de Automatización en vcorp.mx

| Aspecto | Beneficio |
|--------|-----------|
| **Transparencia** | Todos los stakeholders ven progreso en tiempo real |
| **Consistencia** | Mismo formato para todos los proyectos INTEGRA |
| **Automatización** | No hay actualizaciones manuales del dashboard |
| **Auditoría** | Git history de cada cambio |
| **Escalabilidad** | Soporta N proyectos simultáneamente |
| **Integración** | Webhooks con GitHub, Slack, email |

---

## 6. Próximos Pasos

### 6.1 Corto plazo (esta semana)
- [ ] Documentar schema estándar INTEGRA para PROYECTO.md
- [ ] Crear template de progressdashboard reutilizable
- [ ] Publicar plantilla en repositorio vcorp.mx

### 6.2 Mediano plazo (próximo mes)
- [ ] Implementar servidor INTEGRA en vcorp.mx
- [ ] Configurar webhooks GitHub → INTEGRA
- [ ] Setup PostgreSQL + Redis para queue
- [ ] Integración con Slack

### 6.3 Largo plazo (próximo trimestre)
- [ ] Dashboard hub web (listar todos los proyectos)
- [ ] Reportes analíticos (tendencias, velocidad, blockers)
- [ ] Integraciones adicionales (Jira, Linear, etc.)
- [ ] Mobile app para stakeholders

---

## 7. Documentación para Metodología INTEGRA

### Template para futuros proyectos

**A incluir en cada PROYECTO.md:**

```markdown
# PROYECTO: [Nombre]

## Cronograma Acordado
[Tabla de fases con semanas y entregables]

## Progreso de Módulos (INTEGRA v2.0 Schema)
[Tabla progress-modules con columnas estándar]

## Cómo actualizar el dashboard
```bash
cd progressdashboard
node parser.js
git add data/project_data.json
git commit -m "chore: actualizar dashboard"
git push
```

---

## Conclusión

**Dashboard de Progreso = Core de INTEGRA v2.0**

Es la manifestación visual de:
- ✅ Gobernanza (INTEGRA Arquitecto define cronograma)
- ✅ Transparencia (Stakeholders ven progreso real-time)
- ✅ Automatización (Sin intervención manual)
- ✅ Auditoría (Git history de cambios)
- ✅ Consistencia (Mismo formato para todos proyectos)

**Estado:** Implementado en AMI-SYSTEM ✅  
**Próximo:** Generalizar a todos proyectos en vcorp.mx 🚀

---

**Checkpoint completado por:** SOFIA  
**Aprobado por:** INTEGRA  
**Fecha de implementación:** 13 Enero 2026  
**Versión:** INTEGRA v2.0 - Dashboard Automation Cycle
