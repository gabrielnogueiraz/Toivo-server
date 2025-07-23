import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  differenceInDays,
  eachDayOfInterval,
  isWithinInterval,
  format
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Configurações padrão
export const DEFAULT_EXPECTED_FOCUS_TIME = 8 * 60; // 8 horas em minutos
export const POMODORO_DURATION = 25; // minutos

/**
 * Retorna os intervalos de datas para hoje, semana e mês
 */
export function getDateIntervals(referenceDate: Date = new Date()) {
  return {
    today: {
      start: startOfDay(referenceDate),
      end: endOfDay(referenceDate)
    },
    week: {
      start: startOfWeek(referenceDate, { weekStartsOn: 1 }), // Segunda-feira
      end: endOfWeek(referenceDate, { weekStartsOn: 1 }) // Domingo
    },
    month: {
      start: startOfMonth(referenceDate),
      end: endOfMonth(referenceDate)
    }
  };
}

/**
 * Calcula a produtividade com base no tempo focado
 * @param focusTimeInMinutes - Tempo focado em minutos
 * @param expectedFocusTime - Tempo esperado de foco em minutos (padrão: 8h)
 * @returns Produtividade de 0 a 100
 */
export function calculateProductivity(
  focusTimeInMinutes: number, 
  expectedFocusTime: number = DEFAULT_EXPECTED_FOCUS_TIME
): number {
  if (expectedFocusTime === 0) return 0;
  
  const productivity = (focusTimeInMinutes / expectedFocusTime) * 100;
  
  // Limita entre 0 e 100
  return Math.min(100, Math.max(0, Math.round(productivity)));
}

/**
 * Converte duração de pomodoros completados em tempo focado (minutos)
 * @param completedPomodoros - Número de pomodoros completados
 * @param pomodoroDuration - Duração de cada pomodoro em minutos
 * @returns Tempo focado total em minutos
 */
export function convertPomodorosToFocusTime(
  completedPomodoros: number, 
  pomodoroMinutes: number = POMODORO_DURATION
): number {
  return completedPomodoros * pomodoroMinutes;
}

/**
 * Calcula a média ponderada de produtividade
 * @param dailyProductivity - Array de produtividade diária
 * @returns Média ponderada
 */
export function calculateAverageProductivity(dailyProductivity: number[]): number {
  if (dailyProductivity.length === 0) return 0;
  
  const sum = dailyProductivity.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / dailyProductivity.length);
}

/**
 * Encontra a maior sequência de dias consecutivos com foco
 * @param focusDays - Array de datas onde houve foco
 * @returns Maior sequência de dias consecutivos
 */
export function calculateLongestFocusStreak(focusDays: Date[]): number {
  if (focusDays.length === 0) return 0;
  
  // Ordena as datas
  const sortedDays = [...focusDays].sort((a, b) => a.getTime() - b.getTime());
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const dayDiff = differenceInDays(sortedDays[i], sortedDays[i - 1]);
    
    if (dayDiff === 1) {
      // Dia consecutivo
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (dayDiff > 1) {
      // Quebra na sequência
      currentStreak = 1;
    }
    // Se dayDiff === 0, é o mesmo dia, mantém a sequência atual
  }
  
  return longestStreak;
}

/**
 * Encontra o dia mais produtivo
 * @param dailyProductivity - Objeto com data como chave e produtividade como valor
 * @returns Data do dia mais produtivo em formato ISO string ou null
 */
export function findMostProductiveDay(
  dailyProductivity: Record<string, number>
): string | null {
  const entries = Object.entries(dailyProductivity);
  
  if (entries.length === 0) return null;
  
  const mostProductive = entries.reduce((max, current) => 
    current[1] > max[1] ? current : max
  );
  
  return mostProductive[0];
}

/**
 * Verifica se uma data está dentro do período especificado
 * @param date - Data a verificar
 * @param period - Período ('today', 'week', 'month')
 * @param referenceDate - Data de referência (padrão: hoje)
 * @returns true se a data está dentro do período
 */
export function isDateInPeriod(
  date: Date, 
  period: 'today' | 'week' | 'month', 
  referenceDate: Date = new Date()
): boolean {
  const intervals = getDateIntervals(referenceDate);
  const interval = intervals[period];
  
  return isWithinInterval(date, interval);
}

/**
 * Gera array de todos os dias entre duas datas
 * @param startDate - Data inicial
 * @param endDate - Data final
 * @returns Array de datas
 */
export function getDaysInRange(startDate: Date, endDate: Date): Date[] {
  return eachDayOfInterval({ start: startDate, end: endDate });
}

/**
 * Formata data para chave de agrupamento (YYYY-MM-DD)
 * @param date - Data a formatar
 * @returns String formatada
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Agrupa dados por data
 * @param items - Array de itens com propriedade de data
 * @param dateProperty - Nome da propriedade que contém a data
 * @returns Objeto agrupado por data
 */
export function groupByDate<T>(
  items: T[], 
  dateProperty: keyof T
): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const date = item[dateProperty] as unknown as Date;
    const dateKey = formatDateKey(date);
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
} 