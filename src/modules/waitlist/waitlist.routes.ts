import { FastifyInstance } from "fastify";
import {
  joinWaitlistSchema,
  waitlistResponseSchema,
} from "./waitlist.schema.js";
import { WaitlistController } from "./waitlist.controller.js";
import { zodToJsonSchema } from "zod-to-json-schema";

const joinWaitlistJsonSchema = {
  type: "object",
  required: ["email"],
  properties: {
    email: {
      type: "string",
      format: "email",
      description: "User email address",
    },
  },
  additionalProperties: false,
} as const;

const waitlistResponseJsonSchema = {
  type: "object",
  required: ["success", "message"],
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
    data: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
  },
} as const;

const RATE_LIMIT = {
  max: 5,
  timeWindow: "1 minute",
  cache: 10000,
  whitelist: ["127.0.0.1"],
  redis: undefined,
  keyGenerator: (req: any) => `${req.ip}-${req.headers["user-agent"]}`,
};

export async function waitlistRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      schema: {
        description: "Join the waitlist with an email address",
        tags: ["Waitlist"],
        summary: "Join waitlist",
        body: joinWaitlistJsonSchema,
        response: {
          201: waitlistResponseJsonSchema,
          400: {
            type: "object",
            properties: {
              success: { type: "boolean", default: false },
              error: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  code: { type: "string" },
                },
              },
            },
          },
          409: {
            description: "Email already exists",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  code: { type: "string" },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  code: { type: "string" },
                },
              },
            },
          },
        },
      },
      config: {
        rateLimit: RATE_LIMIT,
      },
    },
    WaitlistController.joinWaitlist
  );

  fastify.get(
    "/waitlist/stats",
    {
      schema: {
        description: "Get waitlist statistics (admin only)",
        tags: ["Waitlist", "Admin"],
        summary: "Get waitlist stats",
        security: [{ apiKey: [] }],
        response: {
          200: {
            description: "Waitlist statistics",
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  count: { type: "number" },
                  lastUpdated: { type: "string", format: "date-time" },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  code: { type: "string" },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  code: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    WaitlistController.getWaitlistStats
  );
}

export const waitlistSchemas = {
  joinWaitlist: joinWaitlistSchema,
};

export default waitlistRoutes;
