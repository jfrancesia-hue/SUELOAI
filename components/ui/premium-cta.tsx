'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/helpers';

type PremiumCtaProps = ComponentProps<typeof Link> & {
  variant?: 'primary' | 'secondary';
};

export function PremiumCta({ className, children, variant = 'primary', ...props }: PremiumCtaProps) {
  return (
    <Link
      className={cn(
        'group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 active:translate-y-0',
        variant === 'primary'
          ? 'bg-gradient-to-b from-[#34D399] to-[#10B981] text-[#03130D] shadow-[0_16px_36px_-16px_rgba(16,185,129,0.72)] hover:-translate-y-px'
          : 'border border-white/12 bg-white/[0.06] text-white/90 backdrop-blur-xl hover:border-white/22 hover:bg-white/[0.1]',
        className
      )}
      {...props}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
    </Link>
  );
}
