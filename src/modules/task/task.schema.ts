import { z } from 'zod';

// Schema para criação de tarefa
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres'),
  description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW'], {
    errorMap: () => ({ message: 'Prioridade deve ser: HIGH, MEDIUM ou LOW' })
  }),
  startAt: z.string().datetime('Data de início inválida').transform(str => new Date(str)).optional(),
  endAt: z.string().datetime('Data de fim inválida').transform(str => new Date(str)).optional(),
  pomodoroGoal: z.number().int().min(1, 'Meta de pomodoros deve ser no mínimo 1').max(20, 'Meta de pomodoros deve ser no máximo 20').default(1),
  columnId: z.string().cuid('ID da coluna inválido')
});

// Schema para atualização de tarefa
export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres').optional(),
  description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW'], {
    errorMap: () => ({ message: 'Prioridade deve ser: HIGH, MEDIUM ou LOW' })
  }).optional(),
  startAt: z.string().datetime('Data de início inválida').transform(str => new Date(str)).optional(),
  endAt: z.string().datetime('Data de fim inválida').transform(str => new Date(str)).optional(),
  pomodoroGoal: z.number().int().min(1, 'Meta de pomodoros deve ser no mínimo 1').max(20, 'Meta de pomodoros deve ser no máximo 20').optional(),
  columnId: z.string().cuid('ID da coluna inválido').optional(),
  completed: z.boolean().optional()
});

// Schema para mover tarefa
export const moveTaskSchema = z.object({
  columnId: z.string().cuid('ID da coluna inválido')
});

// Schema para parâmetros de rota
export const taskParamsSchema = z.object({
  id: z.string().cuid('ID inválido')
});

// Validação customizada para datas (apenas se ambas forem fornecidas)
export const taskValidation = z.object({
  startAt: z.date().optional(),
  endAt: z.date().optional()
}).refine(data => {
  // Se ambas as datas forem fornecidas, validar que endAt > startAt
  if (data.startAt && data.endAt) {
    return data.endAt > data.startAt;
  }
  return true;
}, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['endAt']
});

// Tipos inferidos
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type TaskParamsInput = z.infer<typeof taskParamsSchema>;
