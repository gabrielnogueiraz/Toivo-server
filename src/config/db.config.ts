import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('🚀 Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
};

function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  disconnectDB().finally(() => {
    console.log('Database disconnected.');
    process.exit(0);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { prisma };

