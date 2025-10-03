import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UpcomingEvent {
  id: string;
  title: string;
  type: 'vaccination' | 'appointment' | 'screening';
  date: string;
  status: string;
  location?: string;
  description?: string;
}

export const useUpcomingEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    if (!user) return;
    
    try {
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(now.getDate() + 7);

      // Fetch upcoming appointments
      const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', now.toISOString())
        .lte('appointment_date', weekFromNow.toISOString())
        .order('appointment_date', { ascending: true });

      if (apptError) throw apptError;

      // Fetch upcoming vaccinations
      const { data: vaccinations, error: vaccError } = await supabase
        .from('vaccinations')
        .select('*')
        .gte('scheduled_date', now.toISOString().split('T')[0])
        .lte('scheduled_date', weekFromNow.toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true });

      if (vaccError) throw vaccError;

      // Fetch upcoming screenings
      const { data: screenings, error: screenError } = await supabase
        .from('screenings')
        .select('*')
        .gte('scheduled_date', now.toISOString().split('T')[0])
        .lte('scheduled_date', weekFromNow.toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true });

      if (screenError) throw screenError;

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
        })),
        ...(screenings || []).map(scr => ({
          id: scr.id,
          title: scr.screening_type,
          type: 'screening' as const,
          date: new Date(scr.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          status: scr.status,
          description: scr.notes || undefined
        }))
      ];

      setEvents(allEvents);
    } catch (error: any) {
      toast.error('Failed to load upcoming events');
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return { events, loading, refetch: fetchEvents };
};
