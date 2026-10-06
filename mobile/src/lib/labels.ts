import type { Priority, ProjectHealth, ProjectStatus, TaskStatus } from '../types';

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const HEALTH_LABEL: Record<ProjectHealth, string> = {
  ON_TRACK: 'On track',
  AT_RISK: 'At risk',
  OVERDUE: 'Overdue',
  COMPLETED: 'Completed',
};

const TASK_STATUSES = Object.keys(TASK_STATUS_LABEL) as TaskStatus[];
const PRIORITIES = Object.keys(PRIORITY_LABEL) as Priority[];
const PROJECT_STATUSES = Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[];

// Chips for forms (no "All" option)
export const taskStatusChoices = TASK_STATUSES.map((v) => ({ value: v, label: TASK_STATUS_LABEL[v] }));
export const priorityChoices = PRIORITIES.map((v) => ({ value: v, label: PRIORITY_LABEL[v] }));

// Chips for filters (with an "All" option)
export const taskStatusFilter: { value: '' | TaskStatus; label: string }[] = [{ value: '', label: 'All' }, ...taskStatusChoices];
export const priorityFilter: { value: '' | Priority; label: string }[] = [{ value: '', label: 'Any priority' }, ...priorityChoices];
export const projectStatusFilter: { value: '' | ProjectStatus; label: string }[] = [
  { value: '', label: 'All' },
  ...PROJECT_STATUSES.map((v) => ({ value: v, label: PROJECT_STATUS_LABEL[v] })),
];
