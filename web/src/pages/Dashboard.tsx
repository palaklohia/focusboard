import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock3, FolderKanban, ListChecks, Rocket, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card, ErrorBanner, PriorityBadge, Spinner } from '../components/ui';
import type { DashboardData } from '../types';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

function StatCard({ icon, label, value, tint }: { icon: ReactNode; label: string; value: number; tint: string }) {
  return (
    <Card className="p-5">
      <div className={'mb-4 grid h-10 w-10 place-items-center rounded-2xl ' + tint}>{icon}</div>
      <p className="font-display text-4xl font-semibold">{value}</p>
      <p className="mt-1 text-sm font-medium text-ink/55">{label}</p>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api<DashboardData>('/dashboard'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner label="Loading your dashboard…" />;
  if (error || !data) return <ErrorBanner message={error || 'Could not load the dashboard'} onRetry={load} />;

  const { stats, upNext, recentActivity } = data;
  const pct = stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-500 to-[#c58bff] p-8 text-white shadow-xl shadow-brand-600/20">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/75">{greeting()}</p>
            <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">{user?.fullName.split(' ')[0]}</h1>
            {stats.overdueTasks > 0 ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                <AlertTriangle className="h-4 w-4" />
                {stats.overdueTasks} overdue {stats.overdueTasks === 1 ? 'task needs' : 'tasks need'} attention
              </p>
            ) : (
              <p className="mt-3 text-white/80">Nothing overdue. Nice work.</p>
            )}
          </div>
          <div className="w-full sm:w-64">
            <div className="mb-2 flex justify-between text-sm font-semibold">
              <span>Overall progress</span>
              <span>{pct}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: pct + '%' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={<FolderKanban className="h-5 w-5" />} label="Total projects" value={stats.totalProjects} tint="bg-brand-50 text-brand-600" />
        <StatCard icon={<ListChecks className="h-5 w-5" />} label="Total tasks" value={stats.totalTasks} tint="bg-sun-100 text-sun-500" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed tasks" value={stats.completedTasks} tint="bg-mint-100 text-mint-500" />
        <StatCard icon={<Clock3 className="h-5 w-5" />} label="Pending tasks" value={stats.pendingTasks} tint="bg-coral-100 text-coral-500" />
        <StatCard icon={<Rocket className="h-5 w-5" />} label="Projects in progress" value={stats.projectsInProgress} tint="bg-brand-50 text-brand-600" />
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <h2 className="text-2xl font-semibold">Up next</h2>
          </div>
          {upNext.length === 0 ? (
            <div className="rounded-2xl bg-brand-50/60 p-8 text-center">
              <p className="font-semibold">Nothing to focus on yet</p>
              <p className="mt-1 text-sm text-ink/60">Create a project and add tasks to see your top priorities here.</p>
              <Link to="/projects" className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">
                Go to projects
              </Link>
            </div>
          ) : (
            <ol className="space-y-3">
              {upNext.map((task, i) => (
                <li key={task.id} className="flex items-center gap-4 rounded-2xl bg-cream/80 p-4 ring-1 ring-black/5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white font-display text-lg font-semibold text-brand-600 shadow-sm">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{task.name}</p>
                    <p className="truncate text-xs text-ink/55">
                      {task.project?.name} · {task.focus.reason}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-5 text-2xl font-semibold">Recent activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-ink/55">Your activity will show up here.</p>
          ) : (
            <ul className="space-y-4">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <p className="text-sm font-medium">{a.message}</p>
                    <p className="text-xs text-ink/45">{timeAgo(a.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
