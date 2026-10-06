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
