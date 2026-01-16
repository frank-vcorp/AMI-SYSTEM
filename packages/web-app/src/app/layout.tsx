import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import RootLayoutClient from './layout-client';
import './globals.css';

export const metadata: Metadata = {
  title: 'AMI-SYSTEM - Residente Digital con IA',
  description: 'Sistema modular de gestión de salud ocupacional',
  viewport: 'width=device-width, initial-scale=1',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-gray-50">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
