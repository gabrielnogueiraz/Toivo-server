import { PrismaClient } from '@prisma/client';
import { serverConfig } from './app.config.js';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = global.prisma || new PrismaClient({
  log: serverConfig.isDevelopment
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };

// Helper function to connect to the database
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('🚀 Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Helper function to disconnect from the database
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('🛑 Database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
    process.exit(1);
  }
};

// Graceful shutdown handler
export const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  // Close database connection
  await disconnectDB();
  
  // Exit with success
  process.exit(0);
};

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider restarting the process in production using PM2 or similar
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Consider restarting the process in production using PM2 or similar
  process.exit(1);
});
