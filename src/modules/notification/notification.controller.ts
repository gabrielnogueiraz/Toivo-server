import { RouteHandler } from 'fastify';
import { z } from 'zod';
import { notificationService } from './notification.service.js';
import {
  notificationParamsSchema,
  notificationResponseSchema,
  notificationsResponseSchema,
} from './notification.schema.js';

// Define a RouteGenericInterface for each handler to ensure type safety
interface GetNotificationsRoute {
  Reply: z.infer<typeof notificationsResponseSchema>;
}

interface MarkAsReadRoute {
  Params: z.infer<typeof notificationParamsSchema>;
  Reply: z.infer<typeof notificationResponseSchema>;
}

// Define the controller interface with strongly-typed handlers
interface INotificationController {
  getNotificationsHandler: RouteHandler<GetNotificationsRoute>;
  markNotificationAsReadHandler: RouteHandler<MarkAsReadRoute>;
}

export const notificationController: INotificationController = {
  async getNotificationsHandler(request, reply) {
    const notifications = await notificationService.getNotifications(request.user.id);
    return { success: true, data: notifications };
  },

  async markNotificationAsReadHandler(request, reply) {
    const { notificationId } = request.params;
    const notification = await notificationService.markAsRead(notificationId);
    return { success: true, data: notification };
  },
};
