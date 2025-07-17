import { z } from 'zod';
import { createIdSchema } from '../../utils/validation.js';

// Schema para criação de coluna
export const createColumnSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título deve ter no máximo 100 caracteres'),
  boardId: createIdSchema('ID do board'),
  order: z.number().int().min(0, 'Ordem deve ser um número positivo').optional()
});

// Schema para atualização de coluna
export const updateColumnSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título deve ter no máximo 100 caracteres').optional(),
  order: z.number().int().min(0, 'Ordem deve ser um número positivo').optional()
});

// Schema para parâmetros de rota
export const columnParamsSchema = z.object({
  id: createIdSchema('ID da coluna')
});

// Tipos inferidos
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ColumnParamsInput = z.infer<typeof columnParamsSchema>;
