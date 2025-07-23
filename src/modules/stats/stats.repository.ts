import { PrismaClient } from '@prisma/client';
import { getDateIntervals, formatDateKey } from './stats.utils.js';

export class StatsRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Busca tarefas filtradas por períodos de tempo
   */
  async getTasksByPeriods(userId: string, includeIncomplete: boolean = false) {
    const intervals = getDateIntervals();
    
    const whereClause = {
      userId,
      ...(includeIncomplete ? {} : { completed: true })
    };

    const [todayTasks, weekTasks, monthTasks] = await Promise.all([
      // Tarefas de hoje
      this.prisma.task.findMany({
        where: {
          ...whereClause,
          OR: [
            {
              createdAt: {
                gte: intervals.today.start,
                lte: intervals.today.end
              }
            },
            {
              startAt: {
                gte: intervals.today.start,
                lte: intervals.today.end
              }
            }
          ]
        },
        include: {
          column: {
            include: {
              board: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          _count: {
            select: {
              pomodoros: {
                where: {
                  status: 'COMPLETED'
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),

      // Tarefas da semana
      this.prisma.task.findMany({
        where: {
          ...whereClause,
          OR: [
            {
              createdAt: {
                gte: intervals.week.start,
                lte: intervals.week.end
              }
            },
            {
              startAt: {
                gte: intervals.week.start,
                lte: intervals.week.end
              }
            }
          ]
        },
        include: {
          column: {
            include: {
              board: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          _count: {
            select: {
              pomodoros: {
                where: {
                  status: 'COMPLETED'
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),

      // Tarefas do mês
      this.prisma.task.findMany({
        where: {
          ...whereClause,
          OR: [
            {
              createdAt: {
                gte: intervals.month.start,
                lte: intervals.month.end
              }
            },
            {
              startAt: {
                gte: intervals.month.start,
                lte: intervals.month.end
              }
            }
          ]
        },
        include: {
          column: {
            include: {
              board: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          _count: {
            select: {
              pomodoros: {
                where: {
                  status: 'COMPLETED'
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    return {
      today: todayTasks,
      week: weekTasks,
      month: monthTasks
    };
  }

  /**
   * Busca pomodoros completados por períodos
   */
  async getCompletedPomodorosByPeriods(userId: string) {
    const intervals = getDateIntervals();

    const [todayPomodoros, weekPomodoros, monthPomodoros] = await Promise.all([
      // Pomodoros de hoje
      this.prisma.pomodoro.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: {
            gte: intervals.today.start,
            lte: intervals.today.end
          }
        }
      }),

      // Pomodoros da semana
      this.prisma.pomodoro.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: {
            gte: intervals.week.start,
            lte: intervals.week.end
          }
        }
      }),

      // Pomodoros do mês
      this.prisma.pomodoro.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: {
            gte: intervals.month.start,
            lte: intervals.month.end
          }
        }
      })
    ]);

    return {
      today: todayPomodoros,
      week: weekPomodoros,
      month: monthPomodoros
    };
  }

  /**
   * Busca tarefas completadas por períodos
   */
  async getCompletedTasksByPeriods(userId: string) {
    const intervals = getDateIntervals();

    const [todayTasks, weekTasks, monthTasks] = await Promise.all([
      // Tarefas completadas hoje
      this.prisma.task.count({
        where: {
          userId,
          completed: true,
          updatedAt: {
            gte: intervals.today.start,
            lte: intervals.today.end
          }
        }
      }),

      // Tarefas completadas na semana
      this.prisma.task.count({
        where: {
          userId,
          completed: true,
          updatedAt: {
            gte: intervals.week.start,
            lte: intervals.week.end
          }
        }
      }),

      // Tarefas completadas no mês
      this.prisma.task.count({
        where: {
          userId,
          completed: true,
          updatedAt: {
            gte: intervals.month.start,
            lte: intervals.month.end
          }
        }
      })
    ]);

    return {
      today: todayTasks,
      week: weekTasks,
      month: monthTasks
    };
  }

  /**
   * Busca dados históricos para estatísticas gerais
   */
  async getUserSummaryData(userId: string) {
    const [
      totalPomodoros,
      totalTasksCompleted,
      pomodoroSettings,
      dailyPomodoros,
      allCompletedTasks
    ] = await Promise.all([
      // Total de pomodoros completados
      this.prisma.pomodoro.count({
        where: {
          userId,
          status: 'COMPLETED'
        }
      }),

      // Total de tarefas completadas
      this.prisma.task.count({
        where: {
          userId,
          completed: true
        }
      }),

      // Configurações do pomodoro do usuário
      this.prisma.pomodoroSettings.findUnique({
        where: { userId }
      }),

      // Pomodoros agrupados por data para análise de sequências
      this.prisma.pomodoro.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: {
            not: null
          }
        },
        select: {
          completedAt: true,
          duration: true
        },
        orderBy: {
          completedAt: 'asc'
        }
      }),

      // Todas as tarefas completadas para encontrar o dia mais produtivo
      this.prisma.task.findMany({
        where: {
          userId,
          completed: true
        },
        select: {
          updatedAt: true,
          _count: {
            select: {
              pomodoros: {
                where: {
                  status: 'COMPLETED'
                }
              }
            }
          }
        }
      })
    ]);

    return {
      totalPomodoros,
      totalTasksCompleted,
      pomodoroSettings,
      dailyPomodoros,
      allCompletedTasks
    };
  }

  /**
   * Busca pomodoros agrupados por data para análise de produtividade diária
   */
  async getDailyPomodoroData(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.pomodoro.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
          lte: endDate,
          not: null
        }
      },
      select: {
        completedAt: true,
        duration: true
      },
      orderBy: {
        completedAt: 'asc'
      }
    });
  }

  /**
   * Busca tarefas agrupadas por data para análise de produtividade
   */
  async getDailyTaskCompletionData(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.task.findMany({
      where: {
        userId,
        completed: true,
        updatedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        updatedAt: true,
        priority: true,
        _count: {
          select: {
            pomodoros: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'asc'
      }
    });
  }

  /**
   * Busca o primeiro pomodoro do usuário para calcular dias desde o início
   */
  async getFirstUserActivity(userId: string) {
    const [firstPomodoro, firstTask] = await Promise.all([
      this.prisma.pomodoro.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
      }),
      this.prisma.task.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
      })
    ]);

    // Retorna a data mais antiga entre pomodoro e tarefa
    const dates = [firstPomodoro?.createdAt, firstTask?.createdAt].filter(Boolean);
    return dates.length > 0 ? new Date(Math.min(...dates.map(d => d!.getTime()))) : null;
  }
} 