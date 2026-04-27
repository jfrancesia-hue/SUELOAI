'use client';

import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { Building2, CircleDollarSign, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { ActivityTicker } from '@/components/ui/activity-ticker';
import { MetricCard } from '@/components/ui/metric-card';
import { PremiumCta } from '@/components/ui/premium-cta';

const LatamInvestmentMap = dynamic(() => import('@/components/3d/latam-investment-map'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[460px] rounded-[32px] border border-white/10 bg-[#07111F]/65 shadow-[0_30px_100px_-42px_rgba(16,185,129,0.38)]">
      <div className="h-full min-h-[460px] animate-pulse rounded-[32px] bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.24),transparent_34%),radial-gradient(circle_at_72%_62%,rgba(6,182,212,0.2),transparent_28%)]" />
    </div>
  ),
});

const activity = [
  'María invirtió USD 500 en Asunción',
  'Torre Horizonte alcanzó 72% de funding',
  'Carlos recibió su primera renta mensual',
  'Nuevo hash público verificado en Polygon',
  'Developer verificado en Montevideo',
];

export function Hero() {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#07111F] pt-24 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.20),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(6,182,212,0.16),transparent_32%),radial-gradient(circle_at_58%_78%,rgba(139,92,246,0.14),transparent_34%),linear-gradient(180deg,#07111F_0%,#111827_56%,#07111F_100%)]" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.08]" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-24 lg:pt-16">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: reduceMotion ? 0 : 0.08 }}
          className="max-w-3xl"
        >
          <motion.div
            variants={fadeUp}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/78 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] backdrop-blur-xl"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>
            Fintech inmobiliaria LATAM
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-[clamp(3.05rem,6vw,5.85rem)] font-[760] leading-[0.94] tracking-[-0.03em] text-[#F8FAFC]"
          >
            Invertí en
            <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-[#F5C542] bg-clip-text pb-2 font-serif italic font-[420] text-transparent">
              ladrillo real
            </span>
            <span className="block">desde USD 100</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl text-base leading-[1.65] text-white/66 md:text-lg"
          >
            Proyectos inmobiliarios curados, trazabilidad blockchain e inteligencia artificial para invertir con más confianza.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <PremiumCta href="/register">Empezar a invertir</PremiumCta>
            <PremiumCta href="/marketplace" variant="secondary">Ver proyectos</PremiumCta>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard
              icon={CircleDollarSign}
              label="Ticket mínimo"
              value="USD 100"
              detail="o 100 USDT"
              tone="emerald"
            />
            <MetricCard
              icon={ShieldCheck}
              label="Trazabilidad"
              value="Hash público"
              detail="Contrato verificable"
              tone="cyan"
            />
            <MetricCard
              icon={TrendingUp}
              label="Retorno objetivo"
              value="10-14%"
              detail="según proyecto"
              tone="gold"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96, y: reduceMotion ? 0 : 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.12 }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(circle_at_35%_10%,rgba(16,185,129,0.25),transparent_38%),radial-gradient(circle_at_80%_55%,rgba(6,182,212,0.18),transparent_34%)] blur-2xl" />
          <LatamInvestmentMap />
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10">
              <Building2 className="h-4 w-4 text-emerald-300" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Actividad reciente</p>
              <p className="text-xs text-white/45">Señales reales de confianza e inversión</p>
            </div>
          </div>
          <ActivityTicker items={activity} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
      <div className="pointer-events-none absolute bottom-12 right-8 hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-white/50 backdrop-blur-xl lg:flex">
        <Sparkles className="h-3.5 w-3.5 text-emerald-300" strokeWidth={2} />
        Invertí con información, no con intuición.
      </div>
    </section>
  );
}
