import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import routes from './routes';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware';

const app: Application = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded product images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mini ERP API is up and running 🚀',
    docs: '/health for a lightweight health check, /api/v1/* for the actual API routes',
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Mini ERP API is running' });
});

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;