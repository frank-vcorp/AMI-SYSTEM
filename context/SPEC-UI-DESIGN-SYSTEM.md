# SPEC: UI Design System AMI-SYSTEM

**Basado en:** Legacy `RD-AMI` (`context/LEGACY_IMPORT/ami-rd`)  
**Fecha:** 2026-01-12  
**Framework:** Tailwind CSS + shadcn/ui + Next.js  
**Estado:** Especificación para FASE 0

---

## 1. Paleta de Colores

Extraída del legacy HTML (Tailwind config):

```javascript
colors: {
  'ami-turquoise': '#00B5A5',      // Primario (botones, links, accents)
  'ami-purple': '#7B2D8E',          // Secundario (headers, títulos)
  'ami-dark-gray': '#4A5568',       // Texto oscuro
  'ami-light-turquoise': '#4FD1C7', // Hover states
  'ami-light-purple': '#9F7AEA',    // Backgrounds suaves
  'ami-blue': '#00B5A5',            // Activos (tabs, badges)
  'ami-green': '#00B5A5',           // Success
  'ami-red': '#ef4444',             // Error/Danger
  'ami-yellow': '#f59e0b',          // Warning
  'ami-gray': '#6b7280',            // Disabled/muted
}
```

### Semáforos de Estado
- 🟢 **Done** → `#10B981` (green-500 Tailwind)
- 🟡 **In Progress** → `#f59e0b` (amber-500 Tailwind)
- 🔴 **Pending** → `#6B7280` (gray-500 Tailwind)
- 🟠 **Blocked** → `#f97316` (orange-500 Tailwind)

---

## 2. Tipografía

**Base:** Inter o Roboto (sin serif)

### Escala
```
H1: 32px bold (Títulos principales)
H2: 24px bold (Secciones)
H3: 18px semibold (Subsecciones)
H4: 14px semibold (Cards titles)
Body: 14px regular (Contenido)
Small: 12px regular (Etiquetas, hints)
Mono: 13px (Códigos, hashes)
```

---

## 3. Componentes UI del Legacy

### 3.1 Header (Sticky)

```html
<header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
    <!-- Logo + Branding -->
    <div class="flex items-center space-x-3">
      <img src="logo-ami.png" class="h-12 w-auto">
      <div class="border-l border-gray-300 pl-3">
        <h1 class="text-xl font-bold text-ami-purple">RD-AMI</h1>
        <p class="text-xs text-ami-turquoise font-medium">Residente Digital con IA</p>
      </div>
    </div>
    <!-- Info: Folio + Fecha -->
    <div class="text-sm text-gray-600">
      <span>Folio: <span class="text-ami-blue">#RD-2025-001</span></span>
      <span id="fechaActual"></span>
    </div>
  </div>
</header>
```

**Características:**
- Sticky (sigue al scroll)
- Logo + texto branding (AMI)
- Folio y fecha dinámicos
- Z-index alto (z-50)

---

### 3.2 Navigation Tabs

```html
<nav class="bg-white border-b border-gray-200">
  <div class="flex space-x-8 overflow-x-auto">
    <button class="nav-tab flex items-center space-x-2 py-4 px-1 
                    border-b-2 border-ami-blue text-ami-blue font-medium 
                    text-sm whitespace-nowrap" 
            data-tab="dashboard">
      <i class="fas fa-chart-dashboard"></i>
      <span>Dashboard</span>
    </button>
    <!-- Más tabs... -->
  </div>
</nav>
```

**Tabs en RD-AMI:**
1. Dashboard
2. Recepción
3. Examen Médico
4. Estudios
5. Validación
6. Reportes
7. Papeletas
8. Empresas
9. Expedientes
10. Bitácora
11. Analytics

**Estados:**
- Active: `border-ami-blue`, `text-ami-blue`, `font-medium`
- Inactive: `border-transparent`, `text-gray-500`, hover → `text-gray-700`

---

### 3.3 Breadcrumbs

```html
<nav class="text-sm text-gray-600 mb-4">
  <a href="#" class="text-ami-blue hover:underline">Home</a> 
  <span class="mx-2">/</span>
  <a href="#" class="text-ami-blue hover:underline">Dashboard</a>
  <span class="mx-2">/</span>
  <span class="text-gray-900">Detalle Paciente</span>
</nav>
```

---

### 3.4 Buttons

**Primario** (Turquoise):
```html
<button class="px-6 py-2 bg-ami-turquoise text-white font-medium rounded-lg 
               hover:bg-ami-light-turquoise transition">
  Guardar Cambios
</button>
```

