'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Sparkles, Wallet, X } from 'lucide-react';

const navItems = [
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Confianza', href: '#confianza' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Analista IA', href: '#analista-ia' },
  { label: 'Simulador', href: '#simulador' },
];

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
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/[0.06] bg-[#07111F]/72 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 to-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.4),0_8px_20px_-4px_rgba(16,185,129,0.4)] transition-shadow group-hover:shadow-[0_0_0_1px_rgba(16,185,129,0.6),0_10px_24px_-4px_rgba(16,185,129,0.55)]">
              <span className="text-base font-bold text-[#03130D]">S</span>
            </div>
            <span className="font-display text-[19px] font-semibold tracking-[-0.01em] text-white">
              Suelo<span className="text-emerald-300">.ai</span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 md:flex">
            {navItems.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-white/62 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/wallet" className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.055] px-4 py-2.5 text-[13px] font-semibold text-white/78 transition-colors hover:bg-white/[0.09] hover:text-white">
              <Wallet className="h-3.5 w-3.5 text-emerald-300" strokeWidth={2} />
              Billetera
            </Link>
            <Link href="/login" className="px-4 py-2 text-[13px] font-medium text-white/62 transition-colors hover:text-white">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-b from-emerald-300 to-emerald-500 px-5 py-2.5 text-[13px] font-semibold text-[#03130D] shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_0_0_1px_rgba(16,185,129,0.4),0_8px_20px_-4px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-px hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_0_0_1px_rgba(16,185,129,0.55),0_10px_24px_-4px_rgba(16,185,129,0.55)] active:translate-y-0"
            >
              <Sparkles className="h-3 w-3" strokeWidth={2} />
              Probá gratis
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white md:hidden"
            aria-label="Menú"
          >
            {isOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="animate-slide-down border-t border-white/[0.06] bg-[#07111F]/96 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-4 py-4">
            {navItems.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.05] hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="space-y-2 border-t border-white/[0.06] pt-3">
              <Link href="/wallet" className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-4 py-2.5 text-center text-sm font-medium text-white/80">
                <Wallet className="h-4 w-4 text-emerald-300" />
                Billetera
              </Link>
              <Link href="/login" className="block w-full rounded-lg border border-white/10 bg-white/[0.055] px-4 py-2.5 text-center text-sm font-medium text-white/80">
                Iniciar sesión
              </Link>
              <Link href="/register" className="block w-full rounded-lg bg-gradient-to-b from-emerald-300 to-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-[#03130D]">
                Probá gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
