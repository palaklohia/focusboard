import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import type { Priority } from '../types';

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'soft' | 'ghost' | 'danger';
  loading?: boolean;
};

const buttonStyles = {
  primary: 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'text-ink/70 hover:bg-black/5',
  danger: 'bg-coral-100 text-coral-500 hover:bg-coral-500 hover:text-white',
};

export function Button({ variant = 'primary', loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        buttonStyles[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function Field({ label, error, className, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink/80">{label}</span>
      <input
        className={cx(
          'w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-ink/35 focus:ring-4',
          error
            ? 'border-coral-500 focus:ring-coral-500/15'
            : 'border-black/10 focus:border-brand-500 focus:ring-brand-500/15',
          className,
        )}
        {...rest}
      />
      {error && <span className="mt-1.5 block text-xs font-medium text-coral-500">{error}</span>}
    </label>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx('rounded-3xl bg-white/90 p-6 shadow-sm shadow-black/5 ring-1 ring-black/5', className)}>
      {children}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink/60">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-coral-100 p-4 text-sm text-ink">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-coral-500" />
      <div className="flex-1">
        <p className="font-semibold">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-1 font-semibold text-brand-700 underline">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

const priorityStyles: Record<Priority, string> = {
  HIGH: 'bg-coral-100 text-coral-500',
  MEDIUM: 'bg-sun-100 text-sun-500',
  LOW: 'bg-mint-100 text-mint-500',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cx('rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide', priorityStyles[priority])}>
      {priority}
    </span>
  );
}
