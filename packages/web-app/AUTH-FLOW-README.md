# Flujo de Autenticación - Web App AMI-SYSTEM

## 📋 Descripción

Implementación completa del flujo de autenticación (Login) en Next.js 14 con:
- Firebase Client SDK para autenticación en el cliente
- API routes para verificación segura de tokens en el servidor
- Context API + hooks para estado global de autenticación
- Middleware para protección de rutas autenticadas
- Manejo de errores y casos edge

## 🏗️ Arquitectura

### Flujo de Autenticación

```
Usuario en /login
  ↓
Ingresa email + password
  ↓
Firebase Client SDK: signInWithEmailAndPassword()
  ↓
Firebase devuelve idToken
  ↓
Enviar token a /api/auth/verify (POST)
  ↓
core-auth.verifyToken() valida en servidor
  ↓
Guardar token en HttpOnly cookie (seguro)
  ↓
Redirigir a /admin/clinicas
```

### Protección de Rutas

```
Acceso a /admin/*
  ↓
Middleware verifica cookie authToken
  ↓
¿Token válido?
  ├─ SÍ → Continuar a ruta
  └─ NO → Redirigir a /login
```

## 📦 Archivos Implementados

### 1. **Configuración de Firebase**
- `src/lib/firebase.ts` - Inicialización del SDK de Firebase Client
  - Setup de `getAuth()` con persistencia en localStorage
  - Soporte para Firebase Emulator en desarrollo

### 2. **Contexto y Hooks de Autenticación**
- `src/lib/auth-context.tsx` - AuthProvider + useAuth hook
  - Monitoreo del estado de autenticación (`onAuthStateChanged`)
  - Métodos: `login()`, `logout()`, acceso a `user` y `loading`
  - Manejo de errores en tiempo real

- `src/lib/use-auth-guard.ts` - Hook helper para componentes protegidos
  - Redirige automáticamente a /login si no hay autenticación
  - Útil en pages/components que requieren auth obligatoria

### 3. **Página de Login**
- `src/app/login/page.tsx` - Página de formulario de login
  - Validación de email y contraseña
  - Manejo de errores específicos (usuario no existe, contraseña incorrecta)
  - Redirección automática a /admin/clinicas después del login
  - Estilos con Tailwind (consistente con diseño del sistema)

### 4. **API Routes**
- `src/app/api/auth/verify/route.ts` - Verificación de token
  - POST: Recibe token de Firebase, lo valida con core-auth, guarda en HttpOnly cookie
  - GET: Verifica token actual (usado por middleware)

- `src/app/api/auth/logout/route.ts` - Cierre de sesión
  - POST: Elimina la cookie authToken

### 5. **Middleware**
- `src/middleware.ts` - Protección de rutas
  - Intercepta requests a `/admin/*`
  - Valida token en servidor
  - Redirige a /login si no está autenticado

### 6. **Layout Actualizado**
- `src/app/layout.tsx` - Envuelve app con AuthProvider
  - Permite usar `useAuth()` en cualquier componente cliente

### 7. **Página Principal Actualizada**
- `src/app/page.tsx` - Home con soporte para auth
  - Botón "Iniciar Sesión" si no está autenticado
  - Botón "Ir al Admin Panel" si está autenticado
  - Muestra email del usuario si está autenticado
  - Sección "Estado de Autenticación" con status de componentes

### 8. **Configuración**
- `package.json` - Agregada dependencia `firebase@^10.7.0`
- `.env.example` - Variables de entorno necesarias para Firebase

## 🔧 Configuración

### 1. Configurar Variables de Entorno

Copia `.env.example` a `.env.local` y completa con tus credenciales de Firebase:

```bash
# Copy el archivo de ejemplo
cp .env.example .env.local
```

Luego edita `.env.local` con tus valores de Firebase:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Nota**: Las variables con prefijo `NEXT_PUBLIC_` son públicas (visibles en el cliente).
> Nunca incluyas secretos o llaves privadas en el cliente.

### 2. Instalar Dependencias

```bash
# En la carpeta web-app
pnpm install
```

### 3. Configurar core-auth en el servidor

El archivo `src/app/api/auth/verify/route.ts` usa `@ami/core-auth` para validar tokens.

