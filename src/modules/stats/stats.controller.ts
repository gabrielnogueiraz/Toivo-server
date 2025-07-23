import { FastifyRequest, FastifyReply } from 'fastify';
import { StatsService } from './stats.service.js';
import { StatsQueryInput, ProductivityQueryInput } from './stats.schema.js';

export class StatsController {
  constructor(private statsService: StatsService) {}

  /**
   * GET /stats/tasks
   * Busca tarefas por período (hoje, semana, mês)
   */
  getTasks = async (
    request: FastifyRequest<{
      Querystring: StatsQueryInput;
    }>,
    reply: FastifyReply
  ) => {
    try {
      const userId = request.user.id;
      const { includeIncomplete = false } = request.query;

      const result = await this.statsService.getTasksByPeriods(userId, includeIncomplete);

      if (!result.success) {
        return reply.status(400).send(result);
      }

      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };

  /**
   * GET /stats/overview
   * Busca estatísticas de overview (pomodoros, tarefas, tempo focado, produtividade)
   */
  getOverview = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const userId = request.user.id;

      const result = await this.statsService.getOverviewStats(userId);

      if (!result.success) {
        return reply.status(400).send(result);
      }

      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };

  /**
   * GET /stats/summary
   * Busca resumo geral do desempenho do usuário
   */
  getSummary = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const userId = request.user.id;

      const result = await this.statsService.getSummaryStats(userId);

      if (!result.success) {
        return reply.status(400).send(result);
      }

      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };

  /**
   * GET /stats/productivity
   * Busca dados de produtividade para um período específico
   */
  getProductivityData = async (
    request: FastifyRequest<{
      Querystring: ProductivityQueryInput;
    }>,
    reply: FastifyReply
  ) => {
    try {
      const userId = request.user.id;
      const { startDate, endDate } = request.query;

      // Validar datas
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Datas inválidas fornecidas',
            code: 'INVALID_DATE_FORMAT'
          }
        });
      }

      if (end <= start) {
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Data de fim deve ser posterior à data de início',
            code: 'INVALID_DATE_RANGE'
          }
        });
      }

      const result = await this.statsService.getProductivityDataForPeriod(userId, start, end);

      if (!result.success) {
        return reply.status(400).send(result);
      }

      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };

  /**
   * GET /stats/comparison
   * Busca estatísticas de comparação entre períodos
   */
  getComparison = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const userId = request.user.id;

      const result = await this.statsService.getComparativeStats(userId);

      if (!result.success) {
        return reply.status(400).send(result);
      }

      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };
} 