import { FastifyRequest, FastifyReply } from 'fastify';
import { GardenService } from './garden.service.js';
import { FlowerFiltersSchema, UpdateFlowerSchema } from './garden.schema.js';

export class GardenController {
  constructor(private gardenService: GardenService) {}

  async getGarden(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const filters = FlowerFiltersSchema.parse(request.query);
      
      const flowers = await this.gardenService.getGarden(userId, filters);
      
      return reply.status(200).send({
        success: true,
        data: flowers,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getFlower(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const flowerId = (request.params as any).flowerId;
      
      const flower = await this.gardenService.getFlowerById(flowerId, userId);
      
      return reply.status(200).send({
        success: true,
        data: flower,
      });
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: error instanceof Error ? error.message : 'Flower not found',
      });
    }
  }

  async updateFlower(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const flowerId = (request.params as any).flowerId;
      const data = UpdateFlowerSchema.parse(request.body);
      
      const flower = await this.gardenService.updateFlower(flowerId, userId, data);
      
      return reply.status(200).send({
        success: true,
        data: flower,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update flower',
      });
    }
  }

  async getGardenStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      
      const stats = await this.gardenService.getGardenStats(userId);
      
      return reply.status(200).send({
        success: true,
        data: stats,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get garden stats',
      });
    }
  }

  async deleteFlower(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const flowerId = (request.params as any).flowerId;
      
      await this.gardenService.deleteFlower(flowerId, userId);
      
      return reply.status(200).send({
        success: true,
        message: 'Flower deleted successfully',
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete flower',
      });
    }
  }
}
