'use client';

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

type ActivityTickerProps = {
  items: string[];
  className?: string;
};

export function ActivityTicker({ items, className }: ActivityTickerProps) {
  return (
    <div className={cn('mask-fade-x overflow-hidden py-2', className)}>
      <div className="flex w-max animate-marquee gap-3 whitespace-nowrap">
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs text-white/70 backdrop-blur-xl"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" strokeWidth={2} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
