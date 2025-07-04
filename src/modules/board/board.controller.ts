import { FastifyRequest, FastifyReply } from 'fastify';
import { BoardService } from './board.service.js';
import { CreateBoardInput, UpdateBoardInput, BoardParamsInput } from './board.schema.js';

export class BoardController {
  constructor(private boardService: BoardService) {
    // Bind dos métodos para preservar o contexto do this
    this.createBoard = this.createBoard.bind(this);
    this.getBoards = this.getBoards.bind(this);
    this.getBoardById = this.getBoardById.bind(this);
    this.updateBoard = this.updateBoard.bind(this);
    this.deleteBoard = this.deleteBoard.bind(this);
  }

  async createBoard(
    request: FastifyRequest<{ Body: CreateBoardInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const result = await this.boardService.createBoard(request.body, userId);
    
    if (result.success) {
      return reply.status(201).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async getBoards(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const result = await this.boardService.getBoards(userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async getBoardById(
    request: FastifyRequest<{ Params: BoardParamsInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    const result = await this.boardService.getBoardById(id, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(404).send(result);
    }
  }

  async updateBoard(
    request: FastifyRequest<{ Params: BoardParamsInput; Body: UpdateBoardInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    const result = await this.boardService.updateBoard(id, request.body, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(400).send(result);
    }
  }

  async deleteBoard(
    request: FastifyRequest<{ Params: BoardParamsInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const { id } = request.params;
    const result = await this.boardService.deleteBoard(id, userId);
    
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(404).send(result);
    }
  }
}
