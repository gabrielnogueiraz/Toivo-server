import { AppType } from '../../app.js';
import { userController } from './user.controller.js';
import { registerUserSchema, loginUserSchema, updateUserSchema, updateUserThemeSchema, updateUserAvatarSchema } from './user.schema.js';

export default async function userRoutes(app: AppType) {
  app.post('/register', {
    schema: {
      body: registerUserSchema,
    },
    handler: userController.registerUserHandler,
  });

  app.post('/login', {
    schema: {
      body: loginUserSchema,
    },
    handler: userController.loginUserHandler,
  });

  app.get('/me', {
    preHandler: [app.authenticate],
    handler: userController.getAuthenticatedUserHandler,
  });

  app.put('/me', {
    preHandler: [app.authenticate],
    schema: {
      body: updateUserSchema,
    },
    handler: userController.updateUserHandler,
  });

  app.patch('/me/avatar', {
    preHandler: [app.authenticate],
    schema: {
      body: updateUserAvatarSchema,
    },
    handler: userController.updateUserAvatarHandler,
  });

  app.patch('/me/theme', {
    preHandler: [app.authenticate],
    schema: {
      body: updateUserThemeSchema,
    },
    handler: userController.updateThemeHandler,
  });

  app.get('/search', {
    preHandler: [app.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 2 }
        },
        required: ['q']
      }
    },
    handler: userController.findUsersByNameHandler,
  });
}
