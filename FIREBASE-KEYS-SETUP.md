# Firebase Setup - Extracción de Keys

**Proyecto:** `ami-system-mvp`
**Console:** https://console.firebase.google.com/project/ami-system-mvp/overview

---

## 📋 Pasos para Extraer Firebase Keys

### 1. Ir a Project Settings

1. Click en ⚙️ **Engranaje (Project Settings)** en la parte superior izquierda
2. Ir a pestaña **"Your apps"** o **"Web"**

### 2. Copiar Configuración Web

Si no hay app web creada:
- Click en `</> Web`
- Nombre: `ami-system`
- Copia el objeto de configuración

**Deberías ver algo como:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "ami-system-mvp.firebaseapp.com",
  projectId: "ami-system-mvp",
  storageBucket: "ami-system-mvp.appspot.com",
  messagingSenderId: "710280862790",
  appId: "1:710280862790:web:abcdef1234567890abcdef"
};
```

### 3. Mapear a Variables de Entorno

| Firebase Config | Variable de Entorno |
|-----------------|-------------------|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

---

## 🔐 Habilitar Servicios en Firebase

Mientras copias keys, también habilita:

1. **Authentication:**
   - Ir a **Build → Authentication**
   - Click "Get Started"
   - Habilitar **Email/Password**
   - Habilitar **Google Sign-In**

2. **Firestore Database:**
   - Ir a **Build → Firestore Database**
   - Click "Create Database"
   - Modo: **Production**
   - Región: **us-central** (o tu preferida)
   - Las reglas ya están en `firestore.rules`

3. **Storage:**
   - Ir a **Build → Storage**
   - Click "Get Started"
   - El bucket se crea automáticamente

---

## 📝 Actualizar .env.production

Una vez tengas las keys, actualiza:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY="tu-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="ami-system-mvp.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="ami-system-mvp"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="ami-system-mvp.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="710280862790"
NEXT_PUBLIC_FIREBASE_APP_ID="1:710280862790:web:..."
```

---

## 🚀 Resultado Final

Con todo configurado:
- ✅ Firestore BD lista
- ✅ Storage lista
- ✅ Auth (Email + Google) lista
- ✅ Variables en .env.production
- ✅ Listo para Vercel deployment

---

**Comparte los valores una vez los tengas y yo actualizo .env.production** 📋
