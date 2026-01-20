# HANDOFF: MOD-EXPEDIENTES Phase 2 (Sábado 22 Enero)

**FROM:** PROYECTO.md + SOFIA Phase 1 Completion (commit b2341ec4)
**TO:** SOFIA (Phase 2 Implementation)
**DATE:** 2026-01-21 04:30 UTC
**TARGET:** Sábado 22 Enero → 80% completado

---

## Status Actual

✅ **FASE 1 COMPLETADA (40%)**
- Commit: `b2341ec4` - "feat: MOD-EXPEDIENTES API service layer + tests (40% complete)"
- Deliverables:
  - ExpedientService: 405 líneas (6 métodos CRUD validados)
  - Types: 155 líneas (DTOs, enums, error classes)
  - Tests: 14 specs passing, 92.34% coverage, 100% function coverage
  - Vitest: v8 coverage provider configurado
  - Build: ✅ Compila sin errores

---

## Scope Phase 2 (Sábado 22) - 40% → 80%

### 1️⃣ API Routes Integration (web-app)

**Ubicación:** `packages/web-app/src/app/api/expedientes/`

**Rutas a implementar:**

```
POST   /api/expedientes                  ← Crear expediente desde cita
GET    /api/expedientes                  ← Listar expedientes (filtros + paginación)
GET    /api/expedientes/[id]             ← Obtener expediente completo
PUT    /api/expedientes/[id]             ← Actualizar datos paciente
POST   /api/expedientes/[id]/exam        ← Agregar vitales (TA, FC, temp, peso, altura)
POST   /api/expedientes/[id]/studies     ← Subir estudios (Rx, Lab, ECG, etc.)
GET    /api/expedientes/[id]/studies     ← Listar estudios
DELETE /api/expedientes/[id]/studies/[studyId] ← Eliminar estudio
```

**Validaciones requeridas:**
- Multi-tenant: Verificar clinicId del usuario en cada ruta
- Autenticación: `getServerSession()` antes de operar
- Permisos: Médico/Admin solo (no paciente)
- Expediente existente: Validar que expediente pertenece a clinica del usuario

**Error handling:**
```typescript
- 401: Not authenticated
- 403: Forbidden (no es médico/admin o clínica no match)
- 404: Expediente no encontrado
- 400: Datos inválidos (vitales fuera de rango, etc.)
- 500: Error interno
```

**Patrón de ruta (ejemplo):**
```typescript
// POST /api/expedientes
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });
  
  const { appointmentId } = await request.json();
  
  try {
    const expedient = await ExpedientService.createFromAppointment(
      appointmentId,
      session.user.clinicId
    );
    return Response.json(expedient);
  } catch (error) {
    if (error instanceof ExpedientNotFoundError) {
      return new Response('Not Found', { status: 404 });
    }
    throw error;
  }
}
```

---

### 2️⃣ Componentes UI (mod-expedientes)

**Ubicación:** `packages/mod-expedientes/src/components/`

**Componentes requeridos:**

1. **ExpedientForm** (crear/editar expediente)
   - Inputs: Datos básicos paciente (nombre, edad, sexo, cédula)
   - Select: Estado civil, ocupación, alergia común
   - Botón: "Crear expediente" → POST /api/expedientes
   - Validación: Cédula formato, nombre requerido

2. **ExpedientTable** (listado con filtros)
   - Columnas: Folio (EXP-...), Paciente, Estado, Fecha, Acciones
   - Filtros: Por estado (PENDING, IN_PROGRESS, VALIDATED, COMPLETED)
   - Paginación: 10 registros/página
   - Busqueda: Por cédula o nombre de paciente
   - Acciones: Ver detalle (link), Editar, Eliminar

3. **MedicalExamPanel** (agregar vitales)
   - Inputs: TA sistólica/diastólica, FC, temperatura, peso, altura
   - Validaciones:
     - TA: 60-200 mmHg
     - FC: 40-200 bpm
     - Temp: 35-42°C
     - Peso: 2-300 kg
     - Altura: 50-250 cm
   - Botón: "Guardar vitales" → POST /api/expedientes/[id]/exam

