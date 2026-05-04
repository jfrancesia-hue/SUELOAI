'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Clock3, Globe2, Play, ShieldCheck } from 'lucide-react';
import { AssemblingBuildingScene } from '@/components/landing/AssemblingBuildingScene';
import { BlurText } from '@/components/landing/BlurText';

const partnerNames = ['Nativos', 'Supabase', 'Polygon', 'Mercado Pago', 'Claude'];

const stats = [
  {
    icon: Clock3,
    value: '34.5 Min',
    label: 'tiempo promedio analizando deals',
  },
  {
    icon: Globe2,
    value: '2.8B+',
    label: 'mercado LATAM en activos reales',
  },
];

export function Hero() {
  const reduceMotion = useReducedMotion();

  const entrance = {
    initial: {
      filter: reduceMotion ? 'blur(0px)' : 'blur(10px)',
      opacity: 0,
      y: reduceMotion ? 0 : 20,
    },
    animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0.01 : 0.75, ease: 'easeOut' },
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      <AssemblingBuildingScene />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-4 pt-24">
          <div className="flex w-full max-w-5xl flex-col items-center text-center">
            <motion.div
              {...entrance}
              transition={{ ...entrance.transition, delay: 0.4 }}
              className="liquid-glass mb-6 inline-flex max-w-full items-center gap-2 rounded-full px-1.5 py-1.5"
            >
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                Nuevo
              </span>
              <span className="pr-3 text-sm font-light text-white/90">
                Fideicomisos, wallet y analista IA para invertir desde USD 100
              </span>
            </motion.div>

            <BlurText
              as="h1"
              text="Invertí en lo que pisás con visión de futuro"
              className="flex max-w-3xl flex-wrap justify-center gap-y-[0.1em] font-serif text-6xl italic leading-[0.8] tracking-[-4px] text-white md:text-7xl lg:text-[5.5rem]"
            />

            <motion.p
              {...entrance}
              transition={{ ...entrance.transition, delay: 0.8 }}
              className="mt-5 max-w-2xl font-body text-sm font-light leading-tight text-white md:text-base"
            >
              Descubrí proyectos inmobiliarios reales con scoring IA, contratos verificables y una experiencia financiera creada para que cada decisión se sienta clara, segura y extraordinaria.
            </motion.p>

            <motion.div
              {...entrance}
              transition={{ ...entrance.transition, delay: 1.1 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-6"
            >
              <Link
                href="/register"
                className="liquid-glass-strong inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
              >
                Probá tu analista IA
                <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-sm font-medium text-white"
              >
                Ver proyectos
                <Play className="h-4 w-4 fill-current" strokeWidth={0} />
              </Link>
            </motion.div>

            <motion.div
              {...entrance}
              transition={{ ...entrance.transition, delay: 1.3 }}
              className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row"
            >
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={value} className="liquid-glass w-full rounded-[1.25rem] p-5 text-left sm:w-[220px]">
                  <Icon className="h-7 w-7 text-white" strokeWidth={1.5} />
                  <p className="mt-8 font-serif text-4xl italic leading-none tracking-[-1px] text-white">
                    {value}
                  </p>
                  <p className="mt-2 font-body text-xs font-light text-white">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          {...entrance}
          transition={{ ...entrance.transition, delay: 1.4 }}
          className="flex flex-col items-center gap-4 px-4 pb-8"
        >
          <div className="liquid-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 font-body text-xs font-medium text-white">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.7} />
            Colaborando con infraestructura financiera, legal e IA de primer nivel
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-3 font-serif text-2xl italic tracking-tight text-white md:gap-x-16 md:text-3xl">
            {partnerNames.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
