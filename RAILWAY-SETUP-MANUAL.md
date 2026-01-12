# Railway Setup - Instrucciones Actualizadas (2026)

## 📍 Proyecto Creado en Railway

**Nombre:** `ami-system-prod`
**URL:** https://railway.app/project/0fd6b96a-621a-496c-9bfb-b5f996c13baa

---

## 🛠️ Pasos Actuales para Railway (Dashboard)

### 1. Accede al Dashboard
- URL: https://railway.app/project/0fd6b96a-621a-496c-9bfb-b5f996c13baa
- Verifica estar en workspace correcto

### 2. Crear Servicio PostgreSQL

**Opción A - Desde Dashboard (Recomendado):**
1. Click en **"+ Create"** (botón grande en el dashboard)
2. Selecciona **"Database"** → **"PostgreSQL"**
3. El servicio se crea automáticamente
4. Espera a que muestre status **"Running"** (verde)

**Opción B - Desde Templates:**
1. Click en **"Add Service"** → **"Databases"**
2. Elige **"PostgreSQL"**
3. Configura versión (recomendado: 15+)

### 3. Obtener DATABASE_URL

Una vez el servicio esté **"Running"**:

1. Click en el servicio PostgreSQL que apareció
2. Busca la pestaña **"Variables"** o **"Connect"**
3. Copia el valor de `DATABASE_URL` (formato: `postgresql://user:password@host:port/database`)

**Alternativa:** Si no ves `DATABASE_URL` automáticamente:
- Click en el servicio
- Tab "Data"
- Verifica la conexión está activa
- Railway genera automáticamente `DATABASE_URL` en variables

### 4. Guardar DATABASE_URL Localmente

```bash
# En .env.production
DATABASE_URL="postgresql://user:password@host:port/railway"
```

---

## ✅ Verificación en Local

Cuando tengas la URL:

```bash
# Prueba conexión
pnpm prisma db push

# O ejecuta migraciones
pnpm prisma migrate dev --name init
```

---

## 📞 Próximo Paso

1. ✅ PostgreSQL creado y en estado "Running"
2. ✅ `DATABASE_URL` copiada
3. 📨 Comparte la URL conmigo
4. Yo ejecuto migraciones y verifico tablas de MOD-CITAS

---

**Enlace directo:** https://railway.app/project/0fd6b96a-621a-496c-9bfb-b5f996c13baa
