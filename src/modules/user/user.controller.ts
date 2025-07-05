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
  refreshTokenHandler: RouteHandler;
  logoutHandler: RouteHandler;
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
    try {
      // Verificar se o usuário está presente no request
      if (!request.user) {
        return reply.code(401).send({
          success: false,
          error: { message: 'User not authenticated', code: 'NOT_AUTHENTICATED' }
        });
      }

      // Buscar dados atualizados do usuário para garantir que estão corretos
      const user = await userService.findUserById(request.user.id);
      
      if (!user) {
        return reply.code(404).send({
          success: false,
          error: { message: 'User not found', code: 'USER_NOT_FOUND' }
        });
      }

      return reply.code(200).send({ 
        success: true, 
        data: user,
        message: 'User retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get authenticated user error:', error);
      return reply.code(500).send({
        success: false,
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
      });
    }
  },

    async updateUserHandler(request, reply) {
    try {
      const userId = request.user.id;
      const updateData = request.body;

      const updatedUser = await userService.updateUser(userId, updateData);
      
      return reply.send({
        success: true,
        data: { user: updatedUser },
        message: 'User updated successfully'
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: { message: error.message, code: 'UPDATE_FAILED' }
      });
    }
  },

    async updateUserAvatarHandler(request, reply) {
    try {
      const userId = request.user.id;
      const { profileImage } = request.body;

      const updatedUser = await userService.updateUserAvatar(userId, profileImage);
      
      return reply.send({
        success: true,
        data: { user: updatedUser },
        message: 'Profile image updated successfully'
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: { message: error.message, code: 'AVATAR_UPDATE_FAILED' }
      });
    }
  },

    async updateThemeHandler(request, reply) {
    try {
      const userId = request.user.id;
      const { theme } = request.body;

      const updatedUser = await userService.updateUserTheme(userId, theme);
      
      return reply.send({
        success: true,
        data: { user: updatedUser },
        message: 'Theme updated successfully'
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: { message: error.message, code: 'THEME_UPDATE_FAILED' }
      });
    }
  },

  async refreshTokenHandler(request, reply) {
    try {
      // Verificar se o refresh token existe no cookie
      const refreshToken = request.cookies.refreshToken;
      
      if (!refreshToken) {
        return reply.code(401).send({
          success: false,
          error: { message: 'Refresh token not found', code: 'REFRESH_TOKEN_MISSING' }
        });
      }

      // Verificar se o refresh token é válido
      let decoded: { id: string };
      try {
        decoded = request.server.jwt.verify(refreshToken) as { id: string };
      } catch (error) {
        return reply.code(401).send({
          success: false,
          error: { message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' }
        });
      }

      // Buscar o usuário no banco para garantir que ainda existe
      const user = await userService.findUserById(decoded.id);
      if (!user) {
        return reply.code(401).send({
          success: false,
          error: { message: 'User not found', code: 'USER_NOT_FOUND' }
        });
      }

      // Gerar novos tokens
      const accessToken = request.server.jwt.sign(
        { id: user.id },
        { expiresIn: '15m' }
      );

      const newRefreshToken = request.server.jwt.sign(
        { id: user.id },
        { expiresIn: '7d' }
      );

      // Definir o novo refresh token como cookie
      reply.setCookie('refreshToken', newRefreshToken, {
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
        message: 'Token refreshed successfully'
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return reply.code(401).send({
        success: false,
        error: { message: 'Failed to refresh token', code: 'REFRESH_FAILED' }
      });
    }
  },

  async logoutHandler(request, reply) {
    try {
      // Limpar o refresh token cookie
      reply.clearCookie('refreshToken', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return reply.send({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      return reply.code(400).send({
        success: false,
        error: { message: 'Failed to logout', code: 'LOGOUT_FAILED' }
      });
    }
  },
};

async function generateTokens(request: FastifyRequest, userId: string) {
  const accessToken = await request.jwt.sign({ id: userId }, { expiresIn: '15m' });
  const refreshToken = await request.jwt.sign({ id: userId }, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}
