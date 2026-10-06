export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt?: string;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type ProjectHealth = 'COMPLETED' | 'OVERDUE' | 'AT_RISK' | 'ON_TRACK';

export interface Task {
  id: string;
  name: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  projectId: string;
  project?: { id: string; name: string };
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  completedTaskCount: number;
  progress: number;
  health: ProjectHealth;
}

export interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  createdAt: string;
}

export interface DashboardData {
  stats: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    projectsInProgress: number;
    overdueTasks: number;
  };
  upNext: (Task & { focus: { score: number; reason: string } })[];
  recentActivity: Activity[];
}

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
