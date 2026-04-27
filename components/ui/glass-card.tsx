'use client';

import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

export function GlassCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] shadow-[0_20px_70px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl',
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      {children}
    </div>
  );
}