Asegúrate de que las variables de entorno del servidor están configuradas:

```dotenv
# En el .env.local del servidor (si aplica)
# Usa firebase-admin con tu service account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

## 🎯 Uso

### En Componentes Cliente

```tsx
'use client';

import { useAuth } from '@/lib/auth-context';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Bienvenido, {user?.email}</p>
          <button onClick={logout}>Cerrar sesión</button>
        </>
      ) : (
        <a href="/login">Iniciar sesión</a>
      )}
    </div>
  );
}
```

### Componentes Protegidos

```tsx
'use client';

import { useAuthGuard } from '@/lib/use-auth-guard';

export default function ProtectedComponent() {
  const { isReady } = useAuthGuard();

  if (!isReady) return <div>Verificando autenticación...</div>;

  return <div>Contenido solo para usuarios autenticados</div>;
}
```

## 🔐 Seguridad

### Implementaciones de Seguridad

1. **Token en HttpOnly Cookie**
   - El token se guarda en una cookie `HttpOnly` que no es accesible desde JavaScript
   - Protege contra XSS (Cross-Site Scripting)

2. **Validación en Servidor**
   - El middleware valida el token en cada request a rutas protegidas
   - `core-auth.verifyToken()` valida la firma JWT

3. **Persistencia Segura**
   - Firebase Client SDK usa localStorage para persistencia (configurable)
   - El token se recupera automáticamente al recargar la página

4. **Manejo de Errores**
   - Errores genéricos al usuario (no exposición de detalles internos)
   - Logs de errores en servidor para debugging

### Prácticas de Seguridad a Implementar

- [ ] Agregar rate limiting en `/api/auth/verify`
- [ ] Implementar refresh token rotation
- [ ] Agregar 2FA (Two-Factor Authentication) si es necesario
- [ ] Auditar logs de autenticación
- [ ] Configurar CORS correctamente

## 📱 Flujo de Usuario

### Login Exitoso

1. Usuario navega a `/login`
2. Ingresa email y contraseña
3. Click en "Iniciar Sesión"
4. Firebase autentica al usuario
5. Token enviado a `/api/auth/verify`
6. Token guardado en HttpOnly cookie
7. Redirige a `/admin/clinicas`
8. Middleware verifica token en siguientes requests

### Logout

1. Usuario click en "Cerrar sesión"
2. `signOut()` de Firebase
3. Cookie authToken eliminada
4. `useAuth()` actualiza estado a null
5. Componentes re-renderean sin usuario

### Token Expirado

1. Usuario intenta acceder a `/admin/*`
2. Middleware valida token en `/api/auth/verify` GET
3. Token inválido/expirado
4. Redirige a `/login` y elimina cookie
5. Usuario debe iniciar sesión de nuevo

## 🧪 Testing

### Test Manual - Login Exitoso

```bash
# 1. Iniciar dev server
pnpm dev

# 2. Navegar a http://localhost:3000/login
# 3. Ingresar credenciales válidas
# 4. Verificar que redirige a /admin/clinicas
```

### Test Manual - Protección de Rutas

```bash
# 1. Abrir navegador anónimo
# 2. Navegar a http://localhost:3000/admin/clinicas
# 3. Debe redirigir a /login
```

### Test Manual - Token Expirado

```bash
# 1. Iniciar sesión normalmente
# 2. Abrir DevTools > Application > Cookies
# 3. Modificar o eliminar cookie "authToken"
# 4. Recargar página
# 5. Debe redirigir a /login
```

## 📚 Referencias

- [Firebase JavaScript SDK](https://firebase.google.com/docs/auth/web/start)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [HTTP-only Cookies](https://developer.mozilla.org/es/docs/Web/HTTP/Headers/Set-Cookie#httponly)

## ⚠️ Próximos Pasos (GEMINI - Revisión)

- [ ] Verificar configuración de Firebase en producción
- [ ] Implementar refresh token rotation
- [ ] Agregar logging de auditoría
- [ ] Configurar rate limiting
- [ ] Pruebas E2E del flujo completo
- [ ] Documentar roles y permisos basados en Custom Claims

---

**Última actualización**: 2026-01-16 (Implementación Flujo Completo)
**Responsable**: SOFIA (Builder)
**Estado**: ✅ Completado (Listo para QA)
