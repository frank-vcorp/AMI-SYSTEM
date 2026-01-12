# Dossier Técnico

## Decisiones técnicas
- UI/UX web: Next.js + TypeScript + Tailwind CSS + shadcn/ui (Radix UI) + Framer Motion.
- Mobile (cuando aplique): Expo (React Native) + NativeWind.
- Accesibilidad: priorizar componentes accesibles (Radix UI/Headless UI) y cumplimiento ARIA.
- Ecosistema Google (cuando aplique): Google Cloud (GCP) y Firebase como opciones de plataforma (Hosting, Functions, Firestore/Storage/Auth), manteniendo independencia de proveedor mediante adaptadores.


## Supuestos
- Disponibilidad de Node.js LTS y npm/yarn en entornos de desarrollo.
- Acceso a OpenAI (Aria/Inés) y secreto OPENAI_API_KEY configurado en Continue Hub.
- Cuando haya PDFs escaneados, se hará OCR previo si se requieren.
- Acceso a cuentas/proyectos de GCP/Firebase con permisos adecuados cuando se elijan.


## Riesgos
- Indisponibilidad de gpt-5; fallback a gpt-4o impacta tiempos de generación pero no bloquea.
- Debida diligencia de licencias de librerías (shadcn/ui, Radix UI, etc.).
- Desalineación de diseño si no se aplica un sistema de diseño consistente.
- Acoplamiento a servicios gestionados; mitigar con interfaces/puertos y documentación de migración.


## Enlaces
- Tailwind CSS: https://tailwindcss.com/
- shadcn/ui: https://ui.shadcn.com/
- Radix UI: https://www.radix-ui.com/
- Next.js: https://nextjs.org/
- Framer Motion: https://www.framer.com/motion/
- Expo: https://expo.dev/
- NativeWind: https://www.nativewind.dev/
- Firebase: https://firebase.google.com/
- Google Cloud: https://cloud.google.com/
