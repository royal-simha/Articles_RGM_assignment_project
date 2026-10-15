import app from './app.js';
import { ENV } from './config/env.js';
import prisma from './config/prisma.js';

const PORT = ENV.PORT;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Blog Management API running on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`===============================================`);
});

// Graceful shutdown handling
const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
