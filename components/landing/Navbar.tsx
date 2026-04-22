'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface-50/70 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-[0_0_0_1px_rgba(0,200,83,0.4),0_8px_20px_-4px_rgba(0,200,83,0.4)] group-hover:shadow-[0_0_0_1px_rgba(0,200,83,0.6),0_10px_24px_-4px_rgba(0,200,83,0.55)] transition-shadow">
              <span className="text-white font-[700] text-base">S</span>
            </div>
            <span className="font-display font-[620] text-[19px] text-surface-900 tracking-[-0.01em]">
              Suelo<span className="text-brand-400">.ai</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {[
              { label: 'Proyectos', href: '#' },
              { label: 'Cómo Funciona', href: '#como-funciona' },
              { label: 'Analista IA', href: '#analista-ia' },
              { label: 'Seguridad', href: '#seguridad' },
              { label: 'FAQ', href: '#faq' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="px-3.5 py-2 text-[13px] font-[500] text-surface-700 hover:text-surface-900 transition-colors rounded-lg hover:bg-white/[0.04]"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-[13px] font-[520] text-surface-700 hover:text-surface-900 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-brand-400 to-brand-600 text-white text-[13px] font-[560] rounded-[10px] transition-all
                         shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_0_0_1px_rgba(0,200,83,0.4),0_8px_20px_-4px_rgba(0,200,83,0.4)]
                         hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_0_0_1px_rgba(0,200,83,0.55),0_10px_24px_-4px_rgba(0,200,83,0.55)]
                         hover:-translate-y-px active:translate-y-0"
            >
              <Sparkles className="w-3 h-3" strokeWidth={2} />
              Probá Gratis
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-surface-700 hover:text-surface-900 rounded-lg hover:bg-white/[0.04]"
            aria-label="Menú"
          >
            {isOpen ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-surface-50/95 backdrop-blur-xl border-t border-white/[0.06] animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {['Proyectos', 'Cómo Funciona', 'Analista IA', 'Seguridad', 'FAQ'].map((label) => (
              <Link
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, '-').replace('ó', 'o')}`}
                className="block px-4 py-2.5 text-sm font-[500] text-surface-700 hover:text-surface-900 rounded-lg hover:bg-white/[0.04]"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/[0.06] space-y-2">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-2.5 text-sm font-[520] bg-surface-100 rounded-lg border border-surface-200"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="block w-full text-center px-4 py-2.5 text-sm font-[560] text-white bg-gradient-to-b from-brand-400 to-brand-600 rounded-lg"
              >
                Probá Gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
