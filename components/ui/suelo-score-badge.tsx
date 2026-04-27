'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/helpers';

type SueloScoreBadgeProps = {
  score: string;
  value?: number;
  className?: string;
};

export function SueloScoreBadge({ score, value, className }: SueloScoreBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.12)]',
        className
      )}
    >
      <Sparkles className="h-3 w-3" strokeWidth={2} />
      Suelo Score {score}
      {value != null && <span className="font-mono text-white/60">{value}</span>}
    </span>
  );
}
