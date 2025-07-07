import { z } from 'zod';

// Schema para iniciar pomodoro
export const startPomodoroSchema = z.object({
  taskId: z.string().cuid('ID da tarefa inválido'),
  duration: z.number().int().min(1, 'Duração deve ser no mínimo 1 minuto').max(60, 'Duração deve ser no máximo 60 minutos').default(25),
  breakTime: z.number().int().min(1, 'Pausa deve ser no mínimo 1 minuto').max(30, 'Pausa deve ser no máximo 30 minutos').default(5)
});

// Schema para pausar pomodoro
export const pausePomodoroSchema = z.object({
  id: z.string().cuid('ID do pomodoro inválido')
});

// Schema para finalizar pomodoro
export const finishPomodoroSchema = z.object({
  id: z.string().cuid('ID do pomodoro inválido')
});

// Schema para parâmetros de rota
export const pomodoroParamsSchema = z.object({
  id: z.string().cuid('ID inválido')
});

// Schema para query de tarefas disponíveis
export const availableTasksQuerySchema = z.object({
  boardId: z.string().cuid('ID do board inválido').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  search: z.string().min(1).optional()
});

// Tipos inferidos
export type StartPomodoroInput = z.infer<typeof startPomodoroSchema>;
export type PausePomodoroInput = z.infer<typeof pausePomodoroSchema>;
export type FinishPomodoroInput = z.infer<typeof finishPomodoroSchema>;
export type PomodoroParamsInput = z.infer<typeof pomodoroParamsSchema>;
export type AvailableTasksQuery = z.infer<typeof availableTasksQuerySchema>;
