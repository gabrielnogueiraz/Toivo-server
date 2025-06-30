import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  appConfig,
  corsConfig,
  jwtConfig,
  serverConfig,
} from "./config/app.config.js";
import { connectDB, disconnectDB } from "./config/db.config.js";
import waitlistRoutes from "./modules/waitlist/waitlist.routes.js";
import { scheduleLaunchEmailJob } from "./jobs/sendLaunchEmails.js";
import { UserPayload } from "./types/fastify.js";

async function createServer(): Promise<FastifyInstance> {
  const app = fastify(appConfig);

  await app.register(fastifyCors, corsConfig);
  await app.register(fastifyJwt, {
    secret: jwtConfig.secret,
    cookie: {
      cookieName: "refreshToken",
      signed: false,
    },
  });

  app.decorate(
    "authenticate",
    async function (
      this: FastifyInstance,
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      try {
        const payload = await request.jwtVerify<UserPayload>();

        Object.assign(request, {
          user: {
            id: payload.id,
            email: payload.email,
            role: payload.role,
          },
        });
      } catch (err) {
        reply.status(401).send({
          success: false,
          error: {
            message: "Unauthorized",
            code: "UNAUTHORIZED",
          },
        });
      }
    }
  );

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });
  app.register(
    async (api) => {
      api.register(waitlistRoutes, { prefix: "/waitlist" });
    },
    { prefix: "/api/v1" }
  );

  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500;

    request.log.error(error);

    const message =
      statusCode === 500 && serverConfig.isProduction
        ? "Internal server error"
        : error.message;

    reply.status(statusCode).send({
      success: false,
      error: {
        message,
        code: error.code || "INTERNAL_SERVER_ERROR",
        ...(error.validation ? { details: error.validation } : {}),
      },
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        message: "Route not found",
        code: "NOT_FOUND",
      },
    });
  });

  return app;
}

async function startServer() {
  try {
    const app = await createServer();

    await connectDB();

    if (serverConfig.isProduction || process.env.RUN_JOBS === "true") {
      scheduleLaunchEmailJob();
    }

    const address = await app.listen({
      port: serverConfig.port,
      host: serverConfig.host,
    });

    console.log(`\n🚀 Server is running at ${address}`);
    console.log(`📚 API Documentation available at ${address}/documentation\n`);

    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
        await app.close();
        await disconnectDB();
        process.exit(0);
      });
    });

    return app;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

export { createServer, startServer };

if (import.meta.url.endsWith(process.argv[1])) {
  startServer().catch(console.error);
}
