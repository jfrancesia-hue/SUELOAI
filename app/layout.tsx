import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

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
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Suelo — Invertí en lo que pisás',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suelo — Invertí en lo que pisás',
    description: 'Plataforma LATAM de inversión inmobiliaria con IA personal.',
    images: ['/og-image.png'],
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
        {children}
      </body>
    </html>
  );
}
