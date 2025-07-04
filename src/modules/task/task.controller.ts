import { FastifyRequest, FastifyReply } from 'fastify';
import { TaskService } from './task.service.js';
import { CreateTaskInput, UpdateTaskInput, TaskParamsInput, MoveTaskInput } from './task.schema.js';

export class TaskController {
  constructor(private taskService: TaskService) {
    // Bind dos métodos para preservar o contexto do this
    this.createTask = this.createTask.bind(this);
    this.getTasks = this.getTasks.bind(this);
    this.getTaskById = this.getTaskById.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.moveTask = this.moveTask.bind(this);
    this.getTasksByColumn = this.getTasksByColumn.bind(this);
  }

  async createTask(
    request: FastifyRequest<{ Body: CreateTaskInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const result = await this.taskService.createTask(request.body, userId);
    
    if (result.success) {
      return reply.status(201).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async getTasks(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const result = await this.taskService.getTasks(userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async getTaskById(
    request: FastifyRequest<{ Params: TaskParamsInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    const result = await this.taskService.getTaskById(id, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(404).send(result);
    }
  }

  async updateTask(
    request: FastifyRequest<{ Params: TaskParamsInput; Body: UpdateTaskInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    const result = await this.taskService.updateTask(id, request.body, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async deleteTask(
    request: FastifyRequest<{ Params: TaskParamsInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    const result = await this.taskService.deleteTask(id, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(404).send(result);
    }
  }

  async moveTask(
    request: FastifyRequest<{ Params: TaskParamsInput; Body: MoveTaskInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    const { columnId } = request.body;
    const result = await this.taskService.moveTask(id, columnId, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async getTasksByColumn(
    request: FastifyRequest<{ Params: { columnId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { columnId } = request.params;
    const result = await this.taskService.getTasksByColumn(columnId, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }
}
