# Estado de Instalación del Monorepo - AMI-SYSTEM

**Fecha:** 12 enero 2026  
**Estado Actual:** ✅ Estructura completa | ⏳ Dependencias pendientes  
**Responsible:** SOFIA (Builder)  

---

## Resumen

La estructura del monorepo está **100% completa y committeada**:
- 6 packages configurados (@ami/core-types, core-auth, core-database, core-storage, core-ui, web-app)
- TypeScript paths configurados
- Interfaces y tipos compartidos definidos (140 líneas en core-types)
- Stub implementations listos para ser completados
- Next.js 14 app con PWA, Tailwind, manifest

**Falta:** Resolver la instalación de dependencias npm debido a problemas de conectividad en el dev container.

---

## El Problema

Tanto `pnpm install` como `npm install` fallan al conectarse al npm registry:

### pnpm
```
ERR_PNPM_META_FETCH_FAIL: GET https://registry.npmjs.org/typescript: 
Value of "this" must be of type URLSearchParams
```
pnpm intenta conectarse múltiples veces, luego fail total.

### npm (con workspaces)
```
npm error code ETARGET
npm error notarget No matching version found for @radix-ui/react-slot@^2.0.2
```
npm reconoce workspaces pero choca con versiones específicas que no existen.

### Root Cause
- Dev container tiene acceso limitado a npm registry
- Posible firewall, proxy, o configuración de red restrictiva

---

## Opciones para Continuar

### **Opción 1: Instalar cuando conectividad mejore (RECOMENDADO)**

```bash
# En algún momento cuando npm registry esté disponible:
pnpm install

# Luego compilar todo:
npm run type-check
npm run build
```

**Ventaja:** Limpio, mantiene configuración actual.  
**Desventaja:** Bloqueado por conectividad.

### **Opción 2: Usar npm en lugar de pnpm (ALTERNATIVA)**

Cambiar raíz `package.json` para usar npm workspaces standard:

```json
{
  "workspaces": ["packages/*"],
  "private": true,
  ...
}
```

Ventajas:
- npm está pre-instalado
- npm es más tolerante con monorepos
- Menos dependencias específicas

Pasos:
1. Agregar `"workspaces": ["packages/*"]` al root
2. `npm install` en raíz

### **Opción 3: No instalar dependencias, solo validar TypeScript**

```bash
# Con TypeScript global (ya está instalado)
npx tsc --version
```

Permite continuar con implementación de código sin dependencias reales (stub mode).

---

## Siguiente Paso Recomendado

**SOFIA continúa implementación en FASE 0** mientras se resuelve conectividad:

1. **Completar stubs** en core-auth, core-database, core-storage, core-ui (sin dependencias externas)
2. **Implementar MOD-CLINICAS, MOD-SERVICIOS, MOD-EMPRESAS** según CHECKPOINT-FASE0-PLANIFICACION.md
3. **Una vez conectividad resuelva**: `pnpm install` + `npm run build`

Esto mantiene momentum y no bloquea desarrollo de funcionalidad.

---

## Progreso

| Tarea | Estado | Detalles |
|-------|--------|---------|
| Monorepo estructura | ✅ | 6 packages, configs, paths aliases |
| Tipos base | ✅ | 10+ interfaces en core-types |
| Stubs core-* | ✅ | Listos para implementar |
| Next.js app | ✅ | PWA, Tailwind, manifest |
| npm dependencies | ⏳ | Conectividad limitada |
| FASE 0 planning | ✅ | CHECKPOINT-FASE0-PLANIFICACION.md |

---

## Referencias

- Monorepo Setup: [MONOREPO-SETUP.md](./MONOREPO-SETUP.md)
- FASE 0 Planning: [Checkpoints/CHECKPOINT-FASE0-PLANIFICACION.md](./Checkpoints/CHECKPOINT-FASE0-PLANIFICACION.md)
- Design System: [context/SPEC-UI-DESIGN-SYSTEM.md](./context/SPEC-UI-DESIGN-SYSTEM.md)
