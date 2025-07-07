import { AppType } from '../../app.js';
import { startPomodoroSchema, pomodoroParamsSchema, availableTasksQuerySchema } from './pomodoro.schema.js';

export default async function pomodoroRoutes(app: AppType, pomodoroController: any) {
  // Iniciar pomodoro
  app.post('/start', {
    schema: {
      body: startPomodoroSchema,
    },
    preHandler: [app.authenticate],
    handler: pomodoroController.startPomodoro,
  });

  // Pausar pomodoro
  app.post('/:id/pause', {
    schema: {
      params: pomodoroParamsSchema,
    },
    preHandler: [app.authenticate],
    handler: pomodoroController.pausePomodoro,
  });

  // Retomar pomodoro
  app.post('/:id/resume', {
    schema: {
      params: pomodoroParamsSchema,
    },
    preHandler: [app.authenticate],
    handler: pomodoroController.resumePomodoro,
  });

  // Finalizar pomodoro
  app.post('/:id/finish', {
    schema: {
      params: pomodoroParamsSchema,
    },
    preHandler: [app.authenticate],
    handler: pomodoroController.finishPomodoro,
  });

  // Buscar tarefas disponíveis para pomodoro
  app.get('/tasks', {
    schema: {
      querystring: availableTasksQuerySchema
    },
    preHandler: [app.authenticate],
    handler: pomodoroController.getAvailableTasks,
  });

  // Buscar pomodoro ativo
  app.get('/active', {
    preHandler: [app.authenticate],
    handler: pomodoroController.getActivePomodoro,
  });

  // Buscar pomodoro por ID
  app.get('/:id', {
    schema: {
      params: pomodoroParamsSchema,
    },
    preHandler: [app.authenticate],
    handler: pomodoroController.getPomodoroById,
  });

  // Buscar pomodoros do usuário
  app.get('/', {
    preHandler: [app.authenticate],
    handler: pomodoroController.getUserPomodoros,
  });
}
