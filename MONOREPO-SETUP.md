# Estructura del Monorepo

Este proyecto usa **pnpm workspaces** + **Turborepo** para organizar código compartido.

## Estructura

```
/
├── packages/
│   ├── core-types/        # Interfaces y tipos compartidos
│   ├── core-auth/         # Autenticación Firebase + roles
│   ├── core-database/     # Prisma + PostgreSQL
│   ├── core-storage/      # GCP Cloud Storage
│   ├── core-ui/           # Componentes UI reutilizables
│   └── web-app/           # Next.js 14 application
├── pnpm-workspace.yaml    # Configuración de workspaces
├── turbo.json             # Configuración de Turborepo
├── tsconfig.base.json     # Configuración TypeScript base
├── .eslintrc.js           # ESLint configuración
├── .prettierrc             # Prettier configuración
└── package.json           # Root dependencies

```

## Dependencias entre Packages

```
web-app
├── core-types
├── core-auth
├── core-database
├── core-storage
└── core-ui
    └── core-types
```

## Scripts Principales

### Desarrollo
```bash
pnpm dev          # Levanta all packages en modo dev
pnpm build        # Build all packages
pnpm test         # Ejecuta tests en todos
pnpm lint         # Lint en todos
```

### Formatting
```bash
pnpm format       # Prettier --write
pnpm format:check # Prettier --check
```

### Herramientas
```bash
pnpm clean        # Limpia node_modules y builds
```

## Agregar Dependencias

### En el root (devDependencies)
```bash
pnpm add -D typescript @types/node -w
```

### En un package específico
```bash
pnpm add lodash --filter @ami/core-utils
```

### Workspace dependency (references otro package)
```bash
pnpm add @ami/core-types --filter @ami/web-app
```

## TypeScript Paths

Configuradas en `tsconfig.base.json`:

```typescript
import { User } from '@core/types';
import { verifyToken } from '@core/auth';
import { prisma } from '@core/database';
import { generateUploadUrl } from '@core/storage';
import { Button, Card } from '@core/ui';
```

## Turborepo Pipeline

Definido en `turbo.json`:

- `dev` - Sin caché, paralelo
- `build` - Cachea outputs, respeta dependencias
- `test` - Cachea outputs
- `lint` - Sin caché

## Referencias

- [pnpm workspaces](https://pnpm.io/workspaces)
- [Turborepo](https://turbo.build)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
