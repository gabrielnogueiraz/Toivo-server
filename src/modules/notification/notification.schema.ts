import { z, ZodType } from 'zod';

// Schema for URL parameters
export const notificationParamsSchema = z.object({
  notificationId: z.string().uuid(),
});

// Core schema for a single notification object
const notificationCoreSchema = z.object({
  id: z.string().uuid(),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.date(),
  userId: z.string().uuid(),
});

// Schema for an array of notifications
const notificationsArraySchema = z.array(notificationCoreSchema);

// Generic wrapper for API responses
const responseWrapper = <T extends ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
  });

// Final, wrapped response schemas to be used in routes
export const notificationResponseSchema = responseWrapper(notificationCoreSchema);
export const notificationsResponseSchema = responseWrapper(notificationsArraySchema);

// Export inferred types
export type NotificationParams = z.infer<typeof notificationParamsSchema>;

