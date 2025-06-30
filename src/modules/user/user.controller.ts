import { FastifyRequest, RouteHandler } from 'fastify';
import { z } from 'zod';
import { userService } from './user.service.js';
import { loginUserSchema, registerUserSchema, updateUserSchema, updateUserThemeSchema, updateUserAvatarSchema } from './user.schema.js';

interface IUserController {
  registerUserHandler: RouteHandler<{ Body: z.infer<typeof registerUserSchema> }>;
  loginUserHandler: RouteHandler<{ Body: z.infer<typeof loginUserSchema> }>;
  getAuthenticatedUserHandler: RouteHandler;
  updateUserHandler: RouteHandler<{ Body: z.infer<typeof updateUserSchema> }>;
  updateUserAvatarHandler: RouteHandler<{ Body: z.infer<typeof updateUserAvatarSchema> }>;
  updateThemeHandler: RouteHandler<{ Body: z.infer<typeof updateUserThemeSchema> }>;
  findUsersByNameHandler: RouteHandler<{ Querystring: { q: string } }>;
}

export const userController: IUserController = {
  async findUsersByNameHandler(request, reply) {
    try {
      const { q: searchTerm } = request.query;
      if (!searchTerm || searchTerm.trim().length < 2) {
        return reply.code(400).send({
          success: false,
          error: { message: 'Search term must be at least 2 characters long', code: 'INVALID_SEARCH_TERM' }
        });
      }

      const users = await userService.findUsersByName(searchTerm);
      return reply.send({
        success: true,
        data: { users },
        message: 'Users found successfully'
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: { message: error.message, code: 'SEARCH_FAILED' }
      });
    }
  },
    async registerUserHandler(request, reply) {
    try {
      const user = await userService.registerUser(request.server, request.body);
      
      // Gera os tokens usando o app do fastify
      const accessToken = request.server.jwt.sign(
        { id: user.id },
        { expiresIn: '15m' }
      );
      
      const refreshToken = request.server.jwt.sign(
        { id: user.id },
        { expiresIn: '7d' }
      );

      reply.setCookie('refreshToken', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
      });

      return reply.code(201).send({ 
        success: true, 
        data: { 
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            theme: user.theme,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }, 
          accessToken 
        },
        message: 'User registered successfully'
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      return reply.code(400).send({ 
        success: false, 
        error: { 
          message: error.message, 
          code: error.code || 'REGISTRATION_FAILED' 
        } 
      });
    }
  },

    async loginUserHandler(request, reply) {
    try {
      const { email, password } = request.body;

      const user = await userService.loginUser(request.server, { email, password });
      
      // Gera os tokens usando o app do fastify
      const accessToken = request.server.jwt.sign(
        { id: user.id },
        { expiresIn: '15m' }
      );
      
      const refreshToken = request.server.jwt.sign(
        { id: user.id },
        { expiresIn: '7d' }
      );

      reply.setCookie('refreshToken', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
      });

      return reply.send({
        success: true,
        data: { 
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            theme: user.theme,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          accessToken 
        },
        message: 'Login successful',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return reply.code(401).send({
        success: false,
        error: { message: error.message, code: 'INVALID_CREDENTIALS' },
      });
    }
  },

    async getAuthenticatedUserHandler(request, reply) {
    return reply.code(200).send({ success: true, data: request.user });
  },

    async updateUserHandler(request, reply) {
    // Implementation to be added
  },

    async updateUserAvatarHandler(request, reply) {
    // Implementation to be added
  },

    async updateThemeHandler(request, reply) {
    // Implementation to be added
  },
};

async function generateTokens(request: FastifyRequest, userId: string) {
  const accessToken = await request.jwt.sign({ id: userId }, { expiresIn: '15m' });
  const refreshToken = await request.jwt.sign({ id: userId }, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}
