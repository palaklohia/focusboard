import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { startOfUTCDay } from '../utils/dates';
import { focusScore } from '../utils/focusScore';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const userId = req.user!.id;
  const mine = { project: { ownerId: userId } };
  const today = startOfUTCDay();

  const [
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    projectsInProgress,
    overdueTasks,
    openTasks,
    recentActivity,
  ] = await Promise.all([
    prisma.project.count({ where: { ownerId: userId } }),
    prisma.task.count({ where: mine }),
    prisma.task.count({ where: { ...mine, status: 'COMPLETED' } }),
    prisma.task.count({ where: { ...mine, status: 'PENDING' } }),
    prisma.task.count({ where: { ...mine, status: 'IN_PROGRESS' } }),
    prisma.project.count({ where: { ownerId: userId, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ...mine, status: { not: 'COMPLETED' }, dueDate: { lt: today } } }),
    prisma.task.findMany({
      where: { ...mine, status: { not: 'COMPLETED' } },
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
      take: 200,
    }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, action: true, entityType: true, entityId: true, message: true, createdAt: true },
    }),
  ]);

  const upNext = openTasks
    .map((task) => ({ ...task, focus: focusScore(task) }))
    .sort((a, b) => b.focus.score - a.focus.score)
    .slice(0, 5);

  res.json({
    stats: {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      projectsInProgress,
      overdueTasks,
    },
    upNext,
    recentActivity,
  });
});

export default router;
