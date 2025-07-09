import { $Enums } from '@prisma/client';
import { GardenRepository } from './garden.repository.js';
import { CreateFlower, FlowerFilters, UpdateFlower } from './garden.schema.js';
import { gardenEvents } from '../../utils/gardenEvents.js';

export class GardenService {
  constructor(private gardenRepository: GardenRepository) {}

  private readonly PRIORITY_COLORS = {
    LOW: '#A3BE8C',
    MEDIUM: '#EBCB8B', 
    HIGH: '#BF616A',
  };

  private readonly LEGENDARY_FLOWERS = {
    5: 'Flor da Coragem',
    10: 'Flor Rubra do Foco Total',
    25: 'Rosa da Constância',
  };

  async createFlowerFromTask(userId: string, taskId: string, priority: $Enums.Priority) {
    const flowers = [];

    const normalFlower = await this.gardenRepository.createFlower(userId, {
      taskId,
      type: $Enums.FlowerType.NORMAL,
      priority,
      color: this.PRIORITY_COLORS[priority],
    });

    flowers.push(normalFlower);

    if (priority === $Enums.Priority.HIGH) {
      const highPriorityCount = await this.gardenRepository.countHighPriorityFlowers(userId);
      
      if (this.shouldCreateLegendaryFlower(highPriorityCount)) {
        const legendaryFlower = await this.gardenRepository.createFlower(userId, {
          taskId,
          type: $Enums.FlowerType.LEGENDARY,
          priority,
          legendaryName: this.LEGENDARY_FLOWERS[highPriorityCount as keyof typeof this.LEGENDARY_FLOWERS],
        });

        flowers.push(legendaryFlower);
      }
    }

    gardenEvents.emitFlowerCreated({
      userId,
      flowers,
    });

    return flowers;
  }

  private shouldCreateLegendaryFlower(count: number): boolean {
    return count === 5 || count === 10 || count === 25;
  }

  async getGarden(userId: string, filters: FlowerFilters) {
    return this.gardenRepository.getFlowersByUserId(userId, filters);
  }

  async updateFlower(flowerId: string, userId: string, data: UpdateFlower) {
    const flower = await this.gardenRepository.getFlowerById(flowerId, userId);
    
    if (!flower) {
      throw new Error('Flower not found');
    }

    if (flower.type === $Enums.FlowerType.LEGENDARY && data.customName) {
      throw new Error('Legendary flowers cannot be renamed');
    }

    const updatedFlower = await this.gardenRepository.updateFlower(flowerId, userId, data);

    gardenEvents.emitFlowerUpdated({
      userId,
      flowerId,
      flower: updatedFlower,
    });

    return updatedFlower;
  }

  async getFlowerById(flowerId: string, userId: string) {
    const flower = await this.gardenRepository.getFlowerById(flowerId, userId);
    
    if (!flower) {
      throw new Error('Flower not found');
    }

    return flower;
  }

  async getGardenStats(userId: string) {
    return this.gardenRepository.getGardenStats(userId);
  }

  async deleteFlower(flowerId: string, userId: string) {
    const flower = await this.gardenRepository.getFlowerById(flowerId, userId);
    
    if (!flower) {
      throw new Error('Flower not found');
    }

    await this.gardenRepository.deleteFlower(flowerId, userId);

    gardenEvents.emitFlowerDeleted({
      userId,
      flowerId,
    });

    return { deleted: true };
  }
}
