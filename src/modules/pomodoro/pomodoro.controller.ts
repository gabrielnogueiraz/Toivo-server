import { FastifyRequest, FastifyReply } from 'fastify';
import { PomodoroService } from './pomodoro.service.js';
import { StartPomodoroInput, PomodoroParamsInput, AvailableTasksQuery } from './pomodoro.schema.js';

export class PomodoroController {
  private lastRequestTime: Map<string, number> = new Map();
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 segundo mínimo entre requisições

  constructor(private pomodoroService: PomodoroService) {
    // Bind dos métodos para preservar o contexto do this
    this.startPomodoro = this.startPomodoro.bind(this);
    this.pausePomodoro = this.pausePomodoro.bind(this);
    this.resumePomodoro = this.resumePomodoro.bind(this);
    this.finishPomodoro = this.finishPomodoro.bind(this);
    this.getActivePomodoro = this.getActivePomodoro.bind(this);
    this.getPomodoroById = this.getPomodoroById.bind(this);
    this.getUserPomodoros = this.getUserPomodoros.bind(this);
    this.getAvailableTasks = this.getAvailableTasks.bind(this);
  }

  async startPomodoro(
    request: FastifyRequest<{ Body: StartPomodoroInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    // Limpa o rate limiting quando uma ação é realizada
    this.clearRateLimit(userId);
    
    const result = await this.pomodoroService.startPomodoro(request.body, userId);
    
    if (result.success) {
      return reply.status(201).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async pausePomodoro(
    request: FastifyRequest<{ Params: PomodoroParamsInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    // Limpa o rate limiting quando uma ação é realizada
    this.clearRateLimit(userId);
    
    const result = await this.pomodoroService.pausePomodoro(id, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async resumePomodoro(
    request: FastifyRequest<{ Params: PomodoroParamsInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    // Limpa o rate limiting quando uma ação é realizada
    this.clearRateLimit(userId);
    
    const result = await this.pomodoroService.resumePomodoro(id, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async finishPomodoro(
    request: FastifyRequest<{ Params: PomodoroParamsInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    // Limpa o rate limiting quando uma ação é realizada
    this.clearRateLimit(userId);
    
    const result = await this.pomodoroService.finishPomodoro(id, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  private clearRateLimit(userId: string): void {
    this.lastRequestTime.delete(userId);
  }

  async getActivePomodoro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const now = Date.now();
    const lastRequest = this.lastRequestTime.get(userId);
    
    // Rate limiting: impede requisições muito frequentes
    if (lastRequest && now - lastRequest < this.MIN_REQUEST_INTERVAL) {
      return reply.status(429).send({
        success: false,
        error: {
          message: 'Muitas requisições. Tente novamente em alguns segundos.',
          code: 'RATE_LIMIT_EXCEEDED'
        }
      });
    }
    
    this.lastRequestTime.set(userId, now);
    
    const result = await this.pomodoroService.getActivePomodoro(userId);
    
    if (result.success) {
      // Define headers de cache para otimizar o polling
      reply.header('Cache-Control', 'public, max-age=3');
      reply.header('ETag', `"${Date.now()}"`);
      
      // Se dados vieram do cache, indica na resposta
      if (result.cached) {
        reply.header('X-Cache', 'HIT');
      } else {
        reply.header('X-Cache', 'MISS');
      }
      
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async getPomodoroById(
    request: FastifyRequest<{ Params: PomodoroParamsInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    const result = await this.pomodoroService.getPomodoroById(id, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(404).send(result);
    }
  }

  async getUserPomodoros(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const result = await this.pomodoroService.getUserPomodoros(userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async getAvailableTasks(
    request: FastifyRequest<{ Querystring: AvailableTasksQuery }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const filters = request.query;
    
    const result = await this.pomodoroService.getAvailableTasks(userId, filters);
    
    if (result.success) {
      return reply.status(200).send({
        success: true,
        data: { tasks: result.data },
        message: 'Tarefas disponíveis recuperadas com sucesso'
      });
    } else {
      return reply.status(400).send(result);
    }
  }
}
