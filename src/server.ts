import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

const start = async () => {
  await connectDB(env.mongoUri);

  const server = app.listen(env.port, () => {
    console.log(`Mini ERP API running on port ${env.port} [${env.nodeEnv}]`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
};

start();
