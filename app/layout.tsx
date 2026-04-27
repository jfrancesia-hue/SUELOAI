import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { FloatingAssistant } from '@/components/ai/FloatingAssistant';
import { SmoothScrollProvider } from '@/components/animations/SmoothScrollProvider';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://suelo.ai';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Suelo — Invertí en lo que pisás',
    template: '%s · Suelo',
  },
  description:
    'Plataforma latinoamericana de inversión inmobiliaria fraccionada con analista IA personal. Desde USD 100 o 100 USDT, construí tu patrimonio en proyectos reales.',
  keywords: [
    'inversión inmobiliaria',
    'real estate fraccionado',
    'Paraguay',
    'Argentina',
    'fintech LATAM',
    'proptech',
    'analista IA',
    'USDT',
    'tokenización',
    'Nativos Consultora',
  ],
  authors: [{ name: 'Nativos Consultora Digital' }],
  creator: 'Jorge Francesia',
  openGraph: {
    title: 'Suelo — Invertí en lo que pisás',
    description:
      'Inversión inmobiliaria fraccionada con IA personal para LATAM. Proyectos reales, contratos verificables, retornos transparentes.',
    url: APP_URL,
    siteName: 'Suelo',
    type: 'website',
    locale: 'es_LA',
    // OG image generado dinámicamente por app/opengraph-image.tsx (next/og)
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suelo — Invertí en lo que pisás',
    description: 'Plataforma LATAM de inversión inmobiliaria con IA personal.',
    // Twitter image generado dinámicamente por app/twitter-image.tsx (reutiliza OG)
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
  category: 'finance',
};

export const viewport: Viewport = {
  themeColor: '#00C853',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-surface-50 text-surface-900 antialiased">
        <div className="noise-overlay" />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <FloatingAssistant />
      </body>
    </html>
  );
}
