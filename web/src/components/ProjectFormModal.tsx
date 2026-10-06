import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Field } from './ui';
import { Modal, SelectField, TextAreaField } from './kit';
import { api, ApiError } from '../lib/api';
import { toInputDate } from '../lib/format';
import { PROJECT_STATUS_LABEL } from '../lib/labels';
import type { Project, ProjectStatus } from '../types';

interface Props {
  project?: Project;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProjectFormModal({ project, onClose, onSaved }: Props) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'NOT_STARTED');
  const [startDate, setStartDate] = useState(toInputDate(project?.startDate ?? null));
  const [endDate, setEndDate] = useState(toInputDate(project?.endDate ?? null));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Project name is required';
    else if (name.trim().length > 120) next.name = 'Project name must be at most 120 characters';
    if (description.length > 2000) next.description = 'Description must be at most 2000 characters';
    if (startDate && endDate && endDate < startDate) next.endDate = 'End date must be on or after the start date';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await api(project ? '/projects/' + project.id : '/projects', {
        method: project ? 'PUT' : 'POST',
        body: {
          name: name.trim(),
          description: description.trim() || null,
          status,
          startDate: startDate || null,
          endDate: endDate || null,
        },
      });
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
    <Modal title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Project name" placeholder="e.g. Launch website" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoFocus />
        <TextAreaField label="Description" placeholder="What is this project about?" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} />
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
          {(Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).map((s) => (
            <option key={s} value={s}>{PROJECT_STATUS_LABEL[s]}</option>
          ))}
        </SelectField>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} error={errors.startDate} />
          <Field label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} error={errors.endDate} />
        </div>
        {formError && <p className="rounded-2xl bg-coral-100 p-3 text-sm font-medium text-coral-500">{formError}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" loading={loading}>{project ? 'Save changes' : 'Create project'}</Button>
        </div>
      </form>
    </Modal>
  );
}
