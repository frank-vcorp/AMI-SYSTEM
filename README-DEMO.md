# 🎬 DEMO WALKTHROUGH - AMI SYSTEM
**Fecha:** Jueves 23 Enero 2026  
**Duración:** 15-20 minutos  
**Objetivo:** Demostrar flujo E2E completo: Cita → Papeleta → Examen Médico → Validación → Entrega  
**Responsable:** Frank Saavedra  
**Sistema:** FASE 1 AMPLIADA - 100% COMPLETADO ✅

---

## 📋 Pre-Demo Setup (Antes de la demo)

### Verificar Estado del Sistema
```bash
# 1. Build status
npm run build
# Esperado: 15/15 tasks PASSING ✅

# 2. TypeScript validation
npx tsc --noEmit
# Esperado: 0 errors ✅

# 3. Verificar servidor local o Vercel LIVE
# Local: http://localhost:3000
# Production: https://ami-system.vercel.app
```

### Datos de Demostración
- **Clínicas:** 3 (Centro, Norte, Móvil)
- **Empresas:** 5 (Tech Corp, Health Plus, Industries XYZ, Services Ltd, Others)
- **Médicos:** 5 (con firmas digitales)
- **Citas:** 10 (Estado: CHECK_IN listo para expediente)
- **Expedientes:** 5 (pre-completados para validación)

---

## 🎯 DEMO FLOW - 7 Steps (15 minutos)

### ⏱️ STEP 1: Dashboard Overview (1-2 minutos)

**Ruta:** `http://localhost:3000/admin`

**Acciones:**
1. Click en el logo/home
2. Mostrar Dashboard principal

**Qué Mostrar:**
- **4 KPI Cards (en el tope):**
  - 📊 "Pacientes en Proceso: 47"
  - ✅ "Dictámenes Hoy: 12"
  - ⏱️ "TAT Promedio: 5.8 hrs"
  - 🎯 "Precisión IA: 94.2%"

- **Gráficos:**
  - Expedientes por Estado (Recepción, Examen, Estudios, Validación, Completado)
  - Productividad por Clínica (Centro, Norte, Móvil)
  - Timeline de Actividad Reciente

**Comentario:**
> "Este es el dashboard principal del sistema. Aquí podemos ver el estado general del sistema, cuántos pacientes están en proceso, el tiempo promedio de atención, y qué tan precisa es la extracción de datos."

---

### ⏱️ STEP 2: Crear Cita y Generar Expediente (2-3 minutos)

**Ruta:** `http://localhost:3000/admin/citas`

**Acciones:**
1. Click en botón "➕ Nueva Cita"
2. Llenar formulario:
   - **Paciente:** Juan Pérez
   - **ID Empleado:** EMP-001
   - **Empresa:** Tech Corp
   - **Clínica:** Centro
   - **Fecha:** [Hoy o Mañana]
   - **Hora:** 10:00 AM
   - **Tipo:** Examen Ocupacional
3. Click "Crear Cita"
4. En la tabla, buscar la cita recién creada
5. Cambiar estado a "✅ CHECK_IN" (si está en estado diferente)
6. **Click en botón "📋 Generar Expediente"** (botón verde en Actions)

**Qué Mostrar:**
- La cita se crea exitosamente
- El botón "Generar Expediente" solo aparece para citas en CHECK_IN
- **IMPORTANTE:** El flujo auto-navega a `/admin/expedientes/new?appointmentId=X&patientId=Y`

**Comentario:**
> "El flujo es simple: el recepcionista registra al paciente cuando llega (check-in), y con un solo click genera el expediente. El sistema automáticamente trae los datos del paciente pre-llenados."

---

### ⏱️ STEP 3: Folio Generation & Papeleta (2 minutos)

**Ruta:** `/admin/expedientes/new?appointmentId=X&patientId=Y` (navegación automática)

