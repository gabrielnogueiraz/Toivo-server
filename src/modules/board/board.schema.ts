import { z } from 'zod';
import { createIdSchema } from '../../utils/validation.js';

// Schema para criação de board
export const createBoardSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título deve ter no máximo 100 caracteres')
});

// Schema para atualização de board
export const updateBoardSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título deve ter no máximo 100 caracteres')
});

// Schema para parâmetros de rota
export const boardParamsSchema = z.object({
  id: createIdSchema('ID do board')
});

// Tipos inferidos
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type BoardParamsInput = z.infer<typeof boardParamsSchema>;
