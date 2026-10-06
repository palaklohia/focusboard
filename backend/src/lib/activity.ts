import { prisma } from './prisma';

export async function logActivity(
  userId: string,
  action: string,
  entityType: 'PROJECT' | 'TASK',
  entityId: string,
  message: string,
) {
  try {
    await prisma.activityLog.create({ data: { userId, action, entityType, entityId, message } });
  } catch (err) {
    console.error('Failed to write activity log', err);
  }
}