**Qué Mostrar:**
- Datos del paciente pre-llenados (nombre, empresa, clínica)
- Sección "Estudios Seleccionables":
  - ✓ Examen Médico (siempre obligatorio, disabled)
  - [ ] Laboratorio (opcional)
  - [ ] Radiografías (opcional)
  - [ ] Espirometría (opcional)
  - [ ] Audiometría (opcional)
  - [ ] ECG (opcional)
  - [ ] Campimetría (opcional)
  - [ ] Toxicológico (opcional)

**Acciones:**
1. Click en algunos checkboxes (ej: Laboratorio, Radiografías, ECG)
2. Click en botón "🎫 Generar Papeleta"
3. El sistema hace POST a `/api/papeletas/folio`

**Qué Mostrar:**
- Se genera folio único: **"EXP-CDMX-20260121-001"**
  - Formato: EXP-{STATE}-{YYYYMMDD}-{NNN}
  - Garantiza uniqueness por clínica, por día
- Se muestra **QR Code** (clickeable, puede descargarse)
- Se muestra **preview de la papeleta** con:
  - Folio number
  - QR code
  - Estudios seleccionados
  - Fecha de validez (30 días)

**Comentario:**
> "El sistema genera automáticamente un folio único para cada papeleta. Este folio sirve para rastrear el expediente, y incluye un código QR que se puede imprimir o usar con dispositivos móviles."

---

### ⏱️ STEP 4: Medical Exam Form - Examen Médico Completo (4-5 minutos)

**Ruta:** `/admin/expedientes/[id]` (generalmente auto-navega después de generar papeleta)

**Qué Mostrar:**
1. **Sección: Signos Vitales** (click para expandir)
   - Llenar algunos datos:
     - TA SIS: 120 mmHg
     - TA DIA: 80 mmHg
     - FC: 78 bpm
     - FR: 16 rpm
     - Temp: 37°C
     - Peso: 75 kg

2. **Sección: Datos Demográficos** (click para expandir)
   - Mostrar que están pre-llenados con defaults
   - Ejemplos: Sexo (MASCULINO), Escolaridad (LICENCIATURA), Grupo RH (O+)

3. **Sección: Exploración Física** (click para expandir - MUY IMPORTANTE)
   - **Mostrar que hay 21 campos de exploración:**
     - Neurológico
     - Cabeza
     - Piel
     - Oídos
     - Ojos
     - Boca
     - Nariz
     - Faringe
     - Cuello
     - Tórax
     - Corazón
     - Pulmones
     - Abdomen
     - Genitourinario
     - Columna Vertebral
     - Test de Adam
     - MS Superiores
     - MS Inferiores
     - Fuerza (Daniels)
     - Circulación Venosa
     - Arco de Movilidad
   
   - **Mostrar que TODOS tienen valores por defecto EDITABLES:**
     - Ej: "Neurológico: Alerta y orientado en persona, tiempo y espacio. Sin déficit neurológico aparente."
     - Ej: "Cabeza: Normocéfalo, adecuada implantación de cabello."
   
   - Editar algunos valores (opcional, para mostrar que es editable)

4. **Sección: Agudeza Visual** (click para expandir)
   - Mostrar 5 campos:
     - Visión Lejana OD: 20/20
     - Visión Lejana OI: 20/20
     - Visión Cercana: J1
     - Ishihara: NORMAL (dropdown)
     - Campimetría: NORMAL (dropdown)

5. **Sección: Ginecología** (CONDICIONAL - solo si sexo = FEMENINO)
   - Saltear si paciente es masculino

6. **Sección: Antecedentes** (click para expandir)
   - Mostrar 3 campos:
     - Heredo-Familiares
     - Hábitos (tabaco/alcohol)
     - Alimentación (dropdown: MALA/REGULAR/BUENA)

7. **Sección: Aptitud y Recomendaciones** (click para expandir)
   - Mostrar textarea para impresión clínica final
   - Ej: "Paciente en buen estado general, apto para labores"

**Acciones:**
- Click en "💾 Guardar Examen"
- El sistema hace POST a API para guardar medical exam

