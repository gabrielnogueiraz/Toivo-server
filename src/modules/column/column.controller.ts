import { FastifyRequest, FastifyReply } from 'fastify';
import { ColumnService } from './column.service.js';
import { CreateColumnInput, UpdateColumnInput, ColumnParamsInput } from './column.schema.js';

export class ColumnController {
  constructor(private columnService: ColumnService) {
    // Bind dos métodos para preservar o contexto do this
    this.createColumn = this.createColumn.bind(this);
    this.getColumnById = this.getColumnById.bind(this);
    this.updateColumn = this.updateColumn.bind(this);
    this.deleteColumn = this.deleteColumn.bind(this);
  }

  async createColumn(
    request: FastifyRequest<{ Body: CreateColumnInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const result = await this.columnService.createColumn(request.body, userId);
    
    if (result.success) {
      return reply.status(201).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async getColumnById(
    request: FastifyRequest<{ Params: ColumnParamsInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    const result = await this.columnService.getColumnById(id, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(404).send(result);
    }
  }

  async updateColumn(
    request: FastifyRequest<{ Params: ColumnParamsInput; Body: UpdateColumnInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    const result = await this.columnService.updateColumn(id, request.body, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async deleteColumn(
    request: FastifyRequest<{ Params: ColumnParamsInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    const result = await this.columnService.deleteColumn(id, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(404).send(result);
    }
  }
}
