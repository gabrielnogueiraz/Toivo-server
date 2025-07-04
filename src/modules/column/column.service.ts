import { ColumnRepository } from './column.repository.js';
import { CreateColumnInput, UpdateColumnInput } from './column.schema.js';

export class ColumnService {
  constructor(private columnRepository: ColumnRepository) {}

  async createColumn(data: CreateColumnInput, userId: string) {
    try {
      const column = await this.columnRepository.create(data, userId);
      return {
        success: true,
        data: column
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao criar coluna',
          code: 'COLUMN_CREATE_ERROR'
        }
      };
    }
  }

  async getColumnsByBoardId(boardId: string, userId: string) {
    try {
      const columns = await this.columnRepository.findByBoardId(boardId, userId);
      return {
        success: true,
        data: columns
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar colunas',
          code: 'COLUMN_FETCH_ERROR'
        }
      };
    }
  }

  async getColumnById(id: string, userId: string) {
    try {
      const column = await this.columnRepository.findById(id, userId);
      
      if (!column) {
        return {
          success: false,
          error: {
            message: 'Coluna não encontrada',
            code: 'COLUMN_NOT_FOUND'
          }
        };
      }

      return {
        success: true,
        data: column
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar coluna',
          code: 'COLUMN_FETCH_ERROR'
        }
      };
    }
  }

  async updateColumn(id: string, data: UpdateColumnInput, userId: string) {
    try {
      const column = await this.columnRepository.update(id, data, userId);
      return {
        success: true,
        data: column
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao atualizar coluna',
          code: 'COLUMN_UPDATE_ERROR'
        }
      };
    }
  }

  async deleteColumn(id: string, userId: string) {
    try {
      // Verifica se a coluna pertence ao usuário
      const hasOwnership = await this.columnRepository.checkOwnership(id, userId);
      
      if (!hasOwnership) {
        return {
          success: false,
          error: {
            message: 'Coluna não encontrada ou não pertence ao usuário',
            code: 'COLUMN_NOT_FOUND'
          }
        };
      }

      await this.columnRepository.delete(id, userId);
      
      return {
        success: true,
        data: { message: 'Coluna deletada com sucesso' }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao deletar coluna',
          code: 'COLUMN_DELETE_ERROR'
        }
      };
    }
  }
}
