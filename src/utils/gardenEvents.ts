import { EventEmitter } from 'events';

export interface FlowerCreatedEvent {
  userId: string;
  flowers: Array<{
    id: string;
    userId: string;
    taskId: string;
    type: 'NORMAL' | 'LEGENDARY';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    color: string | null;
    legendaryName: string | null;
    customName: string | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    task: {
      id: string;
      title: string;
      description: string | null;
    };
  }>;
}

export interface FlowerUpdatedEvent {
  userId: string;
  flowerId: string;
  flower: {
    id: string;
    userId: string;
    taskId: string;
    type: 'NORMAL' | 'LEGENDARY';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    color: string | null;
    legendaryName: string | null;
    customName: string | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    task: {
      id: string;
      title: string;
      description: string | null;
    };
  };
}

export interface FlowerDeletedEvent {
  userId: string;
  flowerId: string;
}

class GardenEventEmitter extends EventEmitter {
  emitFlowerCreated(event: FlowerCreatedEvent) {
    this.emit('flower:created', event);
  }

  emitFlowerUpdated(event: FlowerUpdatedEvent) {
    this.emit('flower:updated', event);
  }

  emitFlowerDeleted(event: FlowerDeletedEvent) {
    this.emit('flower:deleted', event);
  }

  onFlowerCreated(callback: (event: FlowerCreatedEvent) => void) {
    this.on('flower:created', callback);
  }

  onFlowerUpdated(callback: (event: FlowerUpdatedEvent) => void) {
    this.on('flower:updated', callback);
  }

  onFlowerDeleted(callback: (event: FlowerDeletedEvent) => void) {
    this.on('flower:deleted', callback);
  }
}

export const gardenEvents = new GardenEventEmitter();
