import { z } from 'zod';
import { dateString, paginationShape, nonEmpty } from './common.schema';

const projectStatus = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);

const projectBase = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(120),
  description: z.string().trim().max(2000).nullable().optional(),
  status: projectStatus.optional(),
  startDate: dateString.nullable().optional(),
  endDate: dateString.nullable().optional(),
});

const datesInOrder = (d: { startDate?: Date | null; endDate?: Date | null }) =>
  !d.startDate || !d.endDate || d.endDate >= d.startDate;

export const createProjectSchema = projectBase.refine(datesInOrder, {
  message: 'End date must be on or after the start date',
  path: ['endDate'],
});

export const updateProjectSchema = projectBase
  .partial()
  .refine(nonEmpty, { message: 'Provide at least one field to update' })
  .refine(datesInOrder, { message: 'End date must be on or after the start date', path: ['endDate'] });

export const listProjectsQuery = z.object({
  search: z.string().trim().max(100).optional(),
  status: projectStatus.optional(),
  sortBy: z.enum(['createdAt', 'name', 'startDate', 'endDate']).default('createdAt'),
  ...paginationShape,
});
