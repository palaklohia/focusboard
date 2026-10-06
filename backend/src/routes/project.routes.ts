import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logActivity } from '../lib/activity';
import { AppError } from '../utils/AppError';
import { getIdParam } from '../utils/params';
import { serializeProject } from '../utils/health';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { createProjectSchema, updateProjectSchema, listProjectsQuery } from '../schemas/project.schema';

const router = Router();
router.use(requireAuth);

const withTaskStatuses = { tasks: { select: { status: true } } } as const;

router.get('/', async (req, res) => {
  const q = listProjectsQuery.parse(req.query);

  const where: Prisma.ProjectWhereInput = {
    ownerId: req.user!.id,
    ...(q.status && { status: q.status }),
    ...(q.search && { name: { contains: q.search, mode: 'insensitive' } }),
  };

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: { [q.sortBy]: q.order },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: withTaskStatuses,
    }),
  ]);

  res.json({
    data: projects.map(serializeProject),
    pagination: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
  });
});

router.get('/:id', async (req, res) => {
  const id = getIdParam(req, 'Project');
  const project = await prisma.project.findFirst({
    where: { id, ownerId: req.user!.id },
    include: withTaskStatuses,
  });
  if (!project) throw new AppError(404, 'Project not found', 'NOT_FOUND');
  res.json({ project: serializeProject(project) });
});

router.post('/', validate(createProjectSchema), async (req, res) => {
  const project = await prisma.project.create({
    data: { ...req.body, ownerId: req.user!.id },
    include: withTaskStatuses,
  });
  await logActivity(req.user!.id, 'PROJECT_CREATED', 'PROJECT', project.id, 'Created project "' + project.name + '"');
  res.status(201).json({ project: serializeProject(project) });
});

router.put('/:id', validate(updateProjectSchema), async (req, res) => {
  const id = getIdParam(req, 'Project');
  const existing = await prisma.project.findFirst({ where: { id, ownerId: req.user!.id } });
  if (!existing) throw new AppError(404, 'Project not found', 'NOT_FOUND');

  // Check the final combination of dates, even when only one of them was sent
  const start = req.body.startDate !== undefined ? req.body.startDate : existing.startDate;
  const end = req.body.endDate !== undefined ? req.body.endDate : existing.endDate;
  if (start && end && end < start) {
    throw new AppError(400, 'End date must be on or after the start date', 'VALIDATION_ERROR');
  }

  const project = await prisma.project.update({ where: { id }, data: req.body, include: withTaskStatuses });
  await logActivity(req.user!.id, 'PROJECT_UPDATED', 'PROJECT', id, 'Updated project "' + project.name + '"');
  res.json({ project: serializeProject(project) });
});

router.delete('/:id', async (req, res) => {
  const id = getIdParam(req, 'Project');
  const existing = await prisma.project.findFirst({ where: { id, ownerId: req.user!.id } });
  if (!existing) throw new AppError(404, 'Project not found', 'NOT_FOUND');

  await prisma.project.delete({ where: { id } });
  await logActivity(req.user!.id, 'PROJECT_DELETED', 'PROJECT', id, 'Deleted project "' + existing.name + '"');
  res.status(204).send();
});

export default router;
