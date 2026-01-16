/**
 * Configuración de Firebase Client SDK
 * Inicializa la autenticación con Firebase
 */
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
  type Auth
} from 'firebase/auth';

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase solo si no está inicializado
let auth: Auth;

const initializeFirebaseAuth = () => {
  const apps = getApps();
  
  if (apps.length === 0) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Configurar persistencia de sesión (localStorage)
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error configurando persistencia:', error);
    });
    
    // Conectar al emulador en desarrollo si está disponible
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
      } catch (e) {
        // El emulador ya está conectado o no está disponible
      }
    }
  } else {
    auth = getAuth(apps[0]);
  }
  
  return auth;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    initializeFirebaseAuth();
  }
  return auth;
};

export default getFirebaseAuth();
