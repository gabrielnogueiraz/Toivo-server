import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { appConfig, corsConfig, jwtConfig, serverConfig } from './config/app.config.js';
import { connectDB, disconnectDB } from './config/db.config.js';
import waitlistRoutes from './modules/waitlist/waitlist.routes.js';
import { scheduleLaunchEmailJob } from './jobs/sendLaunchEmails.js';
import { UserPayload } from './types/fastify.js';

/**
 * Create and configure the Fastify server
 */
async function createServer(): Promise<FastifyInstance> {
  // Create Fastify instance with configuration
  const app = fastify(appConfig);

  // Register plugins
  await app.register(fastifyCors, corsConfig);
  
  // JWT Authentication
  await app.register(fastifyJwt, {
    secret: jwtConfig.secret,
    cookie: {
      cookieName: 'refreshToken',
      signed: false,
    },
  });

  // Authentication hook
  app.decorate('authenticate', async function (
    this: FastifyInstance,
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const payload = await request.jwtVerify<UserPayload>();
      
      // Type assertion to avoid type issues
      Object.assign(request, {
        user: {
          id: payload.id,
          email: payload.email,
          role: payload.role
        }
      });
    } catch (err) {
      reply.status(401).send({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
    }
  });

  // Health check endpoint
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  app.register(
    async (api) => {
      // Waitlist routes
      api.register(waitlistRoutes, { prefix: '/waitlist' });
      
      // Future routes will be registered here
      // api.register(userRoutes, { prefix: '/users' });
    },
    { prefix: '/api/v1' } // API version and base path
  );

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500;
    
    // Log the error
    request.log.error(error);
    
    // Don't expose internal errors in production
    const message = statusCode === 500 && serverConfig.isProduction
      ? 'Internal server error'
      : error.message;
    
    reply.status(statusCode).send({
      success: false,
      error: {
        message,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        ...(error.validation ? { details: error.validation } : {}),
      },
    });
  });

  // Not found handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        message: 'Route not found',
        code: 'NOT_FOUND',
      },
    });
  });

  return app;
}

/**
 * Start the server
 */
async function startServer() {
  try {
    // Create server
    const app = await createServer();
    
    // Connect to database
    await connectDB();
    
    // Schedule jobs
    if (serverConfig.isProduction || process.env.RUN_JOBS === 'true') {
      scheduleLaunchEmailJob();
    }
    
    // Start listening
    const address = await app.listen({
      port: serverConfig.port,
      host: serverConfig.host,
    });
    
    console.log(`\n🚀 Server is running at ${address}`);
    console.log(`📚 API Documentation available at ${address}/documentation\n`);
    
    // Handle graceful shutdown
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
        await app.close();
        await disconnectDB();
        process.exit(0);
      });
    });
    
    return app;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Export for testing
export { createServer, startServer };

// Start the server if this file is run directly
if (import.meta.url.endsWith(process.argv[1])) {
  startServer().catch(console.error);
}
