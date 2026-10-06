import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import { PROJECT_STATUS_LABEL } from '../lib/labels';
import { useDebounce } from '../lib/useDebounce';
import { Button, Card, ErrorBanner, Spinner } from '../components/ui';
import {
  ConfirmDialog,
  EmptyState,
  filterSelectClass,
  HealthBadge,
  ProgressBar,
  SearchInput,
  StatusPill,
} from '../components/kit';
import ProjectFormModal from '../components/ProjectFormModal';
import type { Paginated, Project, ProjectStatus } from '../types';

export default function Projects() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | ProjectStatus>('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300);

  const [result, setResult] = useState<Paginated<Project> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [formFor, setFormFor] = useState<{ project?: Project } | null>(null);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const qs = new URLSearchParams({ page: String(page), limit: '9' });
    if (debounced) qs.set('search', debounced);
    if (status) qs.set('status', status);

    api<Paginated<Project>>('/projects?' + qs.toString())
      .then((r) => !cancelled && setResult(r))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Something went wrong'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [debounced, status, page, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);
  const filtering = !!debounced || !!status;

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setActionError('');
    try {
      await api('/projects/' + toDelete.id, { method: 'DELETE' });
      setToDelete(null);
      if (page > 1 && result?.data.length === 1) setPage(page - 1);
      else reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not delete the project');
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Projects</h1>
          <p className="mt-1 text-ink/60">Everything you're working on, in one place.</p>
        </div>
        <Button onClick={() => setFormFor({})}>
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search projects by name"
        />
        <select
          aria-label="Filter by status"
          className={filterSelectClass}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as '' | ProjectStatus);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {(Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).map((s) => (
            <option key={s} value={s}>{PROJECT_STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {actionError && <ErrorBanner message={actionError} />}

      {loading && !result ? (
        <Spinner label="Loading projects…" />
      ) : error ? (
        <ErrorBanner message={error} onRetry={reload} />
      ) : result && result.data.length === 0 ? (
        filtering ? (
          <EmptyState title="No matching projects" text="Try a different search or clear the filter." />
        ) : (
          <EmptyState
            title="No projects yet"
            text="Create your first project, then add tasks to track your progress."
            action={<Button onClick={() => setFormFor({})}><Plus className="h-4 w-4" /> Create a project</Button>}
          />
        )
      ) : (
        <div className={loading ? 'opacity-60 transition' : 'transition'}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result?.data.map((p) => (
              <Card key={p.id} className="flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/10">
                <Link to={'/projects/' + p.id} className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <HealthBadge health={p.health} />
                    <StatusPill label={PROJECT_STATUS_LABEL[p.status]} />
                  </div>
                  <h3 className="text-xl font-semibold leading-snug">{p.name}</h3>
                  <p className="mt-1 line-clamp-2 min-h-10 text-sm text-ink/55">{p.description || 'No description'}</p>

                  <div className="mt-5">
                    <div className="mb-1.5 flex justify-between text-xs font-semibold text-ink/60">
                      <span>{p.completedTaskCount} of {p.taskCount} tasks done</span>
                      <span>{p.progress}%</span>
                    </div>
                    <ProgressBar value={p.progress} />
                  </div>

                  {(p.startDate || p.endDate) && (
                    <p className="mt-4 flex items-center gap-1.5 text-xs text-ink/50">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {p.startDate ? formatDate(p.startDate) : '…'} → {p.endDate ? formatDate(p.endDate) : '…'}
                    </p>
                  )}
                </Link>

                <div className="mt-4 flex justify-end gap-1 border-t border-black/5 pt-3">
                  <button onClick={() => setFormFor({ project: p })} aria-label={'Edit ' + p.name} className="grid h-9 w-9 place-items-center rounded-full text-ink/55 hover:bg-brand-50 hover:text-brand-700">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setToDelete(p)} aria-label={'Delete ' + p.name} className="grid h-9 w-9 place-items-center rounded-full text-ink/55 hover:bg-coral-100 hover:text-coral-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {result && result.pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button variant="soft" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="text-sm font-semibold text-ink/60">
                Page {result.pagination.page} of {result.pagination.totalPages}
              </span>
              <Button variant="soft" disabled={page >= result.pagination.totalPages} onClick={() => setPage(page + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {formFor && (
        <ProjectFormModal
          project={formFor.project}
          onClose={() => setFormFor(null)}
          onSaved={() => {
            setFormFor(null);
            reload();
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete project?"
          message={'"' + toDelete.name + '" and all ' + toDelete.taskCount + ' of its tasks will be permanently deleted.'}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
