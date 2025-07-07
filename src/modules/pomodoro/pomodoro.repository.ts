import { PrismaClient, PomodoroStatus } from '@prisma/client';
import { StartPomodoroInput, AvailableTasksQuery, PomodoroSettingsInput, UpdatePomodoroSettingsInput } from './pomodoro.schema.js';

export class PomodoroRepository {
  constructor(private prisma: PrismaClient) {}

  // Configurações do Pomodoro
  async getUserSettings(userId: string) {
    let settings = await this.prisma.pomodoroSettings.findUnique({
      where: { userId }
    });

    // Se não existir configuração, cria uma com valores padrão
    if (!settings) {
      settings = await this.prisma.pomodoroSettings.create({
        data: {
          userId,
          focusDuration: 25,
          shortBreakTime: 5,
          longBreakTime: 15
        }
      });
    }

    return settings;
  }

  async updateUserSettings(userId: string, data: UpdatePomodoroSettingsInput) {
    // Primeiro garante que as configurações existem
    await this.getUserSettings(userId);
    
    return await this.prisma.pomodoroSettings.update({
      where: { userId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async create(data: StartPomodoroInput, userId: string) {
    // Verifica se a tarefa pertence ao usuário
    const task = await this.prisma.task.findFirst({
      where: { id: data.taskId, userId }
    });

    if (!task) {
      throw new Error('Tarefa não encontrada ou não pertence ao usuário');
    }

    // Verifica se não há pomodoro ativo para o usuário
    const activePomodoro = await this.prisma.pomodoro.findFirst({
      where: { 
        userId,
        status: {
          in: [PomodoroStatus.IN_PROGRESS, PomodoroStatus.PAUSED]
        }
      }
    });

    if (activePomodoro) {
      throw new Error('Você já tem um pomodoro ativo. Finalize-o antes de iniciar outro.');
    }

    // Busca as configurações do usuário ou usa valores padrão
    const userSettings = await this.getUserSettings(userId);
    
    console.log('Debug - Data recebido:', data);
    console.log('Debug - Configurações do usuário:', userSettings);
    
    // Determina a duração: usa valor customizado se fornecido, senão usa configuração do usuário
    const duration = (data.duration !== undefined && data.duration > 0) 
      ? data.duration 
      : userSettings.focusDuration;
    
    // Determina o tempo de pausa: usa valor customizado se fornecido, senão usa configuração do usuário
    const breakTime = (data.breakTime !== undefined && data.breakTime > 0) 
      ? data.breakTime 
      : userSettings.shortBreakTime;
    
    const pomodoroData = {
      taskId: data.taskId,
      duration,
      breakTime,
      userId,
      status: PomodoroStatus.IN_PROGRESS,
      startedAt: new Date()
    };

    console.log('Debug - Dados do pomodoro criado:', pomodoroData);

    return await this.prisma.pomodoro.create({
      data: pomodoroData,
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true
              }
            }
          }
        }
      }
    });
  }

  async findById(id: string, userId: string) {
    return await this.prisma.pomodoro.findFirst({
      where: { id, userId },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true
              }
            }
          }
        }
      }
    });
  }

  async findActivePomodoro(userId: string) {
    return await this.prisma.pomodoro.findFirst({
      where: { 
        userId,
        status: {
          in: [PomodoroStatus.IN_PROGRESS, PomodoroStatus.PAUSED]
        }
      },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true
              }
            }
          }
        }
      }
    });
  }

  async findByUser(userId: string) {
    return await this.prisma.pomodoro.findMany({
      where: { userId },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async pause(id: string, userId: string) {
    const pomodoro = await this.prisma.pomodoro.findFirst({
      where: { id, userId, status: PomodoroStatus.IN_PROGRESS }
    });

    if (!pomodoro) {
      throw new Error('Pomodoro não encontrado ou não está em execução');
    }

    return await this.prisma.pomodoro.update({
      where: { id },
      data: {
        status: PomodoroStatus.PAUSED,
        pausedAt: new Date()
      },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true
              }
            }
          }
        }
      }
    });
  }

  async resume(id: string, userId: string) {
    const pomodoro = await this.prisma.pomodoro.findFirst({
      where: { id, userId, status: PomodoroStatus.PAUSED }
    });

    if (!pomodoro) {
      throw new Error('Pomodoro não encontrado ou não está pausado');
    }

    return await this.prisma.pomodoro.update({
      where: { id },
      data: {
        status: PomodoroStatus.IN_PROGRESS,
        pausedAt: null
      },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true
              }
            }
          }
        }
      }
    });
  }

  async finish(id: string, userId: string) {
    const pomodoro = await this.prisma.pomodoro.findFirst({
      where: { 
        id, 
        userId,
        status: {
          in: [PomodoroStatus.IN_PROGRESS, PomodoroStatus.PAUSED]
        }
      }
    });

    if (!pomodoro) {
      throw new Error('Pomodoro não encontrado ou não está ativo');
    }

    return await this.prisma.pomodoro.update({
      where: { id },
      data: {
        status: PomodoroStatus.COMPLETED,
        completedAt: new Date()
      },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true
              }
            }
          }
        }
      }
    });
  }

  async checkOwnership(id: string, userId: string): Promise<boolean> {
    const pomodoro = await this.prisma.pomodoro.findFirst({
      where: { id, userId }
    });
    return !!pomodoro;
  }

  async getAvailableTasks(userId: string, filters?: AvailableTasksQuery) {
    const where: any = { 
      userId
    };

    // Aplicar filtros se fornecidos
    if (filters?.boardId) {
      where.column = {
        boardId: filters.boardId
      };
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      ];
    }

    return await this.prisma.task.findMany({
      where,
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
      orderBy: [
        {
          priority: 'desc'
        },
        {
          createdAt: 'desc'
        }
      ]
    });
  }
}
