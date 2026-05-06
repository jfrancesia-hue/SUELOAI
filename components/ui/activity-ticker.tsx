'use client';

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

type ActivityTickerProps = {
  items: string[];
  className?: string;
};

export function ActivityTicker({ items, className }: ActivityTickerProps) {
  const renderPill = (item: string, key: string) => (
    <span
      key={key}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs text-white/70 backdrop-blur-xl"
    >
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" strokeWidth={2} />
      {item}
    </span>
  );

  return (
    <div className={cn('mask-fade-x w-full min-w-0 max-w-full overflow-hidden py-2 [contain:layout_paint]', className)}>
      <div className="grid gap-2 sm:hidden">
        {items.slice(0, 2).map((item, index) => renderPill(item, `${item}-mobile-${index}`))}
      </div>
      <div className="hidden min-w-0 overflow-hidden sm:block">
        <div className="flex w-max animate-marquee gap-3 whitespace-nowrap">
          {[...items, ...items].map((item, index) => renderPill(item, `${item}-${index}`))}
        </div>
      </div>
    </div>
  );
}
