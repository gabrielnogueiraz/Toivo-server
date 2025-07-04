import { TaskRepository } from './task.repository.js';
import { CreateTaskInput, UpdateTaskInput } from './task.schema.js';

export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  async createTask(data: CreateTaskInput, userId: string) {
    try {
      // Validação adicional das datas (apenas se ambas forem fornecidas)
      if (data.startAt && data.endAt && data.endAt <= data.startAt) {
        return {
          success: false,
          error: {
            message: 'Data de fim deve ser posterior à data de início',
            code: 'INVALID_DATE_RANGE'
          }
        };
      }

      const task = await this.taskRepository.create(data, userId);
      return {
        success: true,
        data: task
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao criar tarefa',
          code: 'TASK_CREATE_ERROR'
        }
      };
    }
  }

  async getTasks(userId: string) {
    try {
      const tasks = await this.taskRepository.findMany(userId);
      return {
        success: true,
        data: tasks
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar tarefas',
          code: 'TASK_FETCH_ERROR'
        }
      };
    }
  }

  async getTaskById(id: string, userId: string) {
    try {
      const task = await this.taskRepository.findById(id, userId);
      
      if (!task) {
        return {
          success: false,
          error: {
            message: 'Tarefa não encontrada',
            code: 'TASK_NOT_FOUND'
          }
        };
      }

      return {
        success: true,
        data: task
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar tarefa',
          code: 'TASK_FETCH_ERROR'
        }
      };
    }
  }

  async updateTask(id: string, data: UpdateTaskInput, userId: string) {
    try {
      // Validação adicional das datas se ambas estiverem presentes
      if (data.startAt && data.endAt && data.endAt <= data.startAt) {
        return {
          success: false,
          error: {
            message: 'Data de fim deve ser posterior à data de início',
            code: 'INVALID_DATE_RANGE'
          }
        };
      }

      const task = await this.taskRepository.update(id, data, userId);
      return {
        success: true,
        data: task
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao atualizar tarefa',
          code: 'TASK_UPDATE_ERROR'
        }
      };
    }
  }

  async deleteTask(id: string, userId: string) {
    try {
      // Verifica se a tarefa pertence ao usuário
      const hasOwnership = await this.taskRepository.checkOwnership(id, userId);
      
      if (!hasOwnership) {
        return {
          success: false,
          error: {
            message: 'Tarefa não encontrada ou não pertence ao usuário',
            code: 'TASK_NOT_FOUND'
          }
        };
      }

      await this.taskRepository.delete(id, userId);
      
      return {
        success: true,
        data: { message: 'Tarefa deletada com sucesso' }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao deletar tarefa',
          code: 'TASK_DELETE_ERROR'
        }
      };
    }
  }

  async moveTask(id: string, columnId: string, userId: string) {
    try {
      const task = await this.taskRepository.moveToColumn(id, columnId, userId);
      return {
        success: true,
        data: task
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao mover tarefa',
          code: 'TASK_MOVE_ERROR'
        }
      };
    }
  }

  async getTasksByColumn(columnId: string, userId: string) {
    try {
      const tasks = await this.taskRepository.findByColumnId(columnId, userId);
      return {
        success: true,
        data: tasks
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar tarefas da coluna',
          code: 'TASK_FETCH_ERROR'
        }
      };
    }
  }
}
