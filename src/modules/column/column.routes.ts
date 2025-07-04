import { AppType } from '../../app.js';
import { createColumnSchema, updateColumnSchema, columnParamsSchema } from './column.schema.js';

export default async function columnRoutes(app: AppType, columnController: any) {
  // Criar coluna
  app.post('/', {
    schema: {
      body: createColumnSchema,
    },
    preHandler: [app.authenticate],
    handler: columnController.createColumn,
  });

  // Buscar coluna por ID
  app.get('/:id', {
    schema: {
      params: columnParamsSchema,
    },
    preHandler: [app.authenticate],
    handler: columnController.getColumnById,
  });

  // Atualizar coluna
  app.patch('/:id', {
    schema: {
      params: columnParamsSchema,
      body: updateColumnSchema,
    },
    preHandler: [app.authenticate],
    handler: columnController.updateColumn,
  });

  // Deletar coluna
  app.delete('/:id', {
    schema: {
      params: columnParamsSchema,
    },
    preHandler: [app.authenticate],
    handler: columnController.deleteColumn,
  });
}
