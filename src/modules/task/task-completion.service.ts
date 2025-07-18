import { PrismaClient, $Enums } from '@prisma/client';
import { GardenService } from '../garden/garden.service.js';

export class TaskCompletionService {
  constructor(
    private prisma: PrismaClient,
    private gardenService: GardenService
  ) {}

  async checkTaskCompletionAfterPomodoro(taskId: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        pomodoros: {
          where: { status: $Enums.PomodoroStatus.COMPLETED }
        }
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const completedPomodoros = task.pomodoros.length;
    const requiredPomodoros = task.pomodoroGoal;

    if (completedPomodoros >= requiredPomodoros && !task.completed) {
      await this.markTaskAsCompleted(taskId, userId);
      
      try {
        await this.gardenService.createFlowerFromTask(
          userId, 
          taskId, 
          task.priority as $Enums.Priority
        );
        console.log(`✅ Flores criadas automaticamente para tarefa ${taskId} do usuário ${userId}`);
      } catch (error) {
        console.error('❌ Erro ao criar flores automaticamente:', error);
        // Não falha a conclusão da tarefa se a criação de flores falhar
      }

      return {
        taskCompleted: true,
        flowersCreated: true,
        completedPomodoros,
        requiredPomodoros
      };
    }

    return {
      taskCompleted: false,
      flowersCreated: false,
      completedPomodoros,
      requiredPomodoros
    };
  }

  private async markTaskAsCompleted(taskId: string, userId: string) {
    return this.prisma.task.update({
      where: { id: taskId, userId },
      data: { completed: true }
    });
  }

  async manuallyCompleteTask(taskId: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        pomodoros: {
          where: { status: $Enums.PomodoroStatus.COMPLETED }
        }
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.completed) {
      throw new Error('Task is already completed');
    }

    const completedPomodoros = task.pomodoros.length;
    const requiredPomodoros = task.pomodoroGoal;

    await this.markTaskAsCompleted(taskId, userId);

    let flowersCreated = false;
    if (completedPomodoros >= requiredPomodoros) {
      try {
        await this.gardenService.createFlowerFromTask(
          userId, 
          taskId, 
          task.priority as $Enums.Priority
        );
        flowersCreated = true;
        console.log(`✅ Flores criadas manualmente para tarefa ${taskId} do usuário ${userId}`);
      } catch (error) {
        console.error('❌ Erro ao criar flores na conclusão manual:', error);
        // Continua mesmo se a criação de flores falhar
      }
    }

    return {
      taskCompleted: true,
      flowersCreated,
      completedPomodoros,
      requiredPomodoros,
      message: flowersCreated 
        ? 'Tarefa concluída! Você ganhou flores!' 
        : 'Tarefa marcada como concluída, mas você precisa completar todos os pomodoros para ganhar flores.'
    };
  }
}
