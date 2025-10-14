import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  CycleEntry,
  CycleSettings,
  CyclePredictions,
  calculateAverageCycleLength,
  calculateCycleLength,
  generatePredictions,
  getCurrentCycleDay,
  isOnPeriod,
  getCyclePhase
} from '@/lib/cycleCalculations';
import {
  getAllCycles,
  saveCycleEntry,
  deleteCycleEntry,
  updateCycleEntry,
  getSettings,
  saveSettings,
  getPredictions,
  savePredictions
} from '@/lib/db/cycleDB';

const DEFAULT_SETTINGS: CycleSettings = {
  averageCycleLength: 28,
  shortestCycle: 26,
  longestCycle: 32,
  averagePeriodDuration: 5,
  irregularCycles: false,
  trackingGoal: 'track'
};

export function useCycleData() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [settings, setSettings] = useState<CycleSettings>(DEFAULT_SETTINGS);
  const [predictions, setPredictions] = useState<CyclePredictions | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Load data from IndexedDB
  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [cyclesData, settingsData, predictionsData] = await Promise.all([
        getAllCycles(),
        getSettings(user.id),
        getPredictions(user.id)
      ]);

      // Sort cycles by date
      const sortedCycles = cyclesData.sort((a, b) => 
        new Date(a.periodStartDate).getTime() - new Date(b.periodStartDate).getTime()
      );

      // Update cycle lengths
      for (let i = 0; i < sortedCycles.length - 1; i++) {
        const cycleLength = calculateCycleLength(
          sortedCycles[i].periodStartDate,
          sortedCycles[i + 1].periodStartDate
        );
        if (sortedCycles[i].cycleLength !== cycleLength) {
          sortedCycles[i].cycleLength = cycleLength;
          await updateCycleEntry(sortedCycles[i].id, { cycleLength });
        }
      }

      setCycles(sortedCycles);
      setSettings(settingsData || DEFAULT_SETTINGS);
      setPredictions(predictionsData || null);
      setIsFirstTime(!settingsData && sortedCycles.length === 0);
    } catch (error) {
      console.error('Error loading cycle data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add new cycle entry
  const addCycle = useCallback(async (entry: Omit<CycleEntry, 'id'>) => {
    const newEntry: CycleEntry = {
      ...entry,
      id: `cycle-${Date.now()}`
    };

    await saveCycleEntry(newEntry);
    await loadData();

    // Recalculate predictions
    const allCycles = await getAllCycles();
    const newPredictions = generatePredictions(allCycles, settings);
    if (newPredictions) {
      await savePredictions(user!.id, newPredictions);
      setPredictions(newPredictions);
    }

    // Update average cycle length in settings
    const avgLength = calculateAverageCycleLength(allCycles);
    if (avgLength !== settings.averageCycleLength) {
      const updatedSettings = { ...settings, averageCycleLength: avgLength };
      await saveSettings(user!.id, updatedSettings);
      setSettings(updatedSettings);
    }
  }, [settings, user, loadData]);

  // Update existing cycle
  const updateCycle = useCallback(async (id: string, updates: Partial<CycleEntry>) => {
    await updateCycleEntry(id, updates);
    await loadData();

    // Recalculate predictions
    const allCycles = await getAllCycles();
    const newPredictions = generatePredictions(allCycles, settings);
    if (newPredictions) {
      await savePredictions(user!.id, newPredictions);
      setPredictions(newPredictions);
    }
  }, [settings, user, loadData]);

  // Delete cycle
  const deleteCycle = useCallback(async (id: string) => {
    await deleteCycleEntry(id);
    await loadData();
  }, [loadData]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<CycleSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    await saveSettings(user!.id, updatedSettings);
    setSettings(updatedSettings);

    // Recalculate predictions
    const allCycles = await getAllCycles();
    const newPredictions = generatePredictions(allCycles, updatedSettings);
    if (newPredictions) {
      await savePredictions(user!.id, newPredictions);
      setPredictions(newPredictions);
    }
  }, [settings, user]);

  // Complete onboarding
  const completeOnboarding = useCallback(async (
    lastPeriodStart: string,
    periodDuration: number,
    cycleLength: number
  ) => {
    const entry: Omit<CycleEntry, 'id'> = {
      periodStartDate: lastPeriodStart,
      periodEndDate: null,
      periodDuration,
      cycleLength: null,
      ovulationDate: null,
      notes: ''
    };

    await addCycle(entry);

    const newSettings: CycleSettings = {
      ...DEFAULT_SETTINGS,
      averageCycleLength: cycleLength,
      averagePeriodDuration: periodDuration
    };

    await saveSettings(user!.id, newSettings);
    setSettings(newSettings);
    setIsFirstTime(false);
  }, [user, addCycle]);

  // Get current cycle info
  const getCurrentCycleInfo = useCallback(() => {
    if (cycles.length === 0) return null;

    const lastCycle = cycles[cycles.length - 1];
    const cycleDay = getCurrentCycleDay(lastCycle.periodStartDate);
    const phase = getCyclePhase(cycleDay, settings.averageCycleLength);
    const onPeriod = isOnPeriod(cycles);

    return {
      cycleDay,
      phase,
      onPeriod,
      lastPeriodStart: lastCycle.periodStartDate
    };
  }, [cycles, settings]);

  return {
    cycles,
    settings,
    predictions,
    loading,
    isFirstTime,
    addCycle,
    updateCycle,
    deleteCycle,
    updateSettings,
    completeOnboarding,
    getCurrentCycleInfo,
    refreshData: loadData
  };
}
