import { api } from './api';
import type { Task } from '../types';

export async function toggleTask(task: Task) {
  await api('/tasks/' + task.id, {
    method: 'PUT',
    body: { status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' },
  });
}
