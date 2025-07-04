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
import { prisma } from "./config/db.config.js";
import { UserPayload } from "./types/fastify.js";
import waitlistRoutes from "./modules/waitlist/waitlist.routes.js";
import userRoutes from './modules/user/user.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';

// Importações dos novos módulos
import boardRoutes from "./modules/board/board.routes.js";
import columnRoutes from "./modules/column/column.routes.js";
import taskRoutes from "./modules/task/task.routes.js";
import pomodoroRoutes from "./modules/pomodoro/pomodoro.routes.js";

// Importações dos controladores
import { BoardController } from "./modules/board/board.controller.js";
import { ColumnController } from "./modules/column/column.controller.js";
import { TaskController } from "./modules/task/task.controller.js";
import { PomodoroController } from "./modules/pomodoro/pomodoro.controller.js";

// Importações dos services
import { BoardService } from "./modules/board/board.service.js";
import { ColumnService } from "./modules/column/column.service.js";
import { TaskService } from "./modules/task/task.service.js";
import { PomodoroService } from "./modules/pomodoro/pomodoro.service.js";

// Importações dos repositories
import { BoardRepository } from "./modules/board/board.repository.js";
import { ColumnRepository } from "./modules/column/column.repository.js";
import { TaskRepository } from "./modules/task/task.repository.js";
import { PomodoroRepository } from "./modules/pomodoro/pomodoro.repository.js";

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

  // Instanciar repositories
  const boardRepository = new BoardRepository(prisma);
  const columnRepository = new ColumnRepository(prisma);
  const taskRepository = new TaskRepository(prisma);
  const pomodoroRepository = new PomodoroRepository(prisma);

  // Instanciar services
  const boardService = new BoardService(boardRepository, columnRepository);
  const columnService = new ColumnService(columnRepository);
  const taskService = new TaskService(taskRepository);
  const pomodoroService = new PomodoroService(pomodoroRepository);

  // Instanciar controllers
  const boardController = new BoardController(boardService);
  const columnController = new ColumnController(columnService);
  const taskController = new TaskController(taskService);
  const pomodoroController = new PomodoroController(pomodoroService);

  app.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
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
      api.register((subApi) => boardRoutes(subApi, boardController), { prefix: '/boards' });
      api.register((subApi) => columnRoutes(subApi, columnController), { prefix: '/columns' });
      api.register((subApi) => taskRoutes(subApi, taskController), { prefix: '/tasks' });
      api.register((subApi) => pomodoroRoutes(subApi, pomodoroController), { prefix: '/pomodoro' });
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
