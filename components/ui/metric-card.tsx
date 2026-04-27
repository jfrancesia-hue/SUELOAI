'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/helpers';

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon?: LucideIcon;
  tone?: 'emerald' | 'cyan' | 'gold' | 'violet';
  className?: string;
};

const toneMap = {
  emerald: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20',
  cyan: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20',
  gold: 'text-[#F5C542] bg-[#F5C542]/10 border-[#F5C542]/20',
  violet: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20',
};

export function MetricCard({ label, value, detail, icon: Icon, tone = 'emerald', className }: MetricCardProps) {
  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-white">{value}</p>
          {detail && <p className="mt-1 text-xs text-white/50">{detail}</p>}
        </div>
        {Icon && (
          <div className={cn('rounded-xl border p-2.5', toneMap[tone])}>
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>
        )}
      </div>
    </div>
  );
}
