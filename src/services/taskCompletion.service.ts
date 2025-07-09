import { $Enums } from '@prisma/client';
import { GardenService } from '../modules/garden/garden.service.js';
import { gardenEvents } from '../utils/gardenEvents.js';

export class TaskCompletionService {
  constructor(private gardenService: GardenService) {
    this.setupEventListeners();
  }

  async handleTaskCompletion(taskId: string, userId: string, priority: $Enums.Priority) {
    try {
      const flowers = await this.gardenService.createFlowerFromTask(userId, taskId, priority);
      
      console.log(`✨ Task ${taskId} completed! Created ${flowers.length} flower(s) for user ${userId}`);
      
      return flowers;
    } catch (error) {
      console.error('Error creating flowers from completed task:', error);
      throw error;
    }
  }

  private setupEventListeners() {
    gardenEvents.onFlowerCreated((event) => {
      console.log(`🌸 New flower(s) created for user ${event.userId}:`, 
        event.flowers.map(f => `${f.type} (${f.priority})`).join(', ')
      );
    });

    gardenEvents.onFlowerUpdated((event) => {
      console.log(`🌻 Flower ${event.flowerId} updated for user ${event.userId}`);
    });

    gardenEvents.onFlowerDeleted((event) => {
      console.log(`🥀 Flower ${event.flowerId} deleted for user ${event.userId}`);
    });
  }
}
