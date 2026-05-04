'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { cn } from '@/utils/helpers';
import type { Profile } from '@/types';
import {
  Sprout, LayoutDashboard, Building2, Wallet, Store, FileCheck,
  LogOut, Menu, X, ChevronRight, User, Bitcoin, Users, Receipt,
  RefreshCcw, Sparkles, Bell, Gift, Settings, MessageCircle,
  Landmark, ShieldCheck,
} from 'lucide-react';

interface SidebarProps { profile: Profile; }

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const investorLinks = [
    { href: '/investor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ai-analyst', label: 'Mi Analista IA', icon: Sparkles, badge: 'AI', highlight: true },
    { href: '/marketplace', label: 'Marketplace', icon: Store },
    { href: '/fideicomisos', label: 'Fideicomisos', icon: Landmark, badge: 'SAFE' },
    { section: 'Finanzas' },
    { href: '/wallet', label: 'Mi Billetera', icon: Wallet },
    { href: '/wallet/crypto', label: 'Crypto', icon: Bitcoin, badge: 'NEW' },
    { href: '/secondary-market', label: 'Mercado Secundario', icon: RefreshCcw },
    { section: 'Cuenta' },
    { href: '/verify', label: 'Verificar contrato', icon: ShieldCheck, badge: 'HASH', verify: true },
    { href: '/referrals', label: 'Referidos', icon: Gift },
    { href: '/notifications', label: 'Notificaciones', icon: Bell },
    { href: '/settings', label: 'Ajustes', icon: Settings },
  ];

  const developerLinks = [
    { href: '/developer', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ai-analyst', label: 'Suelo AI', icon: Sparkles, badge: 'AI', highlight: true },
    { href: '/projects', label: 'Mis Proyectos', icon: Building2 },
    { href: '/fideicomisos', label: 'Fideicomisos', icon: Landmark, badge: 'SAFE' },
    { href: '/marketplace', label: 'Marketplace', icon: Store },
    { section: 'CRM' },
    { href: '/crm', label: 'CRM', icon: Users, badge: 'PRO' },
    { href: '/crm/pipeline', label: 'Pipeline', icon: LayoutDashboard },
    { section: 'Finanzas' },
    { href: '/wallet', label: 'Billetera', icon: Wallet },
    { href: '/wallet/crypto', label: 'Crypto', icon: Bitcoin, badge: 'NEW' },
    { href: '/invoicing', label: 'Facturación', icon: Receipt },
    { section: 'Cuenta' },
    { href: '/verify', label: 'Verificar contrato', icon: ShieldCheck, badge: 'HASH', verify: true },
    { href: '/notifications', label: 'Notificaciones', icon: Bell },
    { href: '/settings', label: 'Ajustes', icon: Settings },
  ];

  const links: any[] = profile.role === 'developer' ? developerLinks : investorLinks;

  const handleLogout = async () => {
    await fetch('/api/demo/logout', { method: 'POST' }).catch(() => null);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Suelo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white via-brand-200 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Sprout className="w-5 h-5 text-[#03130D]" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-surface-900 leading-none block">
              Suelo
            </span>
            <span className="text-[10px] text-surface-500 leading-tight">
              Inversión inteligente
            </span>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="liquid-glass flex items-center gap-3 rounded-2xl px-3 py-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <User className="w-4 h-4 text-brand-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-surface-900 truncate">
              {profile.full_name || 'Sin nombre'}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-surface-500 capitalize">{profile.role}</p>
              {profile.kyc_verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-brand-500">
                  <Sparkles className="w-2.5 h-2.5" />
                  KYC
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {links.map((item, i) => {
          if (item.section) {
            return (
              <p key={`section-${i}`} className="text-[10px] font-semibold text-white/38 uppercase tracking-wider px-3 pt-4 pb-1.5">
                {item.section}
              </p>
            );
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-white text-black shadow-[0_16px_34px_-24px_rgba(255,255,255,0.75)]'
                  : item.highlight
                    ? 'liquid-glass text-white border border-white/10 hover:bg-white/[0.04]'
                    : item.verify
                      ? 'bg-cyan-400/10 text-cyan-100 ring-1 ring-cyan-300/25 hover:bg-cyan-300/15 hover:text-white'
                      : 'text-white/62 hover:text-white hover:bg-white/[0.06]'
              )}
            >
              <Icon className={cn(
                'w-4 h-4 shrink-0',
                item.highlight && !isActive && 'text-brand-300',
                item.verify && !isActive && 'text-cyan-200'
              )} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={cn(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded',
                  item.badge === 'AI'
                    ? 'bg-gradient-to-r from-brand-500 to-amber-500 text-white'
                    : item.badge === 'NEW'
                      ? 'bg-brand-500 text-white'
                      : item.badge === 'HASH'
                        ? 'bg-cyan-300 text-[#03131A]'
                        : 'bg-purple-500/20 text-purple-300'
                )}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/46 hover:text-red-200 hover:bg-red-500/10 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass h-14 flex items-center px-4">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-surface-200/50">
          <Menu className="w-5 h-5 text-surface-600" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Sprout className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-sm text-surface-900">Suelo</span>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#080D12]/95 border-r border-white/10 animate-slide-down">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface-200/50">
              <X className="w-4 h-4 text-surface-500" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-[#080D12]/92 border-r border-white/10 z-30 shadow-[24px_0_80px_-64px_rgba(0,0,0,1)] backdrop-blur-2xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.92)), url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=70&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.10),transparent_45%,rgba(6,182,212,0.06))]" />
        <div className="relative h-full">
        <SidebarContent />
        </div>
      </div>
    </>
  );
}
