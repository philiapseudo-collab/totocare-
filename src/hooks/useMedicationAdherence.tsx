import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, startOfMonth, subDays, subMonths } from "date-fns";

export interface MedicationAction {
  id: string;
  medication_id: string;
  user_id: string;
  action_type: 'taken' | 'skipped' | 'missed' | 'snoozed';
  scheduled_time: string;
  action_time: string;
  notes?: string;
  created_at: string;
}

export interface AdherenceStats {
  total: number;
  taken: number;
  skipped: number;
  missed: number;
  snoozed: number;
  adherenceRate: number;
  currentStreak: number;
}

export const useMedicationAdherence = (timeRange: '7d' | '30d' | '90d' | 'all' = '30d') => {
  const { data: actions, isLoading } = useQuery({
    queryKey: ['medication-adherence', timeRange],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let startDate: Date;
      switch (timeRange) {
        case '7d':
          startDate = subDays(new Date(), 7);
          break;
        case '30d':
          startDate = subDays(new Date(), 30);
          break;
        case '90d':
          startDate = subMonths(new Date(), 3);
          break;
        default:
          startDate = new Date(0); // All time
      }

      const { data, error } = await supabase
        .from('medication_actions')
        .select('*')
        .eq('user_id', user.id)
        .gte('action_time', startDate.toISOString())
        .order('action_time', { ascending: false });

      if (error) throw error;
      return data as MedicationAction[];
    },
  });

  const stats: AdherenceStats = {
    total: actions?.length || 0,
    taken: actions?.filter(a => a.action_type === 'taken').length || 0,
    skipped: actions?.filter(a => a.action_type === 'skipped').length || 0,
    missed: actions?.filter(a => a.action_type === 'missed').length || 0,
    snoozed: actions?.filter(a => a.action_type === 'snoozed').length || 0,
    adherenceRate: 0,
    currentStreak: 0,
  };

  // Calculate adherence rate (taken / (taken + skipped + missed))
  const totalRelevant = stats.taken + stats.skipped + stats.missed;
  stats.adherenceRate = totalRelevant > 0 ? (stats.taken / totalRelevant) * 100 : 0;

  // Calculate current streak
  if (actions && actions.length > 0) {
    const sortedActions = [...actions].sort((a, b) => 
      new Date(b.action_time).getTime() - new Date(a.action_time).getTime()
    );
    
    let streak = 0;
    for (const action of sortedActions) {
      if (action.action_type === 'taken') {
        streak++;
      } else if (action.action_type === 'skipped' || action.action_type === 'missed') {
        break;
      }
    }
    stats.currentStreak = streak;
  }

  return {
    actions: actions || [],
    stats,
    isLoading,
  };
};