**Comentario:**
> "Este es el formulario de examen médico completo. Tiene 21 campos de exploración física, todos con valores por defecto que el médico puede editar según lo que observa en el paciente. El médico rellena el formulario con los datos del examen físico."

---

### ⏱️ STEP 5: Doctor Management - Alta de Médico (2 minutos)

**Ruta:** `http://localhost:3000/admin/clinicas`

**Acciones:**
1. Seleccionar una clínica (ej: "Centro")
2. Click en pestaña/botón "➕ Agregar Médico"

**Qué Mostrar:**
- Modal de "Alta de Médico" con campos:
  - **Nombre Completo:** Dr. Carlos González
  - **Cédula Profesional:** MED-123456 (must be unique per tenant)
  - **Especialidad:** Dropdown con 10 opciones:
    - Medicina General
    - Cardiología
    - Oftalmología
    - Neumología
    - Gastroenterología
    - Dermatología
    - Neurología
    - Ortopedia
    - Ginecología
    - Otro
  - **Clínica:** Pre-seleccionada (Centro)

- **Firma Digital:**
  - Mostrar canvas vacío (400x150px)
  - **Dibujar algo en el canvas** (demostrar que funciona)
  - Botón "🗑️ Limpiar Firma" para reset
  - Validación: Firma es requerida antes de guardar

**Acciones:**
1. Llenar formulario
2. Dibujar firma en el canvas
3. Click "💾 Guardar Médico"

**Qué Mostrar:**
- Medical signature se captura como base64 (canvas.toDataURL())
- Se guarda en BD en tabla `doctors`
- Doctor aparece en lista de médicos de la clínica

**Comentario:**
> "Aquí es donde se registran los médicos que harán los exámenes. El sistema captura una firma digital en el canvas que será usada para firmar los reportes finales. Cada médico está asociado a una clínica."

---

### ⏱️ STEP 6: Clinic Schedule Management (1-2 minutos)

**Ruta:** Mismo modal de clínica, pestaña "📅 Horarios"

**Acciones:**
1. En el mismo modal de clínica, click en pestaña "📅 Horarios"

**Qué Mostrar:**
- **Tabla interactiva** con 7 filas (Mon-Sun):
  | Día | Abierto | Apertura | Cierre | Receso | Max Citas |
  |-----|---------|----------|--------|--------|-----------|
  | Lun | ✓ | 08:00 | 17:00 | 12:00-13:00 | 50 |
  | Mar | ✓ | 08:00 | 17:00 | 12:00-13:00 | 50 |
  | Mié | ✓ | 08:00 | 17:00 | 12:00-13:00 | 50 |
  | Jue | ✓ | 08:00 | 17:00 | 12:00-13:00 | 50 |
  | Vie | ✓ | 08:00 | 17:00 | 12:00-13:00 | 50 |
  | Sab | ✓ | 09:00 | 14:00 | — | 30 |
  | Dom | ✗ | — | — | — | 0 |

**Acciones (Interacción):**
1. Click en checkbox "Abierto" para Lunes → desmarcar y marcar
2. Editar un time input (ej: cambiar Lunes apertura de 08:00 a 08:30)
3. Editar Max Citas (ej: cambiar de 50 a 45)
4. Click "💾 Guardar" para actualizar horarios

**Qué Mostrar:**
- Los cambios se guardan en la BD
- Los horarios se usan para generar disponibilidad en el calendario de citas

**Comentario:**
> "Con esta sección, administramos el horario de atención de cada sucursal. Podemos definir qué días está abierta, a qué hora abre y cierra, cuánto dura el receso, y cuántas citas máximo puede atender por día."

---

### ⏱️ STEP 7: Report Delivery - Entrega Controlada (2-3 minutos)

**Ruta:** `http://localhost:3000/admin/reportes/[expediente-id]`

**Qué Mostrar:**
- **Sección de Entrega Controlada** con 3 métodos:

