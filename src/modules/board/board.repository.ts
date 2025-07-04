import { PrismaClient } from '@prisma/client';
import { CreateBoardInput, UpdateBoardInput } from './board.schema.js';

export class BoardRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateBoardInput, userId: string) {
    return await this.prisma.board.create({
      data: {
        ...data,
        userId
      },
      include: {
        columns: {
          include: {
            tasks: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  async findMany(userId: string) {
    return await this.prisma.board.findMany({
      where: { userId },
      include: {
        columns: {
          include: {
            tasks: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id: string, userId: string) {
    return await this.prisma.board.findFirst({
      where: { id, userId },
      include: {
        columns: {
          include: {
            tasks: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  async update(id: string, data: UpdateBoardInput, userId: string) {
    return await this.prisma.board.update({
      where: { id, userId },
      data,
      include: {
        columns: {
          include: {
            tasks: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  async delete(id: string, userId: string) {
    return await this.prisma.board.delete({
      where: { id, userId }
    });
  }

  async checkOwnership(id: string, userId: string): Promise<boolean> {
    const board = await this.prisma.board.findFirst({
      where: { id, userId }
    });
    return !!board;
  }
}
