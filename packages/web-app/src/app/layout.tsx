import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import RootLayoutClient from './layout-client';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

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
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="bg-slate-50 font-inter">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
