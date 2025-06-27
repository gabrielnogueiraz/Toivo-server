import { FastifyServerOptions } from 'fastify';

export const appConfig: FastifyServerOptions = {
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  disableRequestLogging: process.env.NODE_ENV === 'test',
  trustProxy: true,
  requestTimeout: 30000, // 30 seconds
  connectionTimeout: 30000, // 30 seconds
  keepAliveTimeout: 5000, // 5 seconds
  ignoreTrailingSlash: true,
  caseSensitive: false,
  bodyLimit: 1048576, // 1MB
  maxParamLength: 100,
  return503OnClosing: true,
  forceCloseConnections: 'idle',
};

export const corsConfig = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With',
  ],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-default-secret-key',
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m', // Token expires in 15 minutes
  },
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  },
};

export const serverConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};
