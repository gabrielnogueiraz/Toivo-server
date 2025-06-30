import '@fastify/rate-limit';

// Augment FastifyContextConfig to include the `rateLimit` property used in route options
// This prevents TypeScript errors during build when we specify per-route rate limiting.

declare module 'fastify' {
  interface FastifyContextConfig {
    rateLimit?: {
      max?: number;
      timeWindow?: string | number;
      keyGenerator?: (...args: any[]) => string;
      skip?: (...args: any[]) => boolean;
    };
  }
}
