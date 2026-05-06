import { cn } from '@/utils/helpers';

type SueloLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  dark?: boolean;
  showTagline?: boolean;
};

export function SueloLogo({
  className,
  iconClassName,
  textClassName,
  dark = false,
  showTagline = false,
}: SueloLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-300 via-emerald-400 to-cyan-300 shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_16px_34px_-18px_rgba(16,185,129,0.9)]',
          iconClassName
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.58),transparent_34%)]" />
        <div className="absolute -bottom-4 -right-4 h-9 w-9 rounded-full bg-[#07111F]/18" />
        <span className="relative font-display text-xl font-black tracking-[-0.05em] text-[#03130D]">S</span>
      </div>
      <div className="min-w-0">
        <span
          className={cn(
            'block font-display text-2xl font-bold leading-none tracking-[-0.04em]',
            dark ? 'text-surface-900' : 'text-white',
            textClassName
          )}
        >
          Suelo<span className="text-emerald-300">.ai</span>
        </span>
        {showTagline && (
          <span className={cn('mt-1 block text-[11px] font-medium leading-none', dark ? 'text-surface-500' : 'text-white/45')}>
            Inversión inmobiliaria inteligente
          </span>
        )}
      </div>
    </div>
  );
}