#### Método 1: Email (Recomendado)
```
Input: "Correo del Destinatario"
  [juan@empresa.com                    ]
  
Button: [📧 Enviar Email]

Features:
  ✓ Expira en 7 días
  ✓ Acceso único
  ✓ Datos anónimos del paciente
  ✓ Bitácora completa

After clicking:
  ✅ Email enviado a juan@empresa.com
  [Resend]
```

**Acciones:**
1. Llenar email: "demo@empresa.com"
2. Click "📧 Enviar Email"
3. Mostrar confirmación

#### Método 2: Direct Link (Temporal)
```
Button: [🔗 Generar Enlace Temporal]

After clicking:
  URL generated:
  [https://ami-system.vercel.app/reportes/descarga/EXP-CDMX-20260121-001?token=abc123xyz&expires=2026-01-28T22:45:00Z]
  
  Buttons:
  [📋 Copiar Enlace] [🔗 Abrir en Nueva Pestaña]
  
  Metadata:
  ⏱️ Expira: 2026-01-28 22:45
  🔑 Token único, no reutilizable
  🔒 Link visible solo en esta sesión
```

**Acciones:**
1. Click "🔗 Generar Enlace Temporal"
2. Mostrar URL generada
3. Click "📋 Copiar Enlace" → Muestra "¡Copiado!"

#### Método 3: Local Download
```
Button: [📥 Descargar PDF - EXP-CDMX-20260121-001.pdf]
```

**Acciones:**
1. Click en botón
2. Browser inicia descarga del PDF

#### Delivery History
```
Timeline below:

✅ Email sent to juan@empresa.com - 2026-01-21 22:30 UTC
✅ Link accessed from IP 192.168.1.1 - 2026-01-21 22:35 UTC
✅ PDF downloaded - 2026-01-21 22:36 UTC
```

**Comentario:**
> "El sistema proporciona 3 opciones de entrega para el reporte final:
> 1. Email seguro - expira en 7 días, acceso único
> 2. Enlace temporal - se puede compartir por WhatsApp, SMS, etc.
> 3. Descarga local - útil para portales web
> Toda la bitácora de entregas se registra automáticamente para auditoría."

---

## 🎬 TIMING SUMMARY

| Step | Actividad | Duración | Total |
|------|-----------|----------|-------|
| 1 | Dashboard Overview | 1-2 min | 1-2 min |
| 2 | Crear Cita + Expediente | 2-3 min | 3-5 min |
| 3 | Folio Generation | 2 min | 5-7 min |
| 4 | Medical Exam Form | 4-5 min | 9-12 min |
| 5 | Doctor Management | 2 min | 11-14 min |
| 6 | Clinic Schedule | 1-2 min | 12-16 min |
| 7 | Report Delivery | 2-3 min | 14-19 min |
| **TOTAL** | **End-to-End Flow** | **14-19 min** | **✅ Within 15-20 min target** |

---

## 💡 Demo Tips

### Si Algo Falla
1. **Build Error:** `npm run build` en terminal, esperar 30s
2. **API Error:** Verificar Railway DB está conectada (check Vercel env vars)
3. **Component No Carga:** Ctrl+F5 (hard refresh) en navegador
4. **Canvas Signature No Funciona:** Verificar que sea Firefox o Chrome (no Safari)

### For Better Demo Experience
1. **Open 2 Tabs:**
   - Tab 1: Admin dashboard (1024x768 minimum)
   - Tab 2: Mobile preview (DevTools, toggle device toolbar)
2. **Pre-scroll** to key sections antes de demo (ej: "Exploración Física" con 21 campos)
3. **Have sample data ready** (paciente, empresa, clínica nombres)
4. **Use keyboard shortcuts:**
   - F12 para abrir DevTools (mostrar red requests si quieres)
   - Tab para navegar forms
   - Enter para submit

### Key Selling Points During Demo
1. **"Multi-tenant desde el inicio"** - Cada query aislada por tenantId
2. **"Valores por defecto clínicamente relevantes"** - Viene de spec de datos médicos reales
3. **"Folio único garantizado"** - Imposible duplicados, incluso con race conditions
4. **"Firma digital capturada"** - Base64 canvas, listo para PDF signing
5. **"3 opciones de entrega"** - Email + Link + Download, flexible para clientes
6. **"Build PASSING"** - 15/15 Turborepo tasks, 0 TypeScript errors