**Secundario** (Gray):
```html
<button class="px-6 py-2 bg-gray-200 text-gray-900 font-medium rounded-lg 
               hover:bg-gray-300 transition">
  Cancelar
</button>
```

**Danger** (Red):
```html
<button class="px-6 py-2 bg-ami-red text-white font-medium rounded-lg 
               hover:bg-red-600 transition">
  Eliminar
</button>
```

**Con icono:**
```html
<button class="flex items-center space-x-2 px-4 py-2 bg-ami-turquoise text-white rounded">
  <i class="fas fa-plus"></i>
  <span>Agregar Clínica</span>
</button>
```

---

### 3.5 Inputs y Form

```html
<!-- Input texto -->
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Clínica</label>
  <input type="text" 
         class="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-ami-turquoise focus:border-transparent"
         placeholder="Ej: Clínica Central">
</div>

<!-- Select -->
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
  <select class="w-full px-4 py-2 border border-gray-300 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-ami-turquoise">
    <option>Seleccionar...</option>
    <option>Servicios Clínicos</option>
    <option>Administrativo</option>
  </select>
</div>

<!-- Checkbox -->
<label class="flex items-center space-x-2 mb-4">
  <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-ami-turquoise">
  <span class="text-sm text-gray-700">Activo</span>
</label>

<!-- Radio buttons -->
<div class="space-y-2">
  <label class="flex items-center space-x-2">
    <input type="radio" name="priority" class="w-4 h-4 text-ami-turquoise">
    <span class="text-sm">Alta prioridad</span>
  </label>
  <label class="flex items-center space-x-2">
    <input type="radio" name="priority" class="w-4 h-4 text-ami-turquoise">
    <span class="text-sm">Baja prioridad</span>
  </label>
</div>
```

---

### 3.6 Tables

```html
<div class="bg-white rounded-lg shadow overflow-hidden">
  <table class="w-full">
    <!-- Header -->
    <thead class="bg-gray-50 border-b border-gray-200">
      <tr>
        <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
        <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ciudad</th>
        <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Capacidad</th>
        <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
      </tr>
    </thead>
    <!-- Body -->
    <tbody class="divide-y divide-gray-200">
      <tr class="hover:bg-gray-50 transition">
        <td class="px-6 py-4 text-sm text-gray-900">Clínica Central</td>
        <td class="px-6 py-4 text-sm text-gray-600">Madrid</td>
        <td class="px-6 py-4 text-sm">
          <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
            120 pacientes
          </span>
        </td>
        <td class="px-6 py-4 text-sm space-x-2">
          <button class="text-ami-turquoise hover:underline">Editar</button>
          <button class="text-ami-red hover:underline">Eliminar</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 3.7 Modal / Dialog

```html
<!-- Overlay -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <!-- Modal -->
  <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
    <!-- Header -->
    <div class="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <h2 class="text-lg font-bold text-gray-900">Agregar Clínica</h2>
      <button class="text-gray-500 hover:text-gray-700">
        <i class="fas fa-times text-xl"></i>
      </button>
    </div>
    <!-- Body -->
    <div class="px-6 py-4">
      <!-- Form fields aquí -->
    </div>
    <!-- Footer -->
    <div class="border-t border-gray-200 px-6 py-4 flex justify-end space-x-2">
      <button class="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300">
        Cancelar
      </button>
      <button class="px-4 py-2 bg-ami-turquoise text-white rounded-lg hover:bg-ami-light-turquoise">
        Guardar
      </button>
    </div>
  </div>
</div>
```

---

### 3.8 Cards

```html
<div class="bg-white rounded-lg border border-gray-200 p-6 shadow hover:shadow-md transition">
  <!-- Header -->
  <div class="flex justify-between items-start mb-4">
    <div>
      <h3 class="text-lg font-semibold text-gray-900">Clínica Central</h3>
      <p class="text-sm text-gray-500 mt-1">Ubicación: Madrid</p>
    </div>
    <span class="px-2 py-1 bg-ami-turquoise text-white text-xs font-medium rounded">
      Activa
    </span>
  </div>
  <!-- Content -->
  <div class="mb-4">
    <p class="text-sm text-gray-700">Capacidad: <strong>120 pacientes/día</strong></p>
    <p class="text-sm text-gray-700">Horario: <strong>8:00 AM - 6:00 PM</strong></p>
  </div>
  <!-- Footer -->
  <div class="flex space-x-2">
    <button class="flex-1 px-3 py-2 bg-ami-turquoise text-white text-sm rounded hover:bg-ami-light-turquoise">
      Editar
    </button>
    <button class="flex-1 px-3 py-2 bg-gray-100 text-gray-900 text-sm rounded hover:bg-gray-200">
      Ver detalles
    </button>
  </div>
