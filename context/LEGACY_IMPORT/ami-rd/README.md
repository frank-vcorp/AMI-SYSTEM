# AMI / RD-AMI — Residente Digital con IA

Plataforma ocupacional que digitaliza la ingesta de estudios clínicos y genera expedientes con apoyo de IA, desplegada sobre el ecosistema de Google Cloud (Firebase, Cloud Run, Firestore, Cloud Storage y Document AI).

## Stack base (Google-first)
- **Frontend:** Next.js + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion (Firebase Hosting o Vercel).  
- **Backend:** Cloud Run / Cloud Functions (Node.js + Python) para ingesta, OCR, normalización y motor de reglas clínicas.  
- **Datos:** Firestore para metadatos, Cloud Storage para PDFs y BigQuery para analítica avanzada.  
- **Integraciones:** Document AI / `pdfminer`, SendGrid o Gmail API, Cloud Pub/Sub, Cloud Monitoring.  
- **Autenticación:** Firebase Auth con Custom Claims para roles (Médico, Calidad, Admin).  
- **Observabilidad:** Cloud Logging, Monitoring y Trace + dashboards en Looker Studio.

## Estructura del repositorio
- `context/` — Arquitectura, plan de ejecución, cronograma y dossier técnico.  
- `context/04_Documentacion_Sintetica/` — Visión, especificación funcional, diseño técnico, plan de pruebas y despliegue.  
- `context/Plan_Ejecucion_RD-AMI.md` — Detalle de tareas técnicas por fase.  
- `status-site/` — Sitio estático (HTML + Tailwind) publicado en cPanel para que AMI vea avances diarios.  
- `api/` — Espacio reservado para contratos/endpoints.  
- `meta/` — Plantillas de control, criterios de calidad y prompts de asistentes.  
- `scripts/` — Automatizaciones (bootstrap, ingest-docs).  
- `PROYECTO.md` — Fuente de verdad operativa (estados, backlog, próximos pasos).  
- `Checkpoints/` — Bitácora de hitos (añadir uno por entrega relevante).

## Flujo de trabajo recomendado
1. **Planeación:** Revisar `PROYECTO.md`, `context/Cronograma_Desarrollo_RD-AMI.md` y `context/Plan_Ejecucion_RD-AMI.md`.  
2. **Diseño y decisiones:** Registrar hallazgos/definiciones en `context/` (carpetas clínicas, técnicas y legales).  
3. **Implementación:** Atacar los módulos priorizados por fase, cumpliendo `meta/criterios_calidad.md`.  
4. **Documentación viva:** Actualizar los archivos de `context/04_Documentacion_Sintetica` cuando cambien alcance, arquitectura o QA.  
5. **Seguimiento:** Publicar el estado en `web/progress-dashboard` y compartirlo con Alan/AMI para transparencia.  
6. **Entrega:** Generar checkpoint en `Checkpoints/` y sostener revisión con el cliente.

## Documentación esencial
- `context/04_Documentacion_Sintetica/01_Vision_General_Proyecto.md` — Objetivos y alcance del piloto.  
- `context/04_Documentacion_Sintetica/02_Especificacion_Funcional.md` — Flujo funcional y módulos.  
- `context/04_Documentacion_Sintetica/03_Diseno_Tecnico_Inicial.md` — Arquitectura GCP/Firebase.  
- `context/04_Documentacion_Sintetica/04_Plan_Pruebas_Preliminar.md` — Estrategia QA por módulo.  
- `context/04_Documentacion_Sintetica/05_Estrategia_Despliegue.md` — DevOps y CI/CD.  
- `context/Cronograma_Desarrollo_RD-AMI.md` — Hitos y duración (17–24 semanas).  
- `context/Plan_Ejecucion_RD-AMI.md` — Tareas técnicas detalladas por fase.  
- `context/dossier_tecnico.md` — Decisiones, supuestos y riesgos.  
- `meta/prompts/*` — Guías para asistentes Aria/Inés.

## Herramientas y scripts
- `./scripts/bootstrap.sh CLIENTE PROYECTO --origin <url> --push` — Regenera estructura, remoto y checkpoint inicial.  
- `./scripts/ingest-docs.sh <output_dir> <archivos...>` — Convierte PDFs/DOCX/XLSX a texto para contextualizar a los asistentes.  
- `meta/checklists/*` — Verificaciones previas a cada entrega.  
- `web/progress-dashboard/README.md` — Pasos para configurar Firebase Hosting y exponer el tablero al cliente.

## Sitio ligero para AMI (status-site/)
- HTML + Tailwind (sin dependencias) pensado para alojarse en cPanel compartido.  
- Consume `status-site/data/status.json` (generado desde `PROYECTO.md`) y muestra avance por fase/módulo con un estilo limpio.  
- Despliegue automático mediante workflow `deploy-status-site.yml` (FTP/FTPS). Basta con exponer la carpeta pública vía cPanel y proporcionar credenciales en los secrets.

## Sincronización automática del tablero
- `PROYECTO.md` contiene la tabla `Tablero — Módulos fuente` (entre `progress-modules:start/end`); edita ahí los avances y porcentajes.  
- Ejecuta `./scripts/publish-status.sh` (envuelve `npm run sync:dashboard` y deja `status-site/data/status.json` listo en staging) antes de cada commit/push.  
- El workflow `.github/workflows/deploy-status-site.yml` corre en cada push a `main`, genera el dataset y publica `status-site/` en tu hosting compartido.

### Secrets necesarios para el deploy a cPanel
1. `CPANEL_HOST` — Host del FTP/FTPS (ej. `ftp.midominio.com`).  
2. `CPANEL_USERNAME` — Usuario del FTP.  
3. `CPANEL_PASSWORD` — Contraseña o token.  
4. `CPANEL_PORT` — Puerto (21 para FTP/FTPS, 990 si usas FTPS implícito).  
5. `CPANEL_TARGET_DIR` — Ruta remota (ej. `/public_html/rd-ami-status/`).  

> El workflow usa `SamKirkland/FTP-Deploy-Action`; habilita FTPS en tu hosting para mantener la transferencia cifrada.

## Requisitos locales
- Git 2.30+, Node.js LTS, pnpm/npm/yarn.  
- Acceso a proyecto Firebase/GCP con roles mínimamente necesarios (Storage Admin, Firestore Admin para staging).  
- Secreto `OPENAI_API_KEY` configurado si se usan los asistentes locales de Continue.

## Estado y próximos hitos
- Ver `PROYECTO.md` para backlog y estados.  
- Validar `context/Plan_Ejecucion_RD-AMI.md` con Alan, habilitar el tablero y arrancar la Fase 0 (MVS).  
- Cada hito debe cerrar con checkpoint en `Checkpoints/` y actualización del tablero público.

## Licencia
MIT — ver `LICENSE`.
