'use client';

import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { cn } from '@/utils/helpers';

type RiskBadgeProps = {
  risk: 'Bajo' | 'Medio' | 'Alto';
  className?: string;
};

const riskMap = {
  Bajo: {
    icon: ShieldCheck,
    className: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  },
  Medio: {
    icon: ShieldQuestion,
    className: 'border-[#F5C542]/30 bg-[#F5C542]/10 text-[#F5C542]',
  },
  Alto: {
    icon: ShieldAlert,
    className: 'border-red-400/30 bg-red-400/10 text-red-300',
  },
};

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const tone = riskMap[risk];
  const Icon = tone.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold', tone.className, className)}>
      <Icon className="h-3 w-3" strokeWidth={2} />
      Riesgo {risk}
    </span>
  );
}
