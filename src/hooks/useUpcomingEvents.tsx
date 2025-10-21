import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys } from '@/lib/queryKeys';

export interface UpcomingEvent {
  id: string;
  title: string;
  type: 'vaccination' | 'appointment';
  date: string;
  status: string;
  location?: string;
  description?: string;
}

export const useUpcomingEvents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: queryKeys.upcomingEvents(user?.id),
    queryFn: async () => {
      if (!user) return [];
      
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(now.getDate() + 7);

      // Fetch upcoming appointments
      const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('id, appointment_type, appointment_date, status, notes')
        .gte('appointment_date', now.toISOString())
        .lte('appointment_date', weekFromNow.toISOString())
        .order('appointment_date', { ascending: true });

      if (apptError) throw apptError;

      // Fetch upcoming vaccinations
      const { data: vaccinations, error: vaccError } = await supabase
        .from('vaccinations')
        .select('id, vaccine_name, scheduled_date, status, notes')
        .gte('scheduled_date', now.toISOString().split('T')[0])
        .lte('scheduled_date', weekFromNow.toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true });

      if (vaccError) throw vaccError;

      const allEvents: UpcomingEvent[] = [
        ...(appointments || []).map(apt => ({
          id: apt.id,
          title: apt.appointment_type,
          type: 'appointment' as const,
          date: new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          status: apt.status,
          description: apt.notes || undefined
        })),
        ...(vaccinations || []).map(vac => ({
          id: vac.id,
          title: vac.vaccine_name,
          type: 'vaccination' as const,
          date: new Date(vac.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          status: vac.status,
          description: vac.notes || undefined
        }))
      ];

      return allEvents;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return { 
    events, 
    loading: isLoading, 
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.upcomingEvents(user?.id) })
  };
};
