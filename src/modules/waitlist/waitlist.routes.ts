import { FastifyInstance } from "fastify";
import {
  joinWaitlistSchema,
  waitlistResponseSchema,
} from "./waitlist.schema.js";
import { WaitlistController } from "./waitlist.controller.js";
import { zodToJsonSchema } from "zod-to-json-schema";

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
        body: joinWaitlistSchema,
        response: {
          201: waitlistResponseSchema,
          400: waitlistResponseSchema,
          409: waitlistResponseSchema,
          500: waitlistResponseSchema,
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
        description: "Get waitlist statistics",
        tags: ["Waitlist"],
        summary: "Get waitlist stats",
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
