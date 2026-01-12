# Criterios de Calidad (End-to-end)

Use esta checklist para asegurar calidad transversal en todo el desarrollo (arquitectura, backend, frontend, mobile, datos, CI/CD, seguridad y AI).

## Arquitectura y diseño
- [ ] Separación de responsabilidades (dominio / aplicación / infraestructura)
- [ ] Modularidad y principios SOLID; dependencias explícitas
- [ ] Configuración por entorno (12-factor); .env no se commitea
- [ ] Contratos claros entre capas (interfaces/puertos)
- [ ] Decisiones registradas en context/ (ADRs/decisiones técnicas)

## Código y mantenibilidad
- [ ] Tipado fuerte (TypeScript u otro) en superficies públicas
- [ ] Linter y formateo consistentes (ESLint/Prettier/EditorConfig)
- [ ] Revisiones de código (PRs) con criterios mínimos aceptados
- [ ] Documentación mínima por módulo (README/Docstrings)

## Pruebas y cobertura
- [ ] Unitarias para lógica crítica (target >= 70% líneas/módulo crítico)
- [ ] Integración/contract tests para adaptadores externos
- [ ] E2E en flujos core (cuando aplique)
- [ ] Datos de prueba realistas y no sensibles

## Seguridad
- [ ] Gestión de secretos vía variables de entorno/secret stores (nunca en repo)
- [ ] Dependabot o escaneo de vulnerabilidades de dependencias
- [ ] Autenticación/Autorización con principio de menor privilegio
- [ ] Validación y saneamiento de inputs (OWASP Top 10)
- [ ] Cabeceras y políticas (CSP, HSTS, X-Content-Type, SameSite cookies)
- [ ] Logs sin datos sensibles (PII/secretos)

## Rendimiento y confiabilidad
- [ ] Presupuestos de rendimiento (TTFB/LCP en web; arranque en mobile)
- [ ] Caching, paginación y lazy loading donde aplique
- [ ] Timeouts, reintentos e idempotencia en clientes HTTP/colas
- [ ] Escalabilidad básica considerada (stateless, horizontabilidad)

## Observabilidad
- [ ] Logging estructurado con niveles
- [ ] Métricas clave (negocio y técnicas)
- [ ] Trazas distribuidas si hay múltiples servicios
- [ ] Dashboards y alertas mínimas configuradas

## API (si aplica)
- [ ] Especificación OpenAPI/contrato de API versionado
- [ ] Modelo de errores consistente (códigos, mensajes, correlación)
- [ ] Rate limiting/burst control y protección contra abuso
- [ ] Compatibilidad hacia atrás en cambios (versionado/flags)

## Datos y cumplimiento
- [ ] Migraciones versionadas (DB) y backups probados
- [ ] Clasificación de datos (PII, sensibles) y tratamiento adecuado
- [ ] Cumplimiento (GDPR/privacidad) cuando aplique

## Frontend Web (UI/UX)
- [ ] Stack recomendado: Next.js + TypeScript + Tailwind CSS + shadcn/ui (Radix UI) + Framer Motion
- [ ] Accesibilidad: WCAG 2.1 AA, navegación por teclado, roles ARIA, contraste
- [ ] Responsive (móvil/desktop), dark/light mode y tokens de diseño
- [ ] Estados de carga/skeletons y manejo de errores visibles
- [ ] Gestión de estado y fetching (p. ej., TanStack Query) con caché/coherencia

## Mobile (si aplica)
- [ ] Stack recomendado: Expo (React Native) + NativeWind
- [ ] Manejo de conectividad, reintentos y estados offline (cuando aplique)
- [ ] Permisos y políticas de stores respetadas (Android/iOS)

## DevOps / CI-CD
- [ ] Ramas protegidas y revisiones requeridas
- [ ] Pipelines: lint + test + build al menos en PR/main
- [ ] Generación de artefactos (releases) y changelog/notas
- [ ] Reproducibilidad del build y pins de versiones clave

## Documentación
- [ ] README con “Primeros pasos” y decisiones clave
- [ ] Dossier técnico actualizado (context/dossier_tecnico.md)
- [ ] Runbooks básicos (arranque local, troubleshooting)

## AI/Asistentes (Aria/Inés)
- [ ] Prompts/outputs relevantes versionados o referenciados
- [ ] Sin exposición de secretos en contenidos o logs
- [ ] Revisión humana de artefactos críticos generados por AI

Cómo usar
- Revise esta lista en cada PR importante y antes de releases.
- Marque explícitamente lo cumplido y registre desviaciones con justificación.
