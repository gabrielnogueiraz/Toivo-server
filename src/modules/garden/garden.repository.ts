import { PrismaClient, $Enums } from '@prisma/client';
import { CreateFlower, FlowerFilters } from './garden.schema.js';

export class GardenRepository {
  constructor(private prisma: PrismaClient) {}

  async createFlower(userId: string, data: CreateFlower) {
    return this.prisma.gardenFlower.create({
      data: {
        userId,
        taskId: data.taskId,
        type: data.type,
        priority: data.priority,
        color: data.color,
        legendaryName: data.legendaryName,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
          }
        }
      }
    });
  }

  async getFlowersByUserId(userId: string, filters: FlowerFilters) {
    const where: any = { userId };

    if (filters.type) where.type = filters.type;
    if (filters.priority) where.priority = filters.priority;
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    return this.prisma.gardenFlower.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit,
      skip: filters.offset,
    });
  }

  async updateFlower(flowerId: string, userId: string, data: { customName?: string; tags?: string[] }) {
    return this.prisma.gardenFlower.update({
      where: {
        id: flowerId,
        userId,
      },
      data,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
          }
        }
      }
    });
  }

  async getFlowerById(flowerId: string, userId: string) {
    return this.prisma.gardenFlower.findFirst({
      where: {
        id: flowerId,
        userId,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
          }
        }
      }
    });
  }

  async getGardenStats(userId: string) {
    const [totalFlowers, flowersByType, flowersByPriority, highPriorityCount] = await Promise.all([
      this.prisma.gardenFlower.count({ where: { userId } }),
      this.prisma.gardenFlower.groupBy({
        by: ['type'],
        where: { userId },
        _count: { id: true },
      }),
      this.prisma.gardenFlower.groupBy({
        by: ['priority'],
        where: { userId },
        _count: { id: true },
      }),
      this.prisma.gardenFlower.count({
        where: {
          userId,
          priority: $Enums.Priority.HIGH,
        }
      })
    ]);

    const normalFlowers = flowersByType.find((f: any) => f.type === $Enums.FlowerType.NORMAL)?._count.id || 0;
    const legendaryFlowers = flowersByType.find((f: any) => f.type === $Enums.FlowerType.LEGENDARY)?._count.id || 0;

    const priorityMap = {
      low: flowersByPriority.find((f: any) => f.priority === $Enums.Priority.LOW)?._count.id || 0,
      medium: flowersByPriority.find((f: any) => f.priority === $Enums.Priority.MEDIUM)?._count.id || 0,
      high: flowersByPriority.find((f: any) => f.priority === $Enums.Priority.HIGH)?._count.id || 0,
    };

    const nextLegendaryAt = this.getNextLegendaryMilestone(highPriorityCount);

    return {
      totalFlowers,
      normalFlowers,
      legendaryFlowers,
      flowersByPriority: priorityMap,
      highPriorityTasksCompleted: highPriorityCount,
      nextLegendaryAt,
    };
  }

  async countHighPriorityFlowers(userId: string): Promise<number> {
    return this.prisma.gardenFlower.count({
      where: {
        userId,
        priority: $Enums.Priority.HIGH,
      }
    });
  }

  private getNextLegendaryMilestone(currentCount: number): number | null {
    const milestones = [5, 10, 25];
    return milestones.find(milestone => milestone > currentCount) || null;
  }

  async deleteFlower(flowerId: string, userId: string) {
    return this.prisma.gardenFlower.delete({
      where: {
        id: flowerId,
        userId,
      }
    });
  }
}
