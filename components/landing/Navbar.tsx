'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Fideicomisos', href: '#capacidades' },
  { label: 'Analista IA', href: '#analista-ia' },
  { label: 'Simulador', href: '#simulador' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-4 z-50 px-4 sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href="/"
          aria-label="Suelo home"
          className="suelo-nav-mark flex h-12 w-12 items-center justify-center rounded-full"
        >
          <span className="font-serif text-3xl italic leading-none text-white">s</span>
        </Link>

        <div className="suelo-nav-shell hidden items-center gap-1 rounded-full px-1.5 py-1.5 md:flex">
          {navItems.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="suelo-nav-link rounded-full px-3 py-2 font-body text-sm font-medium text-white/95"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/register"
            className="suelo-nav-cta inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 font-body text-sm font-semibold text-white"
          >
            Reservar lugar
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        <div className="hidden h-12 w-12 md:block" aria-hidden="true" />

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="suelo-nav-mark flex h-12 w-12 items-center justify-center rounded-full text-white md:hidden"
          aria-label="Menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="suelo-mobile-menu mx-auto mt-3 max-w-7xl rounded-[1.25rem] p-3 md:hidden">
          <div className="grid gap-1">
            {navItems.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setIsOpen(false)}
                className="suelo-nav-link rounded-full px-4 py-3 text-center font-body text-sm font-medium text-white/95"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="suelo-nav-cta mt-2 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 font-body text-sm font-semibold text-white"
            >
              Reservar lugar
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
