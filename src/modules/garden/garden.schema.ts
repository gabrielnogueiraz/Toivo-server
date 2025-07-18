import { z } from 'zod';
import { createIdSchema } from '../../utils/validation.js';

export const FlowerTypeSchema = z.enum(['NORMAL', 'LEGENDARY']);
export const PrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const CreateFlowerSchema = z.object({
  taskId: createIdSchema('ID da tarefa'),
  type: FlowerTypeSchema,
  priority: PrioritySchema,
  color: z.string().optional(),
  legendaryName: z.string().optional(),
});

export const UpdateFlowerSchema = z.object({
  customName: z.string().min(1).max(100).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
});

export const FlowerFiltersSchema = z.object({
  type: FlowerTypeSchema.optional(),
  priority: PrioritySchema.optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const FlowerResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  taskId: z.string(),
  type: FlowerTypeSchema,
  priority: PrioritySchema,
  color: z.string().nullable(),
  legendaryName: z.string().nullable(),
  customName: z.string().nullable(),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  task: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
  }),
});

export const GardenStatsSchema = z.object({
  totalFlowers: z.number(),
  normalFlowers: z.number(),
  legendaryFlowers: z.number(),
  flowersByPriority: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
  }),
  highPriorityTasksCompleted: z.number(),
  nextLegendaryAt: z.number().nullable(),
});

export type CreateFlower = z.infer<typeof CreateFlowerSchema>;
export type UpdateFlower = z.infer<typeof UpdateFlowerSchema>;
export type FlowerFilters = z.infer<typeof FlowerFiltersSchema>;
export type FlowerResponse = z.infer<typeof FlowerResponseSchema>;
export type GardenStats = z.infer<typeof GardenStatsSchema>;
