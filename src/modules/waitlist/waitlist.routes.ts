import { FastifyInstance } from 'fastify';
import { joinWaitlistSchema, waitlistResponseSchema } from './waitlist.schema.js';
import { WaitlistController } from './waitlist.controller.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Convert Zod schemas to JSON Schema
const joinWaitlistJsonSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { 
      type: 'string',
      format: 'email',
      description: 'User email address' 
    }
  },
  additionalProperties: false // Não permite propriedades adicionais
} as const;

const waitlistResponseJsonSchema = {
  type: 'object',
  required: ['success', 'message'],
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  }
} as const;

// Rate limiting configuration
const RATE_LIMIT = {
  max: 5, // Maximum number of requests
  timeWindow: '1 minute', // Time window
  cache: 10000, // Cache size
  whitelist: ['127.0.0.1'], // Whitelisted IPs (e.g., for health checks)
  redis: undefined, // Could be used with Redis in production
  keyGenerator: (req: any) => `${req.ip}-${req.headers['user-agent']}`,
};

export async function waitlistRoutes(fastify: FastifyInstance) {
  // Join waitlist
  fastify.post(
    '/',
    {
      schema: {
        description: 'Join the waitlist with an email address',
        tags: ['Waitlist'],
        summary: 'Join waitlist',
        body: joinWaitlistJsonSchema,
        response: {
          201: waitlistResponseJsonSchema,
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean', default: false },
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                },
              },
            },
          },
          409: {
            description: 'Email already exists',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                },
              },
            },
          },
        },
      },
      // Rate limiting for this endpoint
      config: {
        rateLimit: RATE_LIMIT,
      },
    },
    WaitlistController.joinWaitlist
  );

  // Get waitlist stats (admin only)
  fastify.get(
    '/waitlist/stats',
    {
      schema: {
        description: 'Get waitlist statistics (admin only)',
        tags: ['Waitlist', 'Admin'],
        summary: 'Get waitlist stats',
        security: [{ apiKey: [] }],
        response: {
          200: {
            description: 'Waitlist statistics',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  count: { type: 'number' },
                  lastUpdated: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  code: { type: 'string' },
                },
              },
            },
          },
        },
      },
      // Add admin authentication here if needed
      // preValidation: [fastify.authenticate],
    },
    WaitlistController.getWaitlistStats
  );
}

// Add schema for OpenAPI documentation
export const waitlistSchemas = {
  joinWaitlist: joinWaitlistSchema,
};

export default waitlistRoutes;