</div>
```

---

### 3.9 Badges y Status

```html
<!-- Status badge -->
<span class="px-3 py-1 rounded-full text-xs font-medium
            bg-green-100 text-green-800">
  Completado
</span>

<span class="px-3 py-1 rounded-full text-xs font-medium
            bg-amber-100 text-amber-800">
  En progreso
</span>

<span class="px-3 py-1 rounded-full text-xs font-medium
            bg-gray-100 text-gray-800">
  Pendiente
</span>

<span class="px-3 py-1 rounded-full text-xs font-medium
            bg-orange-100 text-orange-800">
  Bloqueado
</span>
```

---

### 3.10 Toast / Notificaciones

```html
<!-- Success -->
<div class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg 
            flex items-center space-x-2 z-50">
  <i class="fas fa-check-circle"></i>
  <span>Guardado correctamente</span>
</div>

<!-- Error -->
<div class="fixed bottom-4 right-4 bg-ami-red text-white px-6 py-3 rounded-lg shadow-lg 
            flex items-center space-x-2 z-50">
  <i class="fas fa-exclamation-circle"></i>
  <span>Error al guardar</span>
</div>

<!-- Warning -->
<div class="fixed bottom-4 right-4 bg-amber-500 text-white px-6 py-3 rounded-lg shadow-lg 
            flex items-center space-x-2 z-50">
  <i class="fas fa-exclamation-triangle"></i>
  <span>Campos requeridos sin completar</span>
</div>
```

---

## 4. Layouts

### 4.1 Layout Principal (Con Sidebar)

```html
<div class="flex h-screen">
  <!-- Sidebar -->
  <aside class="w-64 bg-ami-purple text-white flex flex-col">
    <div class="p-4 border-b border-purple-700">
      <h2 class="font-bold text-lg">Menú</h2>
    </div>
    <nav class="flex-1 p-4 space-y-2">
      <a href="#" class="block px-4 py-2 rounded hover:bg-purple-700">Dashboard</a>
      <a href="#" class="block px-4 py-2 rounded hover:bg-purple-700">Clínicas</a>
      <a href="#" class="block px-4 py-2 rounded hover:bg-purple-700">Servicios</a>
    </nav>
  </aside>
  
  <!-- Main -->
  <main class="flex-1 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b">...</header>
    <!-- Content -->
    <div class="flex-1 overflow-auto p-8">
      <div class="max-w-7xl mx-auto">
        {/* Page content */}
      </div>
    </div>
  </main>
</div>
```

### 4.2 Layout Sin Sidebar (Login, etc)

```html
<div class="min-h-screen bg-gradient-to-br from-ami-purple to-ami-turquoise 
            flex items-center justify-center">
  <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
    <!-- Form content -->
  </div>
</div>
```

---

## 5. Responsiveness

**Breakpoints Tailwind:**
```
sm: 640px   (tablets pequeños)
md: 768px   (tablets)
lg: 1024px  (laptops)
xl: 1280px  (desktops)
2xl: 1536px (pantallas grandes)
```

**Grid automática:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards se apilan en mobile, 2 en tablet, 3 en desktop -->
</div>
```

**Sidebar colapsable en mobile:**
```html
<div class="flex">
  <aside class="hidden lg:block w-64 bg-ami-purple...">
    <!-- Sidebar oculto en mobile -->
  </aside>
  <main class="flex-1">
    <!-- Hamburger menu para mobile -->
  </main>
</div>
```

---

## 6. Flujos de Usuario (Visual)

### 6.1 Login Flow

```
┌─────────────────────────────────────────┐
│  Login Page (gradient background)        │
│  ├─ Logo + Branding (AMI)               │
│  ├─ Email input                         │
│  ├─ Password input                      │
│  ├─ "Recordarme" checkbox               │
│  ├─ "Olvidé contraseña" link            │
│  └─ Botón "Ingresar" (ami-turquoise)   │
└─────────────────────────────────────────┘
        ↓ (si credenciales válidas)
┌─────────────────────────────────────────┐
│  Dashboard (Main Layout)                 │
│  ├─ Header (sticky)                     │
│  ├─ Navigation tabs                     │
│  └─ Content area (por tab)              │
└─────────────────────────────────────────┘
```