---

## 📱 Mobile Responsive Demo (Optional Bonus)

Si hay tiempo extra, mostrar:
```
1. F12 → Toggle Device Toolbar (iPhone 12 Pro)
2. Navegar por admin dashboard
3. Mostrar que components son responsive
4. Demostrar que forms funcionan en mobile
```

---

## 🎥 Recording Preparation (If Needed)

Si quieres grabar la demo:
```bash
# Option 1: Simple screen recording (macOS)
cmd+shift+5 → Select area → Record

# Option 2: OBS Studio (all platforms)
# Download from: obsproject.com
# New Scene → Display Capture → Start Recording
```

---

## ✅ Pre-Demo Checklist

**48 Horas Antes:**
- [ ] Verificar build PASSING (15/15 tasks)
- [ ] Verificar TypeScript clean (0 errors)
- [ ] Verificar DB connection (Railway LIVE)
- [ ] Verificar Vercel deployment (LIVE)

**4 Horas Antes:**
- [ ] Cargar seed data (10 citas, 5 expedientes)
- [ ] Crear 2-3 médicos de prueba
- [ ] Crear 3 clínicas con horarios
- [ ] Probar flujo E2E 1 vez completa

**30 Minutos Antes:**
- [ ] Cerrar todas las tabs excepto las necesarias
- [ ] Limpiar cache del navegador (Cmd+Shift+Delete)
- [ ] Abrir `http://localhost:3000/admin` o Vercel URL
- [ ] Verificar audio/video si es presentación remota

---

## 📞 Support During Demo

**Si hay preguntas:**
- **"¿Es seguro?"** → "Sí, multi-tenant con validación en cada query. Nunca cruzan datos entre clientes."
- **"¿Qué sigue?"** → "FASE 2 Operaciones: Bitácora de auditoría, dashboard de calidad, reporte automático."
- **"¿Cuánto cuesta?"** → "Contactar a Frank Saavedra para detalles de pricing."
- **"¿Qué necesita el cliente?"** → "Un navegador moderno (Chrome, Firefox, Safari). Opcionalmente, app móvil en el futuro."

---

## 🎯 Success Criteria

Demo es exitosa si:
- ✅ Flujo completo ejecuta sin errores (Cita → Papeleta → Examen → Validación → Entrega)
- ✅ Folio genera correctamente con format único
- ✅ Firma digital captura en canvas
- ✅ 3 métodos de entrega funcionan
- ✅ Sistema se ve profesional (MANUS UI + AMI colors)
- ✅ Responde rápido (<2s por click)

---

## 📝 Demo Notes Template

Usa esto para tomar notas durante la demo:

```
[Fecha] [Hora] - Asistentes: _______

Dashboard:
  - Métricas mostraron correctamente? ______
  - Gráficos renderizados? ______

Cita + Expediente:
  - Creación de cita? ______
  - Generación de expediente? ______

Folio:
  - Folio formato correcto? ______
  - QR visible? ______

Examen Médico:
  - 21 campos visible? ______
  - Defaults cargaron? ______

Doctor:
  - Firma canvas funcionó? ______
  - Doctor guardado en BD? ______

Schedule:
  - Tabla horarios editable? ______
  - Cambios guardaron? ______

Delivery:
  - Email option funciona? ______
  - Link temporal generó? ______
  - Download inició? ______

Notas Generales:
  _______________________________________________
  _______________________________________________
```

---

**🎬 ¡DEMO LISTO PARA JUEVES 23 ENERO! 🎬**

**Commit:** d8c66a2e (FASE 1 AMPLIADA)  
**Status:** ✅ 100% COMPLETADO  
**Build:** 15/15 PASSING  
**TypeScript:** 0 ERRORS  
**Multi-tenant:** ✅ VALIDATED

¡Suerte con la presentación!
