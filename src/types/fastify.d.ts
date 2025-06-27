import { FastifyRequest as OriginalFastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { JWT } from '@fastify/jwt';

export interface UserPayload {
  id: number;
  email: string;
  role: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT;
    user?: UserPayload;
  }
  
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT extends UserPayload {}
}
