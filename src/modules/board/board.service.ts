import { BoardRepository } from './board.repository.js';
import { ColumnRepository } from '../column/column.repository.js';
import { CreateBoardInput, UpdateBoardInput } from './board.schema.js';

export class BoardService {
  constructor(
    private boardRepository: BoardRepository,
    private columnRepository: ColumnRepository
  ) {}

  async createBoard(data: CreateBoardInput, userId: string) {
    try {
      // Criar o board
      const board = await this.boardRepository.create(data, userId);
      
      // Criar colunas padrão (opcionais - usuário pode deletar depois)
      const defaultColumns = [
        { title: 'A Fazer', order: 0, boardId: board.id },
        { title: 'Em Progresso', order: 1, boardId: board.id },
        { title: 'Concluído', order: 2, boardId: board.id }
      ];

      // Criar as colunas padrão
      const columns = await Promise.all(
        defaultColumns.map(columnData => 
          this.columnRepository.create(columnData, userId)
        )
      );

      // Retornar board com as colunas criadas
      const boardWithColumns = await this.boardRepository.findById(board.id, userId);

      return {
        success: true,
        data: boardWithColumns
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao criar quadro',
          code: 'BOARD_CREATE_ERROR'
        }
      };
    }
  }

  async getBoards(userId: string) {
    try {
      const boards = await this.boardRepository.findMany(userId);
      return {
        success: true,
        data: boards
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar quadros',
          code: 'BOARD_FETCH_ERROR'
        }
      };
    }
  }

  async getBoardById(id: string, userId: string) {
    try {
      const board = await this.boardRepository.findById(id, userId);
      
      if (!board) {
        return {
          success: false,
          error: {
            message: 'Quadro não encontrado',
            code: 'BOARD_NOT_FOUND'
          }
        };
      }

      return {
        success: true,
        data: board
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar quadro',
          code: 'BOARD_FETCH_ERROR'
        }
      };
    }
  }

  async updateBoard(id: string, data: UpdateBoardInput, userId: string) {
    try {
      const board = await this.boardRepository.update(id, data, userId);
      return {
        success: true,
        data: board
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao atualizar quadro',
          code: 'BOARD_UPDATE_ERROR'
        }
      };
    }
  }

  async deleteBoard(id: string, userId: string) {
    try {
      // Verifica se o quadro pertence ao usuário
      const hasOwnership = await this.boardRepository.checkOwnership(id, userId);
      
      if (!hasOwnership) {
        return {
          success: false,
          error: {
            message: 'Quadro não encontrado ou não pertence ao usuário',
            code: 'BOARD_NOT_FOUND'
          }
        };
      }

      await this.boardRepository.delete(id, userId);
      
      return {
        success: true,
        data: { message: 'Quadro deletado com sucesso' }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao deletar quadro',
          code: 'BOARD_DELETE_ERROR'
        }
      };
    }
  }
}
