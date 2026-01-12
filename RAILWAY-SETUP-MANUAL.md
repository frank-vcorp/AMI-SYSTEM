# Railway Setup - Instrucciones Manuales

## 📍 Proyecto Creado en Railway

**Nombre:** `ami-system-prod`
**URL:** https://railway.com/project/0fd6b96a-621a-496c-9bfb-b5f996c13baa

---

## 🛠️ Pasos para Completar (Manual via Dashboard)

### 1. Crear Servicio PostgreSQL

1. Ir al dashboard del proyecto: https://railway.app/project/0fd6b96a-621a-496c-9bfb-b5f996c13baa
2. Hacer clic en **"+ Add"** o **"+ New Service"**
3. Seleccionar **"PostgreSQL"**
4. Esperar a que el servicio esté healthy (verde ✓)

### 2. Obtener DATABASE_URL

1. En el servicio PostgreSQL, hacer clic en **"Connect"**
2. Copiar la `Database URL` completa (formato: `postgresql://user:password@host:port/db`)
3. Guardarla en tu `.env.production`:
   ```bash
   DATABASE_URL="postgresql://..."
   ```

### 3. Crear Variables de Entorno en Railway

Desde el dashboard del proyecto:

**Variables de Desarrollo (dev environment):**
- `DATABASE_URL` → (copiar del paso anterior)
- `POSTGRES_USER` → user
- `POSTGRES_PASSWORD` → password
- `POSTGRES_DB` → ami_system

---

## ✅ Verificación

Una vez PostgreSQL esté healthy:

```bash
# Local
pnpm prisma migrate dev --name init

# Esto crea todas las tablas en Railway PostgreSQL
```

---

## 📞 Próximo Paso

Una vez hayas completado:
1. Avísame cuando PostgreSQL esté healthy en Railway
2. Comparte la `DATABASE_URL` de Railway
3. Yo ejecuto `pnpm prisma migrate dev` y verifico que las tablas de MOD-CITAS existan

---

**Enlace directo al proyecto:** https://railway.app/project/0fd6b96a-621a-496c-9bfb-b5f996c13baa
