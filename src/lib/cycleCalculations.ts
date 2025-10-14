import { differenceInDays, addDays, parseISO } from 'date-fns';

export interface CycleEntry {
  id: string;
  periodStartDate: string;
  periodEndDate: string | null;
  periodDuration: number | null;
  cycleLength: number | null;
  ovulationDate: string | null;
  notes: string;
}

export interface CycleSettings {
  averageCycleLength: number;
  shortestCycle: number;
  longestCycle: number;
  averagePeriodDuration: number;
  irregularCycles: boolean;
  trackingGoal: 'prevent' | 'conceive' | 'track';
}

export interface CyclePredictions {
  nextPeriodDate: string;
  nextOvulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
}

// Calculate cycle length between two period start dates
export function calculateCycleLength(periodStart1: string, periodStart2: string): number {
  const date1 = parseISO(periodStart1);
  const date2 = parseISO(periodStart2);
  return Math.abs(differenceInDays(date2, date1));
}

// Calculate average cycle length from recent cycles
export function calculateAverageCycleLength(cycles: CycleEntry[]): number {
  if (cycles.length < 2) return 28; // default
  
  const cycleLengths = cycles
    .map(c => c.cycleLength)
    .filter((l): l is number => l !== null && l > 0);
  
  if (cycleLengths.length === 0) return 28;
  
  // Use last 6 cycles for average
  const recentLengths = cycleLengths.slice(-6);
  const average = recentLengths.reduce((a, b) => a + b, 0) / recentLengths.length;
  return Math.round(average);
}

// Calculate current cycle day
export function getCurrentCycleDay(lastPeriodStart: string, today: Date = new Date()): number {
  const startDate = parseISO(lastPeriodStart);
  return differenceInDays(today, startDate) + 1;
}

// Predict ovulation date (14 days before next period)
export function predictOvulation(lastPeriodStart: string, averageCycleLength: number): string {
  const startDate = parseISO(lastPeriodStart);
  const ovulationDay = averageCycleLength - 14; // luteal phase = 14 days
  const ovulationDate = addDays(startDate, ovulationDay);
  return ovulationDate.toISOString().split('T')[0];
}

// Calculate fertile window (5 days before ovulation + ovulation day + 1 day after)
export function calculateFertileWindow(ovulationDate: string): { start: string; end: string; daysCount: number } {
  const ovulation = parseISO(ovulationDate);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);
  
  return {
    start: fertileStart.toISOString().split('T')[0],
    end: fertileEnd.toISOString().split('T')[0],
    daysCount: 7
  };
}

// Predict next period date
export function predictNextPeriod(lastPeriodStart: string, averageCycleLength: number): string {
  const startDate = parseISO(lastPeriodStart);
  const nextPeriod = addDays(startDate, averageCycleLength);
  return nextPeriod.toISOString().split('T')[0];
}

// Predict next period range for irregular cycles
export function predictNextPeriodRange(
  lastPeriodStart: string,
  shortestCycle: number,
  longestCycle: number
): { earliest: string; latest: string } {
  const startDate = parseISO(lastPeriodStart);
  const earliestDate = addDays(startDate, shortestCycle);
  const latestDate = addDays(startDate, longestCycle);
  
  return {
    earliest: earliestDate.toISOString().split('T')[0],
    latest: latestDate.toISOString().split('T')[0]
  };
}

// Generate full predictions
export function generatePredictions(
  cycles: CycleEntry[],
  settings: CycleSettings
): CyclePredictions | null {
  if (cycles.length === 0) return null;
  
  const lastCycle = cycles[cycles.length - 1];
  const avgCycleLength = settings.averageCycleLength;
  
  const nextPeriodDate = predictNextPeriod(lastCycle.periodStartDate, avgCycleLength);
  const nextOvulationDate = predictOvulation(lastCycle.periodStartDate, avgCycleLength);
  const fertileWindow = calculateFertileWindow(nextOvulationDate);
  
  return {
    nextPeriodDate,
    nextOvulationDate,
    fertileWindowStart: fertileWindow.start,
    fertileWindowEnd: fertileWindow.end
  };
}

// Check if a date is in fertile window
export function isInFertileWindow(date: string, predictions: CyclePredictions): boolean {
  const checkDate = parseISO(date);
  const windowStart = parseISO(predictions.fertileWindowStart);
  const windowEnd = parseISO(predictions.fertileWindowEnd);
  
  return checkDate >= windowStart && checkDate <= windowEnd;
}

// Check if currently on period
export function isOnPeriod(cycles: CycleEntry[], today: Date = new Date()): boolean {
  if (cycles.length === 0) return false;
  
  const lastCycle = cycles[cycles.length - 1];
  const periodStart = parseISO(lastCycle.periodStartDate);
  const daysSinceStart = differenceInDays(today, periodStart);
  
  // If period end date is set, check if today is before it
  if (lastCycle.periodEndDate) {
    const periodEnd = parseISO(lastCycle.periodEndDate);
    return today >= periodStart && today <= periodEnd;
  }
  
  // If no end date, assume period lasts for average duration
  const averageDuration = lastCycle.periodDuration || 5;
  return daysSinceStart >= 0 && daysSinceStart < averageDuration;
}

// Calculate cycle phase
export function getCyclePhase(cycleDay: number, cycleLength: number): string {
  if (cycleDay <= 5) return 'Menstrual';
  if (cycleDay <= cycleLength - 14) return 'Follicular';
  if (cycleDay <= cycleLength - 12) return 'Ovulation';
  return 'Luteal';
}
