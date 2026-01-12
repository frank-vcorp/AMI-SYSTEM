# Guía: Cómo Crear un Nuevo Módulo para AMI-SYSTEM

**Versión:** 1.0  
**Fecha:** 2026-01-12  
**Autor:** INTEGRA (Arquitecto IA)

---

## Propósito

Esta guía explica cómo crear un nuevo módulo para AMI-SYSTEM siguiendo la arquitectura modular establecida. Cada módulo debe ser **independiente** (funcionar solo con Core) pero **integrable** con el resto del sistema.

---

## Estructura de un Módulo

```
packages/mod-{nombre}/
│
├── README.md                    ← Documentación del módulo
├── package.json                 ← Dependencias propias
├── tsconfig.json                ← Configuración TypeScript
│
├── src/
│   ├── index.ts                 ← Exports públicos
│   │
│   ├── api/                     ← Endpoints/Acciones
│   │   ├── index.ts
│   │   └── {recurso}.ts
│   │
│   ├── components/              ← Componentes React
│   │   ├── index.ts
│   │   └── {Componente}.tsx
│   │
│   ├── hooks/                   ← React hooks
│   │   ├── index.ts
│   │   └── use{Nombre}.ts
│   │
│   ├── lib/                     ← Lógica de negocio
│   │   └── {funcion}.ts
│   │
│   ├── types/                   ← TypeScript types
│   │   └── index.ts
│   │
│   └── providers/               ← Context providers (opcional)
│       └── {Nombre}Provider.tsx
│
├── prisma/                      ← Schema del módulo (si necesita DB)
│   └── schema.prisma
│
└── tests/
    ├── unit/
    └── integration/
```

---

## Paso a Paso

### 1. Crear la Carpeta

```bash
mkdir -p packages/mod-{nombre}/src/{api,components,hooks,lib,types}
```

### 2. Crear package.json

```json
{
  "name": "@ami/mod-{nombre}",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "@ami/core": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### 3. Crear README.md

```markdown
# MOD-{NOMBRE}

## Descripción
[Qué hace este módulo]

## Instalación

### Como parte de AMI-SYSTEM
Ya incluido en el monorepo.

### Como módulo independiente
\`\`\`bash
npm install @ami/mod-{nombre} @ami/core
\`\`\`

## Uso

### Importar componentes
\`\`\`typescript
import { MiComponente } from '@ami/mod-{nombre}';
\`\`\`

### Configurar Provider (si aplica)
\`\`\`typescript
import { {Nombre}Provider } from '@ami/mod-{nombre}';

<{Nombre}Provider config={...}>
  <App />
</{Nombre}Provider>
\`\`\`

## API

### Endpoints
- `GET /api/{nombre}` - Lista recursos
- `POST /api/{nombre}` - Crea recurso
- ...

### Componentes
- `{Componente}` - Descripción
- ...

### Hooks
- `use{Nombre}` - Descripción
- ...

## Dependencias
- `@ami/core` (requerido)
- `@ami/mod-otro` (opcional, para X feature)

## Configuración
[Opciones de configuración disponibles]

## Testing
\`\`\`bash
pnpm test
\`\`\`
```

### 4. Crear Types

```typescript
// src/types/index.ts

export interface {Entidad} {
  id: string;
  // ... campos
}

export interface {Entidad}CreateInput {
  // ... campos para crear
}

export interface {Entidad}UpdateInput {
  // ... campos para actualizar
}

// Props de componentes
export interface {Componente}Props {
  // ...
}

// Opciones del módulo
export interface {Nombre}ModuleConfig {
  // ...
}
```

### 5. Crear API

```typescript
// src/api/index.ts

export * from './{recurso}';
```

```typescript
// src/api/{recurso}.ts

import { prisma } from '@ami/core/database';
import type { {Entidad}, {Entidad}CreateInput } from '../types';

export async function get{Entidad}s(tenantId: string): Promise<{Entidad}[]> {
  return prisma.{entidad}.findMany({
    where: { tenantId }
  });
}

export async function get{Entidad}ById(id: string): Promise<{Entidad} | null> {
  return prisma.{entidad}.findUnique({
    where: { id }
  });
}

export async function create{Entidad}(
  data: {Entidad}CreateInput
): Promise<{Entidad}> {
  return prisma.{entidad}.create({ data });
}

// ... más operaciones
```

### 6. Crear Componentes

```typescript
// src/components/index.ts

export * from './{Componente}';
```

```tsx
// src/components/{Componente}.tsx

'use client';

import { useState } from 'react';
import { Button, Card } from '@ami/core/ui';
import type { {Componente}Props } from '../types';

export function {Componente}({ ...props }: {Componente}Props) {
  // Lógica del componente
  
  return (
    <Card>
      {/* UI mobile-first */}
    </Card>
  );
}
```

### 7. Crear Hooks

```typescript
// src/hooks/index.ts

export * from './use{Nombre}';
```

```typescript
// src/hooks/use{Nombre}.ts

import { useState, useEffect } from 'react';
import { get{Entidad}s } from '../api';
import type { {Entidad} } from '../types';

export function use{Nombre}(tenantId: string) {
  const [data, setData] = useState<{Entidad}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    get{Entidad}s(tenantId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [tenantId]);

  return { data, loading, error };
}
```

