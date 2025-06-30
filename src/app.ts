import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from '@fastify/cookie';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      id: string;
    };
  }
}

import { appConfig, corsConfig, jwtConfig, serverConfig } from "./config/app.config.js";
import { UserPayload } from "./types/fastify.js";
import waitlistRoutes from "./modules/waitlist/waitlist.routes.js";
import userRoutes from './modules/user/user.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';

export async function buildApp() {
  const app = fastify(appConfig).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

    await app.register(fastifyCors, corsConfig);
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'a-default-secret-for-development',
  });
  await app.register(fastifyJwt, {
    secret: jwtConfig.secret,
    cookie: {
      cookieName: "refreshToken",
      signed: false,
    },
  });

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Toivo API',
        description: 'API for the Toivo productivity app.',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
    staticCSP: true,
  });

  app.decorate(
    "authenticate",
    async function (
      this: FastifyInstance,
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      try {
        await request.jwtVerify();
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
            api.register(userRoutes, { prefix: '/users' });
      api.register(notificationRoutes, { prefix: '/notifications' });
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

export type AppType = Awaited<ReturnType<typeof buildApp>>;
