import { PrismaClient, $Enums } from '@prisma/client';

export class TaskCompletionService {
  constructor(
    private prisma: PrismaClient
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
      
      console.log(`✅ Tarefa ${taskId} marcada como concluída automaticamente para usuário ${userId}`);

      return {
        taskCompleted: true,
        completedPomodoros,
        requiredPomodoros
      };
    }

    return {
      taskCompleted: false,
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

    console.log(`✅ Tarefa ${taskId} marcada como concluída manualmente para usuário ${userId}`);

    return {
      taskCompleted: true,
      completedPomodoros,
      requiredPomodoros,
      message: 'Tarefa concluída com sucesso!'
    };
  }
}