4. **StudyUploadZone** (subir estudios)
   - Drag-drop o input file
   - Tipos permitidos: PDF, PNG, JPG, DICOM (simulado como PDF)
   - Select: Tipo de estudio (RADIOGRAFIA, LABORATORIO, ECG, ESPIROMETRIA, AUDIOMETRIA, OTROS)
   - Preview: Mostrar archivos listos para subir
   - Botón: "Subir estudios" → POST /api/expedientes/[id]/studies
   - Lista de estudios adjuntos: Mostrar, descargar, eliminar

5. **ExpedientDetail** (view completo)
   - Secciones:
     1. Datos paciente (folio, nombre, edad, sexo)
     2. Vitales médico (si existen)
     3. Estudios adjuntos (lista con preview/descargar)
     4. Timeline: Created → Vitales agregados → Estudios subidos → Completed
   - Acciones: Agregar vitales (abrir MedicalExamPanel), Subir estudio (abrir StudyUploadZone)

---

### 3️⃣ Admin Pages Integration

**Ubicación:** `packages/web-app/src/app/admin/expedientes/`

**Páginas requeridas:**

1. **`/admin/expedientes/page.tsx`** (listado principal)
   - Header: "Expedientes" + botón "Crear expediente"
   - Contenido: ExpedientTable con filtros
   - Sidebar menu: Agregar "📋 Expedientes" después de "Citas"
   - Breadcrumb: Admin > Expedientes

2. **`/admin/expedientes/[id]/page.tsx`** (detalle + edición)
   - Contenido: ExpedientDetail + acciones inline
   - Breadcrumb: Admin > Expedientes > {Folio}
   - Tabs o secciones:
     - "Datos" (edit básico)
     - "Vitales" (MedicalExamPanel)
     - "Estudios" (StudyUploadZone + lista)
     - "Timeline" (historial de cambios)

---

### 4️⃣ Integración MOD-CITAS

**En: `packages/web-app/src/app/admin/citas/[id]/page.tsx` o componente de detalle**

**Agregar botón:**
```
"Generar Expediente"
├─ Visible: Si appointment.status === "CHECK_IN"
├─ Acción: POST /api/expedientes { appointmentId }
├─ Feedback: Toast "Expediente creado: EXP-..."
└─ Redirect: /admin/expedientes/{newExpedientId} (opcional)
```

**Flujo de usuario:**
1. Ver cita en /admin/citas
2. Hacer check-in (cambiar status)
3. Botón "Generar expediente" se activa
4. Click → Crear expediente automáticamente
5. Link a nuevo expediente en sidebar de cita

---

## Criterios de Aceptación (Phase 2 = 80%)

### ✅ Code Quality
- [ ] Todas las rutas compilar sin errores TypeScript
- [ ] Multi-tenant validation en 100% de rutas
- [ ] Error handling consistente (4xx/5xx)
- [ ] Componentes sin warnings en consola

### ✅ Testing
- [ ] 15-20 nuevos tests para rutas API (vitest)
- [ ] Cobertura total: 85%+ (target 90%)
- [ ] Tests de integración: MOD-CITAS → Expediente

### ✅ Security
- [ ] Session validation en todas las rutas
- [ ] ClinicId matching (no acceso cross-tenant)
- [ ] Rango de vitales validados en backend
- [ ] File uploads: Validar tamaño + tipo

### ✅ UX/DX
- [ ] Componentes reutilizables
- [ ] Loading states durante operaciones async
- [ ] Error messages claros para usuarios
- [ ] Validación real-time en forms

### ✅ Build Pipeline
- [ ] `npm run build` exitoso
- [ ] `npm test` → todos los tests pasan
- [ ] `npm run coverage` → 85%+ en mod-expedientes
- [ ] Vercel preview deployment sin errores

