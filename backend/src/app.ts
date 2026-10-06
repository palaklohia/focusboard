import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { notFound, errorHandler } from './middleware/errorHandler';

export const app = express();

// Needed on hosting platforms so rate limiting sees the real client IP
if (env.NODE_ENV === 'production') app.set('trust proxy', 1);

const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

app.use(helmet());
app.use(
  cors({
    // Mobile apps send no Origin header, so allow requests without one
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);
