import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { formatDate, isPastDue } from '../lib/format';
import { PRIORITY_LABEL, PROJECT_STATUS_LABEL, TASK_STATUS_LABEL } from '../lib/labels';
import { useDebounce } from '../lib/useDebounce';
import { Button, Card, cx, ErrorBanner, PriorityBadge, Spinner } from '../components/ui';
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
import TaskFormModal from '../components/TaskFormModal';
import type { Paginated, Priority, Project, Task, TaskStatus } from '../types';

export default function ProjectDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [projectError, setProjectError] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | TaskStatus>('');
  const [priority, setPriority] = useState<'' | Priority>('');
  const debounced = useDebounce(search, 300);

  const [editingProject, setEditingProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [taskModal, setTaskModal] = useState<{ task?: Task } | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadProject = useCallback(async () => {
    try {
      const r = await api<{ project: Project }>('/projects/' + id);
      setProject(r.project);
      setProjectError('');
    } catch (e) {
      setProjectError(e instanceof Error ? e.message : 'Something went wrong');
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    let cancelled = false;
    setTasksLoading(true);
    setTasksError('');
    const qs = new URLSearchParams({ projectId: id, limit: '100', sortBy: 'createdAt', order: 'asc' });
    if (debounced) qs.set('search', debounced);
    if (status) qs.set('status', status);
    if (priority) qs.set('priority', priority);

    api<Paginated<Task>>('/tasks?' + qs.toString())
      .then((r) => !cancelled && setTasks(r.data))
      .catch((e) => !cancelled && setTasksError(e instanceof Error ? e.message : 'Something went wrong'))
      .finally(() => !cancelled && setTasksLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id, debounced, status, priority, reloadKey]);

  const refresh = useCallback(() => {
    setReloadKey((k) => k + 1);
    loadProject();
  }, [loadProject]);

  async function changeStatus(task: Task, next: TaskStatus) {
    setActionError('');
    try {
      await api('/tasks/' + task.id, { method: 'PUT', body: { status: next } });
      refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not update the task');
    }
  }

  async function confirmDeleteTask() {
    if (!taskToDelete) return;
    setBusy(true);
    try {
      await api('/tasks/' + taskToDelete.id, { method: 'DELETE' });
      setTaskToDelete(null);
      refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not delete the task');
      setTaskToDelete(null);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDeleteProject() {
    setBusy(true);
    try {
      await api('/projects/' + id, { method: 'DELETE' });
      navigate('/projects', { replace: true });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not delete the project');
      setDeletingProject(false);
      setBusy(false);
    }
  }

  if (projectError) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={projectError} onRetry={loadProject} />
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
      </div>
    );
  }
  if (!project) return <Spinner label="Loading project…" />;

  const filtering = !!debounced || !!status || !!priority;

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <HealthBadge health={project.health} />
              <StatusPill label={PROJECT_STATUS_LABEL[project.status]} />
            </div>
            <h1 className="break-words text-4xl font-semibold">{project.name}</h1>
            {project.description && <p className="mt-2 max-w-2xl text-ink/65">{project.description}</p>}
            {(project.startDate || project.endDate) && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-ink/55">
                <CalendarDays className="h-4 w-4" />
                {project.startDate ? formatDate(project.startDate) : '…'} → {project.endDate ? formatDate(project.endDate) : '…'}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="soft" onClick={() => setEditingProject(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button variant="danger" onClick={() => setDeletingProject(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm font-semibold text-ink/65">
            <span>{project.completedTaskCount} of {project.taskCount} tasks completed</span>
            <span>{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} />
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold">Tasks</h2>
        <Button onClick={() => setTaskModal({})}>
          <Plus className="h-4 w-4" /> Add task
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search tasks by name" />
        <select aria-label="Filter by status" className={filterSelectClass} value={status} onChange={(e) => setStatus(e.target.value as '' | TaskStatus)}>
          <option value="">All statuses</option>
          {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((s) => (
            <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select aria-label="Filter by priority" className={filterSelectClass} value={priority} onChange={(e) => setPriority(e.target.value as '' | Priority)}>
          <option value="">All priorities</option>
          {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
            <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
          ))}
        </select>
      </div>

      {actionError && <ErrorBanner message={actionError} />}

      {tasksLoading && tasks.length === 0 ? (
        <Spinner label="Loading tasks…" />
      ) : tasksError ? (
        <ErrorBanner message={tasksError} onRetry={refresh} />
      ) : tasks.length === 0 ? (
        filtering ? (
          <EmptyState title="No matching tasks" text="Try a different search or clear the filters." />
        ) : (
          <EmptyState
            title="No tasks yet"
            text="Break this project into tasks and tick them off as you go."
            action={<Button onClick={() => setTaskModal({})}><Plus className="h-4 w-4" /> Add the first task</Button>}
          />
        )
      ) : (
        <ul className={cx('space-y-3 transition', tasksLoading && 'opacity-60')}>
          {tasks.map((t) => {
            const done = t.status === 'COMPLETED';
            const overdue = !done && isPastDue(t.dueDate);
            return (
              <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-3xl bg-white/90 p-4 shadow-sm shadow-black/5 ring-1 ring-black/5 sm:flex-nowrap">
                <button
                  onClick={() => changeStatus(t, done ? 'PENDING' : 'COMPLETED')}
                  aria-label={done ? 'Mark as pending' : 'Mark as completed'}
                  className={cx(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition',
                    done ? 'border-mint-500 bg-mint-500 text-white' : 'border-ink/20 text-transparent hover:border-mint-500 hover:text-mint-500',
                  )}
                >
                  <Check className="h-4 w-4" />
                </button>

                <div className="min-w-0 flex-1 basis-40">
                  <p className={cx('break-words font-semibold', done && 'text-ink/40 line-through')}>{t.name}</p>
                  {t.description && <p className="line-clamp-1 text-sm text-ink/50">{t.description}</p>}
                  {t.dueDate && (
                    <p className={cx('mt-0.5 text-xs font-medium', overdue ? 'text-coral-500' : 'text-ink/45')}>
                      {overdue ? 'Overdue · ' : 'Due '}{formatDate(t.dueDate)}
                    </p>
                  )}
                </div>

                <PriorityBadge priority={t.priority} />

                <select
                  aria-label={'Status of ' + t.name}
                  value={t.status}
                  onChange={(e) => changeStatus(t, e.target.value as TaskStatus)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-brand-500"
                >
                  {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((s) => (
                    <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>
                  ))}
                </select>

                <div className="flex gap-1">
                  <button onClick={() => setTaskModal({ task: t })} aria-label={'Edit ' + t.name} className="grid h-9 w-9 place-items-center rounded-full text-ink/55 hover:bg-brand-50 hover:text-brand-700">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setTaskToDelete(t)} aria-label={'Delete ' + t.name} className="grid h-9 w-9 place-items-center rounded-full text-ink/55 hover:bg-coral-100 hover:text-coral-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editingProject && (
        <ProjectFormModal
          project={project}
          onClose={() => setEditingProject(false)}
          onSaved={() => {
            setEditingProject(false);
            refresh();
          }}
        />
      )}

      {taskModal && (
        <TaskFormModal
          projectId={project.id}
          task={taskModal.task}
          onClose={() => setTaskModal(null)}
          onSaved={() => {
            setTaskModal(null);
            refresh();
          }}
        />
      )}

      {taskToDelete && (
        <ConfirmDialog
          title="Delete task?"
          message={'"' + taskToDelete.name + '" will be permanently deleted.'}
          loading={busy}
          onConfirm={confirmDeleteTask}
          onCancel={() => setTaskToDelete(null)}
        />
      )}

      {deletingProject && (
        <ConfirmDialog
          title="Delete project?"
          message={'"' + project.name + '" and all ' + project.taskCount + ' of its tasks will be permanently deleted.'}
          loading={busy}
          onConfirm={confirmDeleteProject}
          onCancel={() => setDeletingProject(false)}
        />
      )}
    </div>
  );
}
