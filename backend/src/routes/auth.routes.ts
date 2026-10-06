import { Router } from 'express';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

const publicUser = { id: true, fullName: true, email: true, createdAt: true } as const;

// Used so a wrong email takes as long as a wrong password (prevents user enumeration by timing)
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO5Xn8k7Y3m3o8hF1m6vXk1o8xQeZ2G7a';

function signToken(userId: string) {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  const { fullName, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'An account with this email already exists', 'EMAIL_TAKEN');
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: { fullName, email, passwordHash },
    select: publicUser,
  });

  res.status(201).json({ user, token: signToken(user.id) });
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await compare(password, user ? user.passwordHash : DUMMY_HASH);

  if (!user || !valid) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  res.json({
    user: { id: user.id, fullName: user.fullName, email: user.email, createdAt: user.createdAt },
    token: signToken(user.id),
  });
});

// JWTs are stateless, so the client deletes its token. The server just confirms the token was valid.
router.post('/logout', requireAuth, (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
