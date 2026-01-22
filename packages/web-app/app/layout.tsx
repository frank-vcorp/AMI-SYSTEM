import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AMI System - Medical Examination Management",
  description: "Sistema de Gestión de Exámenes Médicos con validación electrónica y generación de PDF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
