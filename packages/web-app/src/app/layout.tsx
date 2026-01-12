import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AMI-SYSTEM - Residente Digital con IA',
  description: 'Sistema modular de gestión de salud ocupacional',
  manifest: '/manifest.json',
  themeColor: '#00B5A5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
