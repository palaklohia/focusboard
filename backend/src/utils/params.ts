import { Request } from 'express';
import { z } from 'zod';
import { AppError } from './AppError';

export function getIdParam(req: Request, label: string): string {
  const id = String(req.params.id);
  if (!z.string().uuid().safeParse(id).success) {
    throw new AppError(404, label + ' not found', 'NOT_FOUND');
  }
  return id;
}
