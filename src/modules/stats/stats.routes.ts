import { AppType } from '../../app.js';
import { statsQuerySchema, productivityQuerySchema } from './stats.schema.js';

export default async function statsRoutes(app: AppType, statsController: any) {
  // GET /stats/tasks - Buscar tarefas por período
  app.get('/tasks', {
    schema: {
      querystring: statsQuerySchema,
    },
    preHandler: [app.authenticate],
    handler: statsController.getTasks,
  });

  // GET /stats/overview - Buscar estatísticas de overview
  app.get('/overview', {
    preHandler: [app.authenticate],
    handler: statsController.getOverview,
  });

  // GET /stats/summary - Buscar resumo geral do desempenho
  app.get('/summary', {
    preHandler: [app.authenticate],
    handler: statsController.getSummary,
  });

  // GET /stats/productivity - Buscar dados de produtividade para período específico
  app.get('/productivity', {
    schema: {
      querystring: productivityQuerySchema,
    },
    preHandler: [app.authenticate],
    handler: statsController.getProductivityData,
  });

  // GET /stats/comparison - Buscar estatísticas comparativas
  app.get('/comparison', {
    preHandler: [app.authenticate],
    handler: statsController.getComparison,
  });
} 