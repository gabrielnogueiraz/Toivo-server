import { StatsRepository } from './stats.repository.js';
import { UserStats, UserSummary } from './stats.schema.js';
import {
  calculateProductivity,
  convertPomodorosToFocusTime,
  calculateAverageProductivity,
  calculateLongestFocusStreak,
  findMostProductiveDay,
  groupByDate,
  formatDateKey,
  getDateIntervals,
  getDaysInRange,
  DEFAULT_EXPECTED_FOCUS_TIME,
  POMODORO_DURATION
} from './stats.utils.js';
import { startOfDay } from 'date-fns';

export class StatsService {
  constructor(private statsRepository: StatsRepository) {}

  /**
   * Busca tarefas por períodos
   */
  async getTasksByPeriods(userId: string, includeIncomplete: boolean = false) {
    try {
      const tasks = await this.statsRepository.getTasksByPeriods(userId, includeIncomplete);
      
      return {
        success: true,
        data: tasks
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar tarefas por período',
          code: 'TASKS_FETCH_ERROR'
        }
      };
    }
  }

  /**
   * Busca overview das estatísticas de produtividade
   */
  async getOverviewStats(userId: string): Promise<{ success: boolean; data?: UserStats; error?: any }> {
    try {
      // Buscar dados em paralelo
      const [pomodoroStats, taskStats] = await Promise.all([
        this.statsRepository.getCompletedPomodorosByPeriods(userId),
        this.statsRepository.getCompletedTasksByPeriods(userId)
      ]);

      // Buscar configurações do pomodoro do usuário para duração correta
      const userSummary = await this.statsRepository.getUserSummaryData(userId);
      const pomodoroMinutes = userSummary.pomodoroSettings?.focusDuration || POMODORO_DURATION;

      // Calcular tempo focado baseado nos pomodoros
      const focusTime = {
        today: convertPomodorosToFocusTime(pomodoroStats.today, pomodoroMinutes),
        week: convertPomodorosToFocusTime(pomodoroStats.week, pomodoroMinutes),
        month: convertPomodorosToFocusTime(pomodoroStats.month, pomodoroMinutes)
      };

      // Calcular produtividade
      const productivity = {
        today: calculateProductivity(focusTime.today),
        week: calculateProductivity(focusTime.week, DEFAULT_EXPECTED_FOCUS_TIME * 7), // 7 dias
        month: calculateProductivity(focusTime.month, DEFAULT_EXPECTED_FOCUS_TIME * 30) // ~30 dias
      };

      const stats: UserStats = {
        pomodoros: pomodoroStats,
        tasksCompleted: taskStats,
        focusTime,
        productivity
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar estatísticas de overview',
          code: 'OVERVIEW_STATS_ERROR'
        }
      };
    }
  }

  /**
   * Busca resumo geral do desempenho do usuário
   */
  async getSummaryStats(userId: string): Promise<{ success: boolean; data?: UserSummary; error?: any }> {
    try {
      const summaryData = await this.statsRepository.getUserSummaryData(userId);
      const pomodoroMinutes = summaryData.pomodoroSettings?.focusDuration || POMODORO_DURATION;

      // Calcular tempo focado total
      const totalFocusTime = convertPomodorosToFocusTime(summaryData.totalPomodoros, pomodoroMinutes);

      // Processar dados diários para análise de produtividade
      const dailyProductivityData = await this.calculateDailyProductivityData(
        userId, 
        summaryData.dailyPomodoros,
        pomodoroMinutes
      );

      // Calcular média de produtividade
      const productivityValues = Object.values(dailyProductivityData);
      const averageProductivity = calculateAverageProductivity(productivityValues);

      // Calcular maior sequência de foco
      const focusDays = summaryData.dailyPomodoros
        .filter(p => p.completedAt)
        .map(p => startOfDay(p.completedAt!));
      
      // Remover duplicatas
      const uniqueFocusDays = Array.from(
        new Set(focusDays.map(d => d.getTime()))
      ).map(time => new Date(time));

      const longestFocusStreak = calculateLongestFocusStreak(uniqueFocusDays);

      // Encontrar dia mais produtivo
      const mostProductiveDay = findMostProductiveDay(dailyProductivityData);

      const summary: UserSummary = {
        totalPomodoros: summaryData.totalPomodoros,
        totalTasksCompleted: summaryData.totalTasksCompleted,
        totalFocusTime,
        averageProductivity,
        longestFocusStreak,
        mostProductiveDay
      };

      return {
        success: true,
        data: summary
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar resumo de estatísticas',
          code: 'SUMMARY_STATS_ERROR'
        }
      };
    }
  }

  /**
   * Calcula dados de produtividade diária
   */
  private async calculateDailyProductivityData(
    userId: string, 
    dailyPomodoros: Array<{ completedAt: Date | null; duration: number }>,
    pomodoroMinutes: number
  ): Promise<Record<string, number>> {
    // Agrupar pomodoros por data
    const pomodorosByDate = groupByDate(
      dailyPomodoros.filter(p => p.completedAt),
      'completedAt'
    );

    // Calcular produtividade para cada dia
    const dailyProductivity: Record<string, number> = {};

    for (const [dateKey, pomodoros] of Object.entries(pomodorosByDate)) {
      const totalFocusTime = pomodoros.length * pomodoroMinutes;
      const productivity = calculateProductivity(totalFocusTime);
      dailyProductivity[dateKey] = productivity;
    }

    return dailyProductivity;
  }

  /**
   * Busca dados de produtividade para um período específico
   */
  async getProductivityDataForPeriod(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ) {
    try {
      const [pomodoroData, taskData] = await Promise.all([
        this.statsRepository.getDailyPomodoroData(userId, startDate, endDate),
        this.statsRepository.getDailyTaskCompletionData(userId, startDate, endDate)
      ]);

      // Buscar configurações do usuário
      const summaryData = await this.statsRepository.getUserSummaryData(userId);
      const pomodoroMinutes = summaryData.pomodoroSettings?.focusDuration || POMODORO_DURATION;

      // Agrupar dados por data
      const pomodorosByDate = groupByDate(pomodoroData, 'completedAt');
      const tasksByDate = groupByDate(taskData, 'updatedAt');

      // Gerar todos os dias do período
      const allDays = getDaysInRange(startDate, endDate);
      
      const dailyData = allDays.map(day => {
        const dateKey = formatDateKey(day);
        const dayPomodoros = pomodorosByDate[dateKey] || [];
        const dayTasks = tasksByDate[dateKey] || [];

        const focusTime = dayPomodoros.length * pomodoroMinutes;
        const productivity = calculateProductivity(focusTime);

        return {
          date: dateKey,
          pomodoros: dayPomodoros.length,
          tasksCompleted: dayTasks.length,
          focusTime,
          productivity
        };
      });

      return {
        success: true,
        data: {
          dailyData,
          summary: {
            totalPomodoros: pomodoroData.length,
            totalTasksCompleted: taskData.length,
            totalFocusTime: pomodoroData.length * pomodoroMinutes,
            averageProductivity: calculateAverageProductivity(
              dailyData.map(d => d.productivity)
            )
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar dados de produtividade',
          code: 'PRODUCTIVITY_DATA_ERROR'
        }
      };
    }
  }

  /**
   * Busca estatísticas de comparação entre períodos
   */
  async getComparativeStats(userId: string) {
    try {
      const intervals = getDateIntervals();
      
      // Buscar dados de duas semanas para comparação
      const lastWeekStart = new Date(intervals.week.start);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(intervals.week.end);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

      const [currentWeekData, lastWeekData] = await Promise.all([
        this.getProductivityDataForPeriod(userId, intervals.week.start, intervals.week.end),
        this.getProductivityDataForPeriod(userId, lastWeekStart, lastWeekEnd)
      ]);

      if (!currentWeekData.success || !lastWeekData.success) {
        throw new Error('Erro ao buscar dados comparativos');
      }

      const currentSummary = currentWeekData.data!.summary;
      const lastSummary = lastWeekData.data!.summary;

      const comparison = {
        pomodoros: {
          current: currentSummary.totalPomodoros,
          previous: lastSummary.totalPomodoros,
          change: currentSummary.totalPomodoros - lastSummary.totalPomodoros,
          changePercent: lastSummary.totalPomodoros > 0 
            ? Math.round(((currentSummary.totalPomodoros - lastSummary.totalPomodoros) / lastSummary.totalPomodoros) * 100)
            : 0
        },
        tasksCompleted: {
          current: currentSummary.totalTasksCompleted,
          previous: lastSummary.totalTasksCompleted,
          change: currentSummary.totalTasksCompleted - lastSummary.totalTasksCompleted,
          changePercent: lastSummary.totalTasksCompleted > 0
            ? Math.round(((currentSummary.totalTasksCompleted - lastSummary.totalTasksCompleted) / lastSummary.totalTasksCompleted) * 100)
            : 0
        },
        productivity: {
          current: currentSummary.averageProductivity,
          previous: lastSummary.averageProductivity,
          change: currentSummary.averageProductivity - lastSummary.averageProductivity,
          changePercent: lastSummary.averageProductivity > 0
            ? Math.round(((currentSummary.averageProductivity - lastSummary.averageProductivity) / lastSummary.averageProductivity) * 100)
            : 0
        }
      };

      return {
        success: true,
        data: comparison
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar estatísticas comparativas',
          code: 'COMPARATIVE_STATS_ERROR'
        }
      };
    }
  }
} 