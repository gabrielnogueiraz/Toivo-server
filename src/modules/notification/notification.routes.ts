import { AppType } from '../../app.js';
import { notificationController } from './notification.controller.js';
import {
  notificationParamsSchema,
  notificationResponseSchema,
  notificationsResponseSchema,
} from './notification.schema.js';

export default async function notificationRoutes(app: AppType) {
  app.get('/', {
    preHandler: [app.authenticate],
    schema: {
      response: {
        200: notificationsResponseSchema,
      },
    },
    handler: notificationController.getNotificationsHandler,
  });

  app.patch(
    '/:notificationId/read',
    {
      preHandler: [app.authenticate],
      schema: {
        params: notificationParamsSchema,
        response: {
          200: notificationResponseSchema,
        },
      },
      handler: notificationController.markNotificationAsReadHandler,
    },
  );
}
