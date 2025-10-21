import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import {
  getCurrentCycleDay,
  getCyclePhase,
  calculateAverageCycleLength,
  predictNextPeriod,
  predictOvulation,
  calculateFertileWindow,
  isInFertileWindow,
  CyclePredictions
} from '@/lib/cycleCalculations';
import { differenceInDays, parseISO } from 'date-fns';

interface CycleRecord {
  id: string;
  mother_id: string;
  record_date: string;
  menstrual_cycle_day: number | null;
  cycle_length: number | null;
  flow_intensity: string | null;
  symptoms: string[] | null;
  mood: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CycleInfo {
  cycleDay: number;
  phase: string;
  onPeriod: boolean;
  lastPeriodStart: string;
  predictions: CyclePredictions | null;
}

export function useCycleTracking() {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  // Fetch all cycle records for the user
  const { data: cycles = [], isLoading } = useQuery({
    queryKey: ['cycle-tracking', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('reproductive_health')
        .select('*')
        .eq('mother_id', profile.id)
        .order('record_date', { ascending: true });
      
      if (error) throw error;
      return data as CycleRecord[];
    },
    enabled: !!profile?.id
  });

  // Add new cycle/period entry
  const addCycleMutation = useMutation({
    mutationFn: async (data: {
      periodStartDate: string;
      flowIntensity?: string;
      symptoms?: string[];
      mood?: string;
      notes?: string;
    }) => {
      if (!profile?.id) throw new Error('No profile found');
      
      const { error } = await supabase
        .from('reproductive_health')
        .insert({
          mother_id: profile.id,
          record_date: data.periodStartDate,
          menstrual_cycle_day: 1,
          flow_intensity: data.flowIntensity || null,
          symptoms: data.symptoms || null,
          mood: data.mood || null,
          notes: data.notes || null,
          cycle_length: null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-tracking', profile?.id] });
    }
  });

  // Update cycle entry
  const updateCycleMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<CycleRecord> }) => {
      const { error } = await supabase
        .from('reproductive_health')
        .update(data.updates)
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-tracking', profile?.id] });
    }
  });

  // Calculate current cycle info
  const getCurrentCycleInfo = useCallback((): CycleInfo | null => {
    if (cycles.length === 0) return null;

    // Get the most recent period start (menstrual_cycle_day === 1)
    const periodStarts = cycles.filter(c => c.menstrual_cycle_day === 1);
    if (periodStarts.length === 0) return null;

    const lastPeriod = periodStarts[periodStarts.length - 1];
    const lastPeriodDate = lastPeriod.record_date;

    // Calculate current cycle day
    const cycleDay = getCurrentCycleDay(lastPeriodDate);

    // Calculate average cycle length from historical data
    let averageCycleLength = 28; // default
    if (periodStarts.length >= 2) {
      const cycleLengths: number[] = [];
      for (let i = 0; i < periodStarts.length - 1; i++) {
        const days = differenceInDays(
          parseISO(periodStarts[i + 1].record_date),
          parseISO(periodStarts[i].record_date)
        );
        cycleLengths.push(days);
      }
      averageCycleLength = Math.round(
        cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
      );
    } else if (lastPeriod.cycle_length) {
      averageCycleLength = lastPeriod.cycle_length;
    }

    // Get cycle phase
    const phase = getCyclePhase(cycleDay, averageCycleLength);

    // Check if currently on period (cycle day 1-5 typically)
    const onPeriod = cycleDay <= 5;

    // Generate predictions
    const nextPeriodDate = predictNextPeriod(lastPeriodDate, averageCycleLength);
    const ovulationDate = predictOvulation(lastPeriodDate, averageCycleLength);
    const fertileWindow = calculateFertileWindow(ovulationDate);

    const predictions: CyclePredictions = {
      nextPeriodDate,
      nextOvulationDate: ovulationDate,
      fertileWindowStart: fertileWindow.start,
      fertileWindowEnd: fertileWindow.end
    };

    return {
      cycleDay,
      phase,
      onPeriod,
      lastPeriodStart: lastPeriodDate,
      predictions
    };
  }, [cycles]);

  return {
    cycles,
    loading: isLoading,
    addCycle: addCycleMutation.mutate,
    updateCycle: updateCycleMutation.mutate,
    getCurrentCycleInfo,
    isFirstTime: cycles.length === 0
  };
}
