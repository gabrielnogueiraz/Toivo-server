import { PrismaClient, PomodoroStatus } from '@prisma/client';
import { StartPomodoroInput } from './pomodoro.schema.js';

export class PomodoroRepository {
  constructor(private prisma: PrismaClient) {}

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

    return await this.prisma.pomodoro.create({
      data: {
        ...data,
        userId,
        status: PomodoroStatus.IN_PROGRESS,
        startedAt: new Date()
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
}
