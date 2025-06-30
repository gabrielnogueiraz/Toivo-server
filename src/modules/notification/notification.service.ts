import { notificationRepository } from './notification.repository.js';

export const notificationService = {
  async getNotifications(userId: string) {
    return notificationRepository.getNotificationsForUser(userId);
  },

  async markAsRead(notificationId: string) {
    return notificationRepository.markNotificationAsRead(notificationId);
  },
};
