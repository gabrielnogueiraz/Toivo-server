import { AppType } from '../../app.js';
import { GardenController } from './garden.controller.js';
import { GardenService } from './garden.service.js';
import { GardenRepository } from './garden.repository.js';
import { FlowerFiltersSchema, UpdateFlowerSchema, CreateFlowerSchema } from './garden.schema.js';
import { prisma } from '../../config/db.config.js';

const gardenRepository = new GardenRepository(prisma);
const gardenService = new GardenService(gardenRepository);
const gardenController = new GardenController(gardenService);

export default async function gardenRoutes(app: AppType) {
  // POST /garden - Criar flores manualmente (para debug)
  app.post('/garden', {
    preHandler: [app.authenticate],
    schema: {
      body: CreateFlowerSchema,
    },
    handler: gardenController.createFlower.bind(gardenController),
  });

  app.get('/garden', {
    preHandler: [app.authenticate],
    schema: {
      querystring: FlowerFiltersSchema,
    },
    handler: gardenController.getGarden.bind(gardenController),
  });

  app.get('/garden/stats', {
    preHandler: [app.authenticate],
    handler: gardenController.getGardenStats.bind(gardenController),
  });

  app.get('/garden/:flowerId', {
    preHandler: [app.authenticate],
    handler: gardenController.getFlower.bind(gardenController),
  });

  app.patch('/garden/:flowerId', {
    preHandler: [app.authenticate],
    schema: {
      body: UpdateFlowerSchema,
    },
    handler: gardenController.updateFlower.bind(gardenController),
  });

  app.delete('/garden/:flowerId', {
    preHandler: [app.authenticate],
    handler: gardenController.deleteFlower.bind(gardenController),
  });
}
