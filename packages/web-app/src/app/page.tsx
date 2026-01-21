/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * Página inicial - Redirect automático a /admin
 * MVP Demo: Acceso directo al dashboard administrativo
 */
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/admin");
}
