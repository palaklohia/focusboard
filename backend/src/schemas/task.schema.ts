import { z } from 'zod';
import { dateString, paginationShape, nonEmpty } from './common.schema';

const priority = z.enum(['LOW', 'MEDIUM', 'HIGH']);
const taskStatus = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);

const taskBase = z.object({
  name: z.string().trim().min(1, 'Task name is required').max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  priority: priority.optional(),
  status: taskStatus.optional(),
  dueDate: dateString.nullable().optional(),
});

export const createTaskSchema = taskBase.extend({
  projectId: z.string().uuid('Invalid project id'),
});

export const updateTaskSchema = taskBase
  .partial()
  .refine(nonEmpty, { message: 'Provide at least one field to update' });

export const listTasksQuery = z.object({
  search: z.string().trim().max(100).optional(),
  status: taskStatus.optional(),
  priority: priority.optional(),
  projectId: z.string().uuid('Invalid project id').optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'name', 'status']).default('createdAt'),
  ...paginationShape,
});
