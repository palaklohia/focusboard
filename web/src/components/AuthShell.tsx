import type { ReactNode } from 'react';
import { CheckCircle2, Target } from 'lucide-react';

const sample = [
  { name: 'Design homepage', tag: 'Overdue by 1 day', done: false },
  { name: 'Write launch copy', tag: 'Due today', done: false },
  { name: 'Set up analytics', tag: 'Done', done: true },
];

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-[#c58bff] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-coral-500/30 blur-3xl" />

        <div className="relative flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
            <Target className="h-5 w-5" />
          </span>
          <span className="font-display text-2xl font-semibold">FocusBoard</span>
        </div>

        <div className="relative">
          <h2 className="max-w-md font-display text-5xl font-semibold leading-tight">Know exactly what to work on next.</h2>
          <p className="mt-4 max-w-sm text-white/80">
            Projects, tasks and a smart "Up Next" list that ranks your work by priority and deadline.
          </p>

          <div className="mt-10 max-w-sm space-y-3 rounded-3xl bg-white/15 p-4 backdrop-blur-md ring-1 ring-white/25">
            {sample.map((t) => (
              <div key={t.name} className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-ink">
                <CheckCircle2 className={t.done ? 'h-5 w-5 text-mint-500' : 'h-5 w-5 text-ink/25'} />
                <div className="flex-1">
                  <p className={t.done ? 'text-sm font-semibold line-through opacity-50' : 'text-sm font-semibold'}>{t.name}</p>
                  <p className="text-xs text-ink/55">{t.tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-white/60">Your projects stay in sync across web and mobile.</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
              <Target className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">FocusBoard</span>
          </div>
          <h1 className="font-display text-4xl font-semibold">{title}</h1>
          <p className="mt-2 text-ink/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