---

## Deliverables Phase 2

**Expected Commit(s):**
```
feat(MOD-EXPEDIENTES): Phase 2 - API routes + Admin UI integration (40% → 80%)

- Implement /api/expedientes/* routes (8 endpoints)
- Create UI components (Form, Table, MedicalExamPanel, StudyUploadZone, Detail)
- Add /admin/expedientes pages (listado + detalle)
- Integrate with MOD-CITAS (generar expediente button)
- Add E2E tests for API routes (15-20 specs)
- Update coverage to 85%+
```

**Files to Create/Modify:**
```
CREATED:
  packages/web-app/src/app/api/expedientes/route.ts
  packages/web-app/src/app/api/expedientes/[id]/route.ts
  packages/web-app/src/app/api/expedientes/[id]/exam/route.ts
  packages/web-app/src/app/api/expedientes/[id]/studies/route.ts
  packages/web-app/src/app/admin/expedientes/page.tsx
  packages/web-app/src/app/admin/expedientes/[id]/page.tsx
  packages/mod-expedientes/src/components/ExpedientForm.tsx
  packages/mod-expedientes/src/components/ExpedientTable.tsx
  packages/mod-expedientes/src/components/MedicalExamPanel.tsx
  packages/mod-expedientes/src/components/StudyUploadZone.tsx
  packages/mod-expedientes/src/components/ExpedientDetail.tsx
  packages/mod-expedientes/src/__tests__/expedient.api.spec.ts (15-20 tests)

MODIFIED:
  packages/web-app/src/app/admin/layout.tsx (menu: agregar expedientes)
  packages/web-app/src/app/admin/citas/[id]/page.tsx (agregar botón)
  packages/mod-expedientes/src/index.ts (exportar componentes)
```

---

## Notes para SOFIA

1. **Patrón Request:** Usa `ExpedientListFilters` con paginación (offset/limit)
2. **Validación de Vitales:** Backend debe validar rangos (no solo frontend)
3. **Multi-tenant:** Cada ruta debe verificar que clinicId del expediente = clinicId del usuario
4. **File Storage:** Estudios se guardan en Prisma + S3 (references; AWS integration futura)
5. **Error Messages:** Devolver mensajes descriptivos en español para UX
6. **Tests:** Mínimo 85% coverage; usar factory pattern para fixtures
7. **UI/UX:** Componentes deben mostrar loading spinners + error states
8. **Commit Message:** Usar convención `feat(MOD-EXPEDIENTES):`

---

## Timeline Sábado 22

- **Morning (06:00-12:00):** API routes (endpoints 1-4)
- **Afternoon (12:00-18:00):** Componentes UI (Form, Table, Panel, UploadZone)
- **Evening (18:00-24:00):** Admin pages + integración MOD-CITAS + tests

**Milestone:** Viernes noche → PR abierto con Phase 2 (80%), tests pasando ✅

---

## Blocker Resolution

Si encuentras:
- **Prisma relation error:** Verificar que schema tiene Expedient.studies → Study relación
- **Session undefined:** Checkear que `authOptions` está importado correctamente
- **Multi-tenant issue:** Validar clinicId en SessionUser (ver cookies middleware)
- **File upload:** Por ahora, guardar reference en BD; S3 integration en Phase 3 (MOD-VALIDACION)

---

## Next Phase (Phase 3 - Domingo 23)

- [✓] Testing completo + E2E workflow
- [✓] Sample data script (`scripts/seed-expedients.ts`)
- [✓] Checkpoint final: `CHECKPOINT-MOD-EXPEDIENTES-FASE1-20260123.md`
- [✓] PROYECTO.md update (100%)

---

**Status:** 🚀 Ready to start Phase 2 (2026-01-22 06:00 UTC)
**Estimated Duration:** 12-16 horas (Sábado 22 completo)
**Expected Result:** 80% completado, PR listo para revisión

¡Adelante SOFIA! 💪
