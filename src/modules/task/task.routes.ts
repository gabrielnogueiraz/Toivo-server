import { AppType } from '../../app.js';
import { createTaskSchema, updateTaskSchema, taskParamsSchema, moveTaskSchema } from './task.schema.js';

export default async function taskRoutes(app: AppType, taskController: any) {
  // Criar tarefa
  app.post('/', {
    schema: {
      body: createTaskSchema,
    },
    preHandler: [app.authenticate],
    handler: taskController.createTask,
  });

  // Listar tarefas do usuário
  app.get('/', {
    preHandler: [app.authenticate],
    handler: taskController.getTasks,
  });

  // Buscar tarefa por ID
  app.get('/:id', {
    schema: {
      params: taskParamsSchema,
    },
    preHandler: [app.authenticate],
    handler: taskController.getTaskById,
  });

  // Atualizar tarefa
  app.put('/:id', {
    schema: {
      params: taskParamsSchema,
      body: updateTaskSchema,
    },
    preHandler: [app.authenticate],
    handler: taskController.updateTask,
  });

  // Deletar tarefa
  app.delete('/:id', {
    schema: {
      params: taskParamsSchema,
    },
    preHandler: [app.authenticate],
    handler: taskController.deleteTask,
  });

  // Mover tarefa para outra coluna
  app.patch('/:id/move', {
    schema: {
      params: taskParamsSchema,
      body: moveTaskSchema,
    },
    preHandler: [app.authenticate],
    handler: taskController.moveTask,
  });

  // Marcar tarefa como concluída
  app.patch('/:id/complete', {
    schema: {
      params: taskParamsSchema,
    },
    preHandler: [app.authenticate],
    handler: taskController.completeTask,
  });

  // Listar tarefas de uma coluna específica
  app.get('/column/:columnId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          columnId: { type: 'string' }
        },
        required: ['columnId']
      }
    },
    preHandler: [app.authenticate],
    handler: taskController.getTasksByColumn,
  });
}
