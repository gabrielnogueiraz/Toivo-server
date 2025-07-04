import { AppType } from '../../app.js';
import { createBoardSchema, updateBoardSchema, boardParamsSchema } from './board.schema.js';

export default async function boardRoutes(app: AppType, boardController: any) {
  // Criar quadro
  app.post('/', {
    schema: {
      body: createBoardSchema,
    },
    preHandler: [app.authenticate],
    handler: boardController.createBoard,
  });

  // Listar quadros do usuário
  app.get('/', {
    preHandler: [app.authenticate],
    handler: boardController.getBoards,
  });

  // Buscar quadro por ID
  app.get('/:id', {
    schema: {
      params: boardParamsSchema,
    },
    preHandler: [app.authenticate],
    handler: boardController.getBoardById,
  });

  // Atualizar quadro
  app.put('/:id', {
    schema: {
      params: boardParamsSchema,
      body: updateBoardSchema,
    },
    preHandler: [app.authenticate],
    handler: boardController.updateBoard,
  });

  // Deletar quadro
  app.delete('/:id', {
    schema: {
      params: boardParamsSchema,
    },
    preHandler: [app.authenticate],
    handler: boardController.deleteBoard,
  });
}
