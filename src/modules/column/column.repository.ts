import { PrismaClient } from '@prisma/client';
import { CreateColumnInput, UpdateColumnInput } from './column.schema.js';

export class ColumnRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateColumnInput, userId: string) {
    // Verifica se o board pertence ao usuário
    const board = await this.prisma.board.findFirst({
      where: { id: data.boardId, userId }
    });

    if (!board) {
      throw new Error('Board não encontrado ou não pertence ao usuário');
    }

    // Se order não foi especificado, pega o próximo número
    let order = data.order;
    if (order === undefined) {
      const lastColumn = await this.prisma.column.findFirst({
        where: { boardId: data.boardId },
        orderBy: { order: 'desc' }
      });
      order = lastColumn ? lastColumn.order + 1 : 0;
    }

    return await this.prisma.column.create({
      data: {
        ...data,
        order
      },
      include: {
        tasks: true
      }
    });
  }

  async findByBoardId(boardId: string, userId: string) {
    // Verifica se o board pertence ao usuário
    const board = await this.prisma.board.findFirst({
      where: { id: boardId, userId }
    });

    if (!board) {
      throw new Error('Board não encontrado ou não pertence ao usuário');
    }

    return await this.prisma.column.findMany({
      where: { boardId },
      include: {
        tasks: true
      },
      orderBy: {
        order: 'asc'
      }
    });
  }

  async findById(id: string, userId: string) {
    return await this.prisma.column.findFirst({
      where: { 
        id,
        board: {
          userId
        }
      },
      include: {
        tasks: true
      }
    });
  }

  async update(id: string, data: UpdateColumnInput, userId: string) {
    // Verifica se a coluna pertence ao usuário através do board
    const column = await this.prisma.column.findFirst({
      where: { 
        id,
        board: {
          userId
        }
      }
    });

    if (!column) {
      throw new Error('Coluna não encontrada ou não pertence ao usuário');
    }

    return await this.prisma.column.update({
      where: { id },
      data,
      include: {
        tasks: true
      }
    });
  }

  async delete(id: string, userId: string) {
    // Verifica se a coluna pertence ao usuário através do board
    const column = await this.prisma.column.findFirst({
      where: { 
        id,
        board: {
          userId
        }
      }
    });

    if (!column) {
      throw new Error('Coluna não encontrada ou não pertence ao usuário');
    }

    return await this.prisma.column.delete({
      where: { id }
    });
  }

  async checkOwnership(id: string, userId: string): Promise<boolean> {
    const column = await this.prisma.column.findFirst({
      where: { 
        id,
        board: {
          userId
        }
      }
    });
    return !!column;
  }
}
