import { PomodoroRepository } from './pomodoro.repository.js';
import { StartPomodoroInput, AvailableTasksQuery, UpdatePomodoroSettingsInput } from './pomodoro.schema.js';

// Cache interface para evitar polling excessivo
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export class PomodoroService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 3000; // 3 segundos de cache para pomodoro ativo
  private cleanupInterval: NodeJS.Timeout;

  constructor(private pomodoroRepository: PomodoroRepository) {
    // Limpa o cache expirado a cada 30 segundos
    this.cleanupInterval = setInterval(() => {
      this.clearExpiredCache();
    }, 30000);
  }

  // Configurações do Pomodoro
  async getUserSettings(userId: string) {
    try {
      const settings = await this.pomodoroRepository.getUserSettings(userId);
      return {
        success: true,
        data: settings
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar configurações',
          code: 'SETTINGS_FETCH_ERROR'
        }
      };
    }
  }

  async updateUserSettings(userId: string, data: UpdatePomodoroSettingsInput) {
    try {
      const settings = await this.pomodoroRepository.updateUserSettings(userId, data);
      return {
        success: true,
        data: settings
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao atualizar configurações',
          code: 'SETTINGS_UPDATE_ERROR'
        }
      };
    }
  }

  async startPomodoro(data: StartPomodoroInput, userId: string) {
    try {
      const pomodoro = await this.pomodoroRepository.create(data, userId);
      
      // Limpa o cache do usuário quando um novo pomodoro é iniciado
      this.clearUserCache(userId);
      
      return {
        success: true,
        data: pomodoro
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao iniciar pomodoro',
          code: 'POMODORO_START_ERROR'
        }
      };
    }
  }

  async pausePomodoro(id: string, userId: string) {
    try {
      const pomodoro = await this.pomodoroRepository.pause(id, userId);
      
      // Limpa o cache do usuário quando o pomodoro é pausado
      this.clearUserCache(userId);
      
      return {
        success: true,
        data: pomodoro
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao pausar pomodoro',
          code: 'POMODORO_PAUSE_ERROR'
        }
      };
    }
  }

  async resumePomodoro(id: string, userId: string) {
    try {
      const pomodoro = await this.pomodoroRepository.resume(id, userId);
      
      // Limpa o cache do usuário quando o pomodoro é retomado
      this.clearUserCache(userId);
      
      return {
        success: true,
        data: pomodoro
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao retomar pomodoro',
          code: 'POMODORO_RESUME_ERROR'
        }
      };
    }
  }

  async finishPomodoro(id: string, userId: string) {
    try {
      const pomodoro = await this.pomodoroRepository.finish(id, userId);
      
      // Limpa o cache do usuário quando o pomodoro é finalizado
      this.clearUserCache(userId);
      
      return {
        success: true,
        data: pomodoro
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao finalizar pomodoro',
          code: 'POMODORO_FINISH_ERROR'
        }
      };
    }
  }

  async getActivePomodoro(userId: string) {
    try {
      const cacheKey = `active_pomodoro_${userId}`;
      
      // Verifica se tem cache válido
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          cached: true
        };
      }
      
      // Busca no banco de dados
      const pomodoro = await this.pomodoroRepository.findActivePomodoro(userId);
      
      // Armazena no cache
      this.setCachedData(cacheKey, pomodoro, this.DEFAULT_TTL);
      
      return {
        success: true,
        data: pomodoro,
        cached: false
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar pomodoro ativo',
          code: 'POMODORO_FETCH_ERROR'
        }
      };
    }
  }

  private getCachedData(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCachedData(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private clearUserCache(userId: string): void {
    const cacheKey = `active_pomodoro_${userId}`;
    this.cache.delete(cacheKey);
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  async getPomodoroById(id: string, userId: string) {
    try {
      const pomodoro = await this.pomodoroRepository.findById(id, userId);
      
      if (!pomodoro) {
        return {
          success: false,
          error: {
            message: 'Pomodoro não encontrado',
            code: 'POMODORO_NOT_FOUND'
          }
        };
      }

      return {
        success: true,
        data: pomodoro
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar pomodoro',
          code: 'POMODORO_FETCH_ERROR'
        }
      };
    }
  }

  async getUserPomodoros(userId: string) {
    try {
      const pomodoros = await this.pomodoroRepository.findByUser(userId);
      return {
        success: true,
        data: pomodoros
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar pomodoros do usuário',
          code: 'POMODORO_FETCH_ERROR'
        }
      };
    }
  }

  async getAvailableTasks(userId: string, filters?: AvailableTasksQuery) {
    try {
      const tasks = await this.pomodoroRepository.getAvailableTasks(userId, filters);
      
      // Transformar os dados para um formato mais amigável para o frontend
      const formattedTasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        column: {
          id: task.column.id,
          title: task.column.title
        },
        board: {
          id: task.column.board.id,
          title: task.column.board.title
        },
        completedPomodoros: task._count.pomodoros,
        startAt: task.startAt,
        endAt: task.endAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));

      return {
        success: true,
        data: formattedTasks
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro ao buscar tarefas disponíveis',
          code: 'TASKS_FETCH_ERROR'
        }
      };
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}
