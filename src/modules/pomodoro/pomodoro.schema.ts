import { z } from 'zod';
import { createIdSchema } from '../../utils/validation.js';

// Schema para iniciar pomodoro
export const startPomodoroSchema = z.object({
  taskId: createIdSchema('ID da tarefa'),
  duration: z.number().int().min(1, 'Duração deve ser no mínimo 1 minuto').max(60, 'Duração deve ser no máximo 60 minutos').optional(),
  breakTime: z.number().int().min(1, 'Pausa deve ser no mínimo 1 minuto').max(30, 'Pausa deve ser no máximo 30 minutos').optional()
});

// Schema para configurações do pomodoro
export const pomodoroSettingsSchema = z.object({
  focusDuration: z.number().int().min(1, 'Duração do foco deve ser no mínimo 1 minuto').max(60, 'Duração do foco deve ser no máximo 60 minutos').default(25),
  shortBreakTime: z.number().int().min(1, 'Pausa curta deve ser no mínimo 1 minuto').max(30, 'Pausa curta deve ser no máximo 30 minutos').default(5),
  longBreakTime: z.number().int().min(1, 'Pausa longa deve ser no mínimo 1 minuto').max(60, 'Pausa longa deve ser no máximo 60 minutos').default(15)
});

// Schema para atualização de configurações do pomodoro
export const updatePomodoroSettingsSchema = pomodoroSettingsSchema.partial();

// Schema para pausar pomodoro
export const pausePomodoroSchema = z.object({
  id: createIdSchema('ID do pomodoro')
});

// Schema para finalizar pomodoro
export const finishPomodoroSchema = z.object({
  id: createIdSchema('ID do pomodoro')
});

// Schema para parâmetros de rota
export const pomodoroParamsSchema = z.object({
  id: createIdSchema('ID do pomodoro')
});

// Schema para query de tarefas disponíveis
export const availableTasksQuerySchema = z.object({
  boardId: createIdSchema('ID do board').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  search: z.string().min(1).optional()
});

// Tipos inferidos
export type StartPomodoroInput = z.infer<typeof startPomodoroSchema>;
export type PausePomodoroInput = z.infer<typeof pausePomodoroSchema>;
export type FinishPomodoroInput = z.infer<typeof finishPomodoroSchema>;
export type PomodoroParamsInput = z.infer<typeof pomodoroParamsSchema>;
export type AvailableTasksQuery = z.infer<typeof availableTasksQuerySchema>;
export type PomodoroSettingsInput = z.infer<typeof pomodoroSettingsSchema>;
export type UpdatePomodoroSettingsInput = z.infer<typeof updatePomodoroSettingsSchema>;
