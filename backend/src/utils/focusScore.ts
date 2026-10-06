import { Priority } from '@prisma/client';
import { startOfUTCDay } from './dates';

const PRIORITY_WEIGHT: Record<Priority, number> = { LOW: 10, MEDIUM: 20, HIGH: 30 };
const DAY_MS = 24 * 60 * 60 * 1000;

export function focusScore(task: { priority: Priority; dueDate: Date | null }) {
  const today = startOfUTCDay();
  let urgency = 0;
  let reason = task.priority === 'HIGH' ? 'High priority' : 'Next in line';

  if (task.dueDate) {
    const days = Math.round((task.dueDate.getTime() - today.getTime()) / DAY_MS);
    if (days < 0) {
      urgency = 100 + Math.min(-days, 30);
      reason = 'Overdue by ' + -days + (days === -1 ? ' day' : ' days');
    } else if (days === 0) {
      urgency = 80;
      reason = 'Due today';
    } else if (days <= 3) {
      urgency = 60;
      reason = 'Due in ' + days + (days === 1 ? ' day' : ' days');
    } else if (days <= 7) {
      urgency = 40;
      reason = 'Due this week';
    } else {
      urgency = 10;
      reason = 'Due in ' + days + ' days';
    }
  }

  return { score: PRIORITY_WEIGHT[task.priority] + urgency, reason };
}
