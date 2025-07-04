import { PrismaClient } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput } from './task.schema.js';

export class TaskRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateTaskInput, userId: string) {
    // Verifica se a coluna pertence ao usuário
    const column = await this.prisma.column.findFirst({
      where: { 
        id: data.columnId,
        board: {
          userId
        }
      }
    });

    if (!column) {
      throw new Error('Coluna não encontrada ou não pertence ao usuário');
    }

    const { startAt, endAt, ...rest } = data;
    const taskData: any = {
      ...rest,
      userId
    };
    if (startAt !== undefined) taskData.startAt = startAt;
    if (endAt !== undefined) taskData.endAt = endAt;

    return await this.prisma.task.create({
      data: taskData,
      include: {
        column: {
          include: {
            board: true
          }
        },
        pomodoros: true
      }
    });
  }

  async findMany(userId: string) {
    return await this.prisma.task.findMany({
      where: { userId },
      include: {
        column: {
          include: {
            board: true
          }
        },
        pomodoros: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id: string, userId: string) {
    return await this.prisma.task.findFirst({
      where: { id, userId },
      include: {
        column: {
          include: {
            board: true
          }
        },
        pomodoros: true
      }
    });
  }

  async update(id: string, data: UpdateTaskInput, userId: string) {
    // Se está mudando de coluna, verifica se a nova coluna pertence ao usuário
    if (data.columnId) {
      const column = await this.prisma.column.findFirst({
        where: { 
          id: data.columnId,
          board: {
            userId
          }
        }
      });

      if (!column) {
        throw new Error('Coluna não encontrada ou não pertence ao usuário');
      }
    }

    return await this.prisma.task.update({
      where: { id, userId },
      data,
      include: {
        column: {
          include: {
            board: true
          }
        },
        pomodoros: true
      }
    });
  }

  async delete(id: string, userId: string) {
    return await this.prisma.task.delete({
      where: { id, userId }
    });
  }

  async moveToColumn(id: string, columnId: string, userId: string) {
    // Verifica se a coluna de destino pertence ao usuário
    const column = await this.prisma.column.findFirst({
      where: { 
        id: columnId,
        board: {
          userId
        }
      }
    });

    if (!column) {
      throw new Error('Coluna de destino não encontrada ou não pertence ao usuário');
    }

    return await this.prisma.task.update({
      where: { id, userId },
      data: { columnId },
      include: {
        column: {
          include: {
            board: true
          }
        },
        pomodoros: true
      }
    });
  }

  async checkOwnership(id: string, userId: string): Promise<boolean> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId }
    });
    return !!task;
  }

  async findByColumnId(columnId: string, userId: string) {
    return await this.prisma.task.findMany({
      where: { 
        columnId,
        userId
      },
      include: {
        column: {
          include: {
            board: true
          }
        },
        pomodoros: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
