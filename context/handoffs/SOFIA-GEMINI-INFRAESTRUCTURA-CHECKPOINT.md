# INTERCONSULTA: Infraestructura Completada - Próximos Pasos

**ID:** GEMINI-SOFIA-INFRAESTRUCTURA-FINAL
**FECHA:** 2026-01-12
**STATUS:** Configuración Lista para Deployment
**Responsable Siguiente:** GEMINI (Finalización Firebase + Railway)

---

## ✅ Completado por SOFIA:

### 1. **Vercel**
- ✅ CLI Instalado (v50.1.6)
- ✅ Autenticado (usuario: frank-3582)
- ✅ Proyecto `web-app` vinculado
- ✅ Listo para deployment

**Archivo generado:** `.vercel/project.json` (en .gitignore)

### 2. **Firebase**
- ✅ CLI Instalado (v15.2.1)
- ✅ Autenticado (usuario: frank@vcorp.mx)
- ✅ **Proyecto NUEVO creado:** `ami-system-mvp` (aislado, dedicado)
- ✅ Configuración básica:
  - `.firebaserc` - Apunta a `ami-system-mvp`
  - `firebase.json` - Hosting, Storage, Firestore
  - `firestore.rules` - Reglas de seguridad
  - `storage.rules` - Reglas de Storage
  - `firestore.indexes.json` - Índices para queries

**Archivos generados en raíz:** `.firebaserc`, `firebase.json`, `*.rules`

### 3. **Variables de Entorno**
- ✅ `.env.production` - Configuración para produción (placeholder)
- ✅ `.env.example` - Template para desarrollo

**Nota:** Los valores de Firebase API KEY necesitan ser obtenidos manualmente de Firebase Console

### 4. **Railway CLI**
- ✅ CLI Instalado (v2.0.17)
- ⏳ **Pendiente:** Login interactivo

---

## 🔧 Próximos Pasos (GEMINI Responsibility):

### **Paso 1: Completar Firebase (30 min)**

1. Ir a Firebase Console: https://console.firebase.google.com/project/ami-system-mvp/overview
2. **Authentication:**
   - Habilitar "Email/Password"
   - Habilitar "Google Sign-In"
3. **Firestore:**
   - Crear BD en modo "Producción"
   - Región: `us-central` (o tu preferida)
4. **Storage:**
   - Crear bucket: `ami-system-mvp.appspot.com`
5. **Project Settings** → Copiar credenciales:
   - `Web API Key` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Auth Domain → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - Storage Bucket → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

6. Actualizar `.env.production` con valores reales
7. Ejecutar: `firebase deploy --only firestore:rules,storage`

### **Paso 2: Railway PostgreSQL (20 min)**

1. Login a Railway: `railway login`
2. Crear proyecto: `railway init --name ami-system-prod`
3. Agregar PostgreSQL: `railway add postgres`
4. Copiar `DATABASE_URL` a `.env.production`
5. Ejecutar localmente: `pnpm prisma migrate dev --name init`
6. Verifica que tablas de MOD-CITAS existen

### **Paso 3: Vercel Deployment (15 min)**

1. Configurar env vars en Vercel:
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
   vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   vercel env add NEXTAUTH_SECRET
   ```

2. Deploy: `vercel deploy --prod`

3. Smoke Test:
   - Navegar a URL de producción
   - Crear usuario (Firebase Auth)
   - Agendar cita (MOD-CITAS)
   - Verificar BD (Railway)

---

## 📋 Archivos Generados en Este Checkpoint

```
.firebaserc                 ← Configuración Firebase
firebase.json               ← Config Hosting/Firestore
firestore.rules             ← Reglas Firestore
storage.rules               ← Reglas Storage
firestore.indexes.json      ← Índices BD
.env.production             ← Variables producción (placeholder)
.env.example                ← Template para desarrollo
.vercel/                    ← Configuración Vercel (auto-generada)
```

---

## 🚨 Checklist Pre-Deployment

- [ ] Firebase Console - Auth habilitado
- [ ] Firebase Console - Firestore creado
- [ ] Firebase Console - Storage creado
- [ ] Railway - PostgreSQL creado y `DATABASE_URL` copiada
- [ ] `.env.production` - Todos los valores reales (no placeholders)
- [ ] `pnpm prisma migrate dev` ejecutado contra Railway
- [ ] Vercel env vars configuradas
- [ ] Vercel deploy: `vercel deploy --prod`
- [ ] Smoke test: usuario → cita → DB

---

## 📞 Contactos CLI

```bash
# Railway
railway login
railway projects:list
railway up

# Vercel
vercel whoami
vercel env list
vercel logs

# Firebase
firebase projects:list
firebase deploy
firebase logs
```

---

**Siguiente Paso:** GEMINI completa Firebase + Railway y reporta en checkpoint.
