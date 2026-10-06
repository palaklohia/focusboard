import { ProjectStatus, TaskStatus } from '@prisma/client';
import { startOfUTCDay } from './dates';

export type ProjectHealth = 'COMPLETED' | 'OVERDUE' | 'AT_RISK' | 'ON_TRACK';

interface ProjectDates {
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
}

export function getProjectHealth(project: ProjectDates, progress: number): ProjectHealth {
  if (project.status === 'COMPLETED') return 'COMPLETED';

  const today = startOfUTCDay();
  if (project.endDate && project.endDate < today) return 'OVERDUE';

  if (project.startDate && project.endDate) {
    const total = project.endDate.getTime() - project.startDate.getTime();
    if (total > 0) {
      const elapsed = Math.min(Math.max((today.getTime() - project.startDate.getTime()) / total, 0), 1);
      if (progress < elapsed - 0.2) return 'AT_RISK';
    }
  }
  return 'ON_TRACK';
}

export function serializeProject<
  T extends ProjectDates & { tasks: { status: TaskStatus }[] },
>(project: T) {
  const { tasks, ...rest } = project;
  const taskCount = tasks.length;
  const completedTaskCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const ratio = taskCount ? completedTaskCount / taskCount : 0;

  return {
    ...rest,
    taskCount,
    completedTaskCount,
    progress: Math.round(ratio * 100),
    health: getProjectHealth(project, ratio),
  };
}
