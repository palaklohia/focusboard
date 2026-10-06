import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logActivity } from '../lib/activity';
import { AppError } from '../utils/AppError';
import { getIdParam } from '../utils/params';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { createTaskSchema, updateTaskSchema, listTasksQuery } from '../schemas/task.schema';

const router = Router();
router.use(requireAuth);

const withProject = { project: { select: { id: true, name: true } } } as const;

router.get('/', async (req, res) => {
  const q = listTasksQuery.parse(req.query);

  const where: Prisma.TaskWhereInput = {
    project: { ownerId: req.user!.id },
    ...(q.projectId && { projectId: q.projectId }),
    ...(q.status && { status: q.status }),
    ...(q.priority && { priority: q.priority }),
    ...(q.search && { name: { contains: q.search, mode: 'insensitive' } }),
  };

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: { [q.sortBy]: q.order },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: withProject,
    }),
  ]);

  res.json({
    data: tasks,
    pagination: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
  });
});

router.get('/:id', async (req, res) => {
  const id = getIdParam(req, 'Task');
  const task = await prisma.task.findFirst({
    where: { id, project: { ownerId: req.user!.id } },
    include: withProject,
  });
  if (!task) throw new AppError(404, 'Task not found', 'NOT_FOUND');
  res.json({ task });
});

router.post('/', validate(createTaskSchema), async (req, res) => {
  const { projectId, ...fields } = req.body;

  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: req.user!.id } });
  if (!project) throw new AppError(404, 'Project not found', 'NOT_FOUND');

  const task = await prisma.task.create({
    data: {
      ...fields,
      projectId,
      completedAt: fields.status === 'COMPLETED' ? new Date() : null,
    },
    include: withProject,
  });
  await logActivity(req.user!.id, 'TASK_CREATED', 'TASK', task.id, 'Added task "' + task.name + '" to "' + project.name + '"');
  res.status(201).json({ task });
});

router.put('/:id', validate(updateTaskSchema), async (req, res) => {
  const id = getIdParam(req, 'Task');
  const existing = await prisma.task.findFirst({
    where: { id, project: { ownerId: req.user!.id } },
  });
  if (!existing) throw new AppError(404, 'Task not found', 'NOT_FOUND');

  const data: Prisma.TaskUpdateInput = { ...req.body };
  const becameCompleted = req.body.status === 'COMPLETED' && existing.status !== 'COMPLETED';
  if (becameCompleted) data.completedAt = new Date();
  else if (req.body.status && req.body.status !== 'COMPLETED') data.completedAt = null;

  const task = await prisma.task.update({ where: { id }, data, include: withProject });
  await logActivity(
    req.user!.id,
    becameCompleted ? 'TASK_COMPLETED' : 'TASK_UPDATED',
    'TASK',
    id,
    (becameCompleted ? 'Completed task "' : 'Updated task "') + task.name + '"',
  );
  res.json({ task });
});

router.delete('/:id', async (req, res) => {
  const id = getIdParam(req, 'Task');
  const existing = await prisma.task.findFirst({
    where: { id, project: { ownerId: req.user!.id } },
  });
  if (!existing) throw new AppError(404, 'Task not found', 'NOT_FOUND');

  await prisma.task.delete({ where: { id } });
  await logActivity(req.user!.id, 'TASK_DELETED', 'TASK', id, 'Deleted task "' + existing.name + '"');
  res.status(204).send();
});

export default router;