### 6.2 CRUD Flow (Ejemplo: Clínicas)

```
┌──────────────────────────────────┐
│  Tabla de Clínicas               │
│  ├─ Search/Filter               │
│  ├─ Tabla (sortable cols)        │
│  └─ Botón "+ Agregar Clínica"   │
└──────────────────────────────────┘
        ↓ (click en "+ Agregar")
┌──────────────────────────────────┐
│  Modal: Agregar Clínica          │
│  ├─ Nombre (input)               │
│  ├─ Dirección (input)            │
│  ├─ Ciudad (select)              │
│  ├─ Horarios (time pickers)      │
│  ├─ Capacidad (number)           │
│  └─ Botones: Cancelar / Guardar  │
└──────────────────────────────────┘
        ↓ (click "Guardar")
┌──────────────────────────────────┐
│  Toast: "Guardado correctamente" │
│  Tabla actualiza con nuevo dato  │
└──────────────────────────────────┘
```

---

## 7. Iconografía

**Librería:** FontAwesome 6.0

**Iconos usados en RD-AMI:**
```
Dashboard:        fas fa-chart-dashboard
Recepción:        fas fa-clipboard-list
Examen:           fas fa-stethoscope
Estudios:         fas fa-upload
Validación:       fas fa-user-md
Reportes:         fas fa-file-pdf
Papeletas:        fas fa-list
Empresas:         fas fa-building
Expedientes:      fas fa-folder-open
Bitácora:         fas fa-history
Analytics:        fas fa-chart-line
Agregar:          fas fa-plus
Editar:           fas fa-edit
Eliminar:         fas fa-trash
Guardar:          fas fa-save
Cancelar:         fas fa-times
Buscar:           fas fa-search
```

---

## 8. Animaciones y Transiciones

**Transiciones Tailwind:**
```html
<!-- Hover effects -->
<button class="hover:bg-ami-light-turquoise transition">...</button>

<!-- Smooth transitions -->
<div class="transition-all duration-300 ease-in-out">...</div>

<!-- Scale on hover -->
<div class="hover:scale-105 transition-transform">...</div>

<!-- Opacity -->
<div class="opacity-0 hover:opacity-100 transition-opacity">...</div>
```

---

## 9. Accesibilidad

**Minimum requirements:**
- [ ] WCAG AA compliance (contrast ratio ≥ 4.5:1)
- [ ] Semantic HTML (`<button>`, `<label>`, `<nav>`)
- [ ] ARIA attributes (`aria-label`, `aria-describedby`)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus visible (`:focus-visible`)
- [ ] Alt text en imágenes

---

## 10. Performance

**Optimizaciones:**
- [ ] Images: WebP + lazy loading
- [ ] Fonts: Sistema (sans-serif) o google fonts cacheados
- [ ] CSS: Tailwind purge (solo clases usadas)
- [ ] JS: Code splitting, lazy routes
- [ ] Assets: Minify CSS/JS

---

## 11. Implementación en Storybook

```markdown
### Estructura de Stories

.
├── stories/
│   ├── Button.stories.tsx
│   ├── Input.stories.tsx
│   ├── Modal.stories.tsx
│   ├── Table.stories.tsx
│   ├── Card.stories.tsx
│   ├── Badge.stories.tsx
│   ├── Toast.stories.tsx
│   ├── Layout.stories.tsx
│   └── Forms.stories.tsx
```

---

## Resumen para FASE 0

**Tecnología:**
- Tailwind CSS (utility-first, colors configurados)
- shadcn/ui (componentes headless)
- Next.js 14 (App Router)
- FontAwesome 6.0 (iconos)

**Colores principales:**
- Primario: `#00B5A5` (turquoise)
- Secundario: `#7B2D8E` (purple)
- Texto: `#4A5568` (dark-gray)

**Componentes core:**
1. Header (sticky) + Navigation tabs
2. Buttons (primary, secondary, danger)
3. Inputs, selects, checkboxes, radios
4. Tables con acciones
5. Modals para CRUD
6. Cards
7. Badges (status)
8. Toasts (notificaciones)
9. Layouts (con/sin sidebar)
10. Responsive mobile-first

**Flujos visuales:**
- Login → Dashboard
- CRUD genérico → Modal → Tabla actualizada

---

**🏗️ REFERENCE:** LEGACY `RD-AMI` (4,146 líneas HTML, colores/componentes validados)  
**✍️ DOCUMENT:** SPEC-UI-DESIGN-SYSTEM.md  
**📅 APLICA A:** FASE 0 y todas las fases posteriores
