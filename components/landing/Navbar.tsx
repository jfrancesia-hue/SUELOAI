'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight, Sparkles } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
              <span className="text-white font-black text-base">S</span>
            </div>
            <span className="font-display font-bold text-xl text-surface-900 tracking-tight">
              Suelo<span className="text-brand-500">.ai</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {['Proyectos', 'Cómo Funciona', 'Analista IA', 'Verificar'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-').replace('ó', 'o')}`}
                className="px-4 py-2 text-sm text-surface-600 hover:text-surface-900 transition-colors rounded-lg hover:bg-surface-200/30"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Probá Gratis
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-200/30"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-t border-surface-200/50 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {['Proyectos', 'Cómo Funciona', 'Analista IA', 'Verificar'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="block px-4 py-2.5 text-sm text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-200/30"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="pt-3 border-t border-surface-200/50 space-y-2">
              <Link href="/login" className="block w-full btn-secondary text-sm text-center">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="block w-full btn-primary text-sm text-center">
                Probá Gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
