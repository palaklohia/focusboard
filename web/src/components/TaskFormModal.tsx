import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Field } from './ui';
import { Modal, SelectField, TextAreaField } from './kit';
import { api, ApiError } from '../lib/api';
import { toInputDate } from '../lib/format';
import { PRIORITY_LABEL, TASK_STATUS_LABEL } from '../lib/labels';
import type { Priority, Task, TaskStatus } from '../types';

interface Props {
  projectId: string;
  task?: Task;
  onClose: () => void;
  onSaved: () => void;
}

export default function TaskFormModal({ projectId, task, onClose, onSaved }: Props) {
  const [name, setName] = useState(task?.name ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'MEDIUM');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'PENDING');
  const [dueDate, setDueDate] = useState(toInputDate(task?.dueDate ?? null));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Task name is required';
    else if (name.trim().length > 150) next.name = 'Task name must be at most 150 characters';
    if (description.length > 2000) next.description = 'Description must be at most 2000 characters';
    setErrors(next);
    if (Object.keys(next).length) return;

    const fields = {
      name: name.trim(),
      description: description.trim() || null,
      priority,
      status,
      dueDate: dueDate || null,
    };

    setLoading(true);
    try {
      if (task) await api('/tasks/' + task.id, { method: 'PUT', body: fields });
      else await api('/tasks', { method: 'POST', body: { ...fields, projectId } });
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      } else {
        setFormError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Task name" placeholder="e.g. Design homepage" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoFocus />
        <TextAreaField label="Description" placeholder="Any details worth remembering?" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
              <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
            ))}
          </SelectField>
          <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>
            ))}
          </SelectField>
        </div>
        <Field label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} error={errors.dueDate} />
        {formError && <p className="rounded-2xl bg-coral-100 p-3 text-sm font-medium text-coral-500">{formError}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" loading={loading}>{task ? 'Save changes' : 'Add task'}</Button>
        </div>
      </form>
    </Modal>
  );
}