### 8. Crear Index (Exports)

```typescript
// src/index.ts

// Types
export * from './types';

// API
export * from './api';

// Components
export * from './components';

// Hooks
export * from './hooks';

// Providers (si hay)
export * from './providers';
```

### 9. Schema Prisma (si necesita DB)

```prisma
// prisma/schema.prisma

// Este schema se combina con el principal durante build

model {Entidad} {
  id        String   @id @default(cuid())
  tenantId  String
  // ... campos específicos del módulo
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([tenantId])
}
```

### 10. Registrar en la App

```typescript
// apps/web/modules.config.ts

export const modules = [
  // ... módulos existentes
  {
    id: '{nombre}',
    name: '{Nombre Visible}',
    icon: 'IconName',
    path: '/{nombre}',
    component: () => import('@ami/mod-{nombre}'),
    permissions: ['{nombre}:read', '{nombre}:write']
  }
];
```

### 11. Agregar Permisos

```typescript
// packages/core/auth/permissions.ts

export const PERMISSIONS = {
  // ... existentes
  '{nombre}:read': 'Ver {nombre}',
  '{nombre}:write': 'Editar {nombre}',
  '{nombre}:delete': 'Eliminar {nombre}',
};
```

---

## Checklist de Nuevo Módulo

- [ ] Carpeta creada en `packages/mod-{nombre}/`
- [ ] `package.json` con dependencia a `@ami/core`
- [ ] `README.md` con documentación completa
- [ ] Types definidos en `src/types/`
- [ ] API implementada en `src/api/`
- [ ] Componentes en `src/components/` (mobile-first)
- [ ] Hooks en `src/hooks/`
- [ ] `src/index.ts` exporta todo lo público
- [ ] Schema Prisma si necesita DB
- [ ] Tests unitarios (>80% cobertura)
- [ ] Registrado en `modules.config.ts`
- [ ] Permisos agregados en Core

---

## Patrones de Comunicación

### Módulo usa datos de otro módulo

**NO HACER:**
```typescript
// ❌ Importar directamente
import { getClinic } from '@ami/mod-clinicas';
```

**HACER:**
```typescript
// ✅ Definir interface de lo que necesita
interface ClinicProvider {
  getClinic(id: string): Promise<Clinic>;
}

// El módulo recibe el provider
export function createModule(deps: { clinics: ClinicProvider }) {
  // Usa deps.clinics.getClinic()
}
```

Esto permite:
1. Usar el módulo con diferentes fuentes de datos
2. Testing más fácil (mock del provider)
3. Módulo verdaderamente independiente

---

## Ejemplo Completo: mod-wellness

```typescript
// packages/mod-wellness/src/types/index.ts

export interface WellnessCheck {
  id: string;
  tenantId: string;
  patientId: string;
  date: Date;
  temperature: number;
  hasSymptoms: boolean;
  symptoms?: string[];
  canWork: boolean;
}

export interface WellnessCheckInput {
  patientId: string;
  temperature: number;
  hasSymptoms: boolean;
  symptoms?: string[];
}
```

```typescript
// packages/mod-wellness/src/api/wellness.ts

import { prisma } from '@ami/core/database';
import type { WellnessCheck, WellnessCheckInput } from '../types';

export async function createWellnessCheck(
  tenantId: string,
  data: WellnessCheckInput
): Promise<WellnessCheck> {
  const canWork = data.temperature < 37.5 && !data.hasSymptoms;
  
  return prisma.wellnessCheck.create({
    data: {
      tenantId,
      ...data,
      canWork
    }
  });
}

export async function getTodayCheck(
  patientId: string
): Promise<WellnessCheck | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return prisma.wellnessCheck.findFirst({
    where: {
      patientId,
      date: { gte: today }
    }
  });
}
```

```tsx
// packages/mod-wellness/src/components/WellnessForm.tsx

'use client';

import { useState } from 'react';
import { Button, Input, Checkbox } from '@ami/core/ui';
import { createWellnessCheck } from '../api';

export function WellnessForm({ patientId, onComplete }) {
  const [temperature, setTemperature] = useState('');
  const [hasSymptoms, setHasSymptoms] = useState(false);
  
  const handleSubmit = async () => {
    const result = await createWellnessCheck(tenantId, {
      patientId,
      temperature: parseFloat(temperature),
      hasSymptoms
    });
    onComplete(result);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Temperatura (°C)"
        type="number"
        step="0.1"
        value={temperature}
        onChange={e => setTemperature(e.target.value)}
      />
      <Checkbox
        label="¿Presenta síntomas?"
        checked={hasSymptoms}
        onChange={setHasSymptoms}
      />
      <Button type="submit" className="w-full">
        Registrar
      </Button>
    </form>
  );
}
```

---

## Referencias

- [ADR-ARCH-20260112-01](decisions/ADR-ARCH-20260112-01.md) - Arquitectura Modular
- [SPEC-MODULOS-AMI](SPEC-MODULOS-AMI.md) - Catálogo de Módulos
- Core: `packages/core/`

---

**🏗️ ARCH REFERENCE:** ARCH-20260112-06  
**🤖 AUTHOR:** INTEGRA (Arquitecto IA)
