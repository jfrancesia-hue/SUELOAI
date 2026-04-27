'use client';

import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

export function PremiumCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-surface-200/80 bg-surface-100/80 shadow-[0_18px_60px_-38px_rgba(0,0,0,0.95)] transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500/25 hover:bg-surface-100',
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(6,182,212,0.09),transparent_30%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </div>
  );
}
