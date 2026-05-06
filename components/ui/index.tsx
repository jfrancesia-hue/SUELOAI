'use client';

import { cn } from '@/utils/helpers';
import { Loader2, type LucideIcon } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react';

// ============================================
// BUTTON
// ============================================
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon: Icon, iconPosition = 'left', children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      danger: 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-all duration-200 border border-red-500/20',
    };
    const sizes = { sm: 'text-sm px-4 py-2', md: 'text-sm px-6 py-3', lg: 'text-base px-8 py-4' };

    return (
      <button
        ref={ref}
        className={cn(variants[variant], sizes[size], loading && 'opacity-70 cursor-not-allowed', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
        {children}
        {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ============================================
// INPUT
// ============================================
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-surface-700">{label}</label>}
      <input ref={ref} id={id} className={cn('input-field', error && 'border-red-500/50 focus:ring-red-500/40', className)} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-surface-500">{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// ============================================
// TEXTAREA
// ============================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-surface-700">{label}</label>}
      <textarea ref={ref} id={id} className={cn('input-field resize-none min-h-[120px]', error && 'border-red-500/50', className)} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

// ============================================
// SELECT
// ============================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-surface-700">{label}</label>}
      <select ref={ref} id={id} className={cn('input-field', error && 'border-red-500/50', className)} {...props}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

// ============================================
// STAT CARD
// ============================================
interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn('card', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-surface-600">{title}</p>
          <p className="text-2xl font-display font-bold text-surface-900">{value}</p>
          {change && (
            <p className={cn('text-xs font-medium',
              changeType === 'positive' && 'text-brand-500',
              changeType === 'negative' && 'text-red-400',
              changeType === 'neutral' && 'text-surface-500'
            )}>{change}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-brand-500/10">
            <Icon className="w-5 h-5 text-brand-500" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// BADGE
// ============================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-surface-300 text-surface-700',
    success: 'bg-brand-500/15 text-brand-400',
    warning: 'bg-amber-500/15 text-amber-400',
    danger: 'bg-red-500/15 text-red-400',
    info: 'bg-blue-500/15 text-blue-400',
  };
  return <span className={cn('badge', variants[variant], className)}>{children}</span>;
}

// ============================================
// PROGRESS BAR
// ============================================
interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, max = 100, className, showLabel = true, size = 'md' }: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn('space-y-1.5', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-surface-600">{percent}% completado</span>
          <span className="text-surface-500">{value} / {max}</span>
        </div>
      )}
      <div className={cn('w-full bg-surface-200 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="p-4 rounded-2xl bg-surface-200 mb-4">
          <Icon className="w-8 h-8 text-surface-500" />
        </div>
      )}
      <h3 className="text-lg font-display font-semibold text-surface-800">{title}</h3>
      {description && <p className="mt-2 text-sm text-surface-500 max-w-md">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ============================================
// LOADING SPINNER
// ============================================
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="relative">
        <div className="w-10 h-10 border-2 border-surface-300 rounded-full" />
        <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-t-brand-500 rounded-full animate-spin" />
      </div>
    </div>
  );
}
