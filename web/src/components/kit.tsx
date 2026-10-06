import { useEffect } from 'react';
import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Inbox, Search, X } from 'lucide-react';
import { Button, cx } from './ui';
import { HEALTH_LABEL } from '../lib/labels';
import type { ProjectHealth } from '../types';

export const inputClass = (error?: string) =>
  cx(
    'w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-ink/35 focus:ring-4',
    error ? 'border-coral-500 focus:ring-coral-500/15' : 'border-black/10 focus:border-brand-500 focus:ring-brand-500/15',
  );

export const filterSelectClass =
  'rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-ink/60 hover:bg-black/5">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SelectField({
  label,
  error,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink/80">{label}</span>
      <select className={inputClass(error)} {...rest}>
        {children}
      </select>
      {error && <span className="mt-1.5 block text-xs font-medium text-coral-500">{error}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  error,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink/80">{label}</span>
      <textarea rows={3} className={inputClass(error)} {...rest} />
      {error && <span className="mt-1.5 block text-xs font-medium text-coral-500">{error}</span>}
    </label>
  );
}

const healthStyles: Record<ProjectHealth, string> = {
  ON_TRACK: 'bg-mint-100 text-mint-500',
  AT_RISK: 'bg-sun-100 text-sun-500',
  OVERDUE: 'bg-coral-100 text-coral-500',
  COMPLETED: 'bg-brand-50 text-brand-700',
};

export function HealthBadge({ health }: { health: ProjectHealth }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', healthStyles[health])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {HEALTH_LABEL[health]}
    </span>
  );
}

export function StatusPill({ label }: { label: string }) {
  return <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-ink/65">{label}</span>;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-brand-50">
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-[#c58bff] transition-all duration-500"
        style={{ width: value + '%' }}
      />
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-ink/70">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl bg-white/70 px-6 py-14 text-center ring-1 ring-black/5">
      <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Inbox className="h-7 w-7" />
      </span>
      <p className="font-display text-2xl font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink/60">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-[200px] flex-1">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-11 pr-4 text-sm outline-none placeholder:text-ink/40 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
      />
    </div>
  );
}
