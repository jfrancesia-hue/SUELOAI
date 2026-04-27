'use client';

import { cn } from '@/utils/helpers';

type FundingBarProps = {
  value: number;
  label?: string;
  className?: string;
  tone?: 'emerald' | 'cyan' | 'gold' | 'violet';
};

const toneMap = {
  emerald: 'from-[#10B981] to-[#34D399]',
  cyan: 'from-[#06B6D4] to-[#67E8F9]',
  gold: 'from-[#F5C542] to-[#FDE68A]',
  violet: 'from-[#8B5CF6] to-[#C4B5FD]',
};

export function FundingBar({ value, label = 'Fondeado', className, tone = 'emerald' }: FundingBarProps) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-surface-500">{label}</span>
        <span className="font-mono font-semibold text-surface-800">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r shadow-[0_0_18px_rgba(16,185,129,0.22)] transition-[width] duration-700', toneMap[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
