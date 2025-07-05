import { FastifyServerOptions } from "fastify";

export const appConfig: FastifyServerOptions = {
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  disableRequestLogging: process.env.NODE_ENV === "test",
  trustProxy: true,
  requestTimeout: 30000,
  connectionTimeout: 30000,
  keepAliveTimeout: 5000,
  ignoreTrailingSlash: true,
  caseSensitive: false,
  bodyLimit: 1048576,
  maxParamLength: 100,
  return503OnClosing: true,
  forceCloseConnections: "idle",
};

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const corsConfig = {
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
  ],
  exposedHeaders: ["Content-Range", "X-Total-Count"],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || "your-default-secret-key",
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  },
  cookie: {
    cookieName: "refreshToken",
    signed: false,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/", // Permitir acesso ao cookie em toda a aplicação
    maxAge: 7 * 24 * 60 * 60,
  },
};

export const serverConfig = {
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "0.0.0.0",
  environment: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment:
    !process.env.NODE_ENV || process.env.NODE_ENV === "development",
  isTest: process.env.NODE_ENV === "test",
};
