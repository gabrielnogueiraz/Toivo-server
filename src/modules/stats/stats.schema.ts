import { z } from 'zod';

// Schema para parâmetros de consulta de estatísticas
export const statsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month']).optional(),
  includeIncomplete: z.coerce.boolean().default(false).optional()
});

// Schema para parâmetros de consulta de produtividade
export const productivityQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
});

// Schema para resposta de tarefas por período
export const tasksStatsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    today: z.array(z.any()),
    week: z.array(z.any()),
    month: z.array(z.any())
  })
});

// Schema para resposta de overview de estatísticas
export const overviewStatsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    pomodoros: z.object({
      today: z.number(),
      week: z.number(),
      month: z.number()
    }),
    tasksCompleted: z.object({
      today: z.number(),
      week: z.number(),
      month: z.number()
    }),
    focusTime: z.object({
      today: z.number(),
      week: z.number(),
      month: z.number()
    }),
    productivity: z.object({
      today: z.number(),
      week: z.number(),
      month: z.number()
    })
  })
});

// Schema para resposta de summary de estatísticas
export const summaryStatsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    totalPomodoros: z.number(),
    totalTasksCompleted: z.number(),
    totalFocusTime: z.number(),
    averageProductivity: z.number(),
    longestFocusStreak: z.number(),
    mostProductiveDay: z.string().nullable()
  })
});

// Tipos inferidos
export type StatsQueryInput = z.infer<typeof statsQuerySchema>;
export type ProductivityQueryInput = z.infer<typeof productivityQuerySchema>;
export type TasksStatsResponse = z.infer<typeof tasksStatsResponseSchema>;
export type OverviewStatsResponse = z.infer<typeof overviewStatsResponseSchema>;
export type SummaryStatsResponse = z.infer<typeof summaryStatsResponseSchema>;

// Tipos para uso interno
export type UserStats = {
  pomodoros: {
    today: number;
    week: number;
    month: number;
  };
  tasksCompleted: {
    today: number;
    week: number;
    month: number;
  };
  focusTime: {
    today: number; // em minutos
    week: number;
    month: number;
  };
  productivity: {
    today: number; // de 0 a 100
    week: number;
    month: number;
  };
};

export type UserSummary = {
  totalPomodoros: number;
  totalTasksCompleted: number;
  totalFocusTime: number; // em minutos
  averageProductivity: number; // média ponderada dos dias
  longestFocusStreak: number; // maior sequência de dias focando
  mostProductiveDay: string | null; // formato ISO, ex: "2025-07-15"
}; 