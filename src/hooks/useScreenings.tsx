import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Screening {
  id: string;
  patient_id: string;
  screening_type: string;
  scheduled_date: string;
  completed_date: string | null;
  status: 'due' | 'completed' | 'normal' | 'abnormal';
  results: any | null;
  healthcare_provider_id: string | null;
  notes: string | null;
}

export const useScreenings = () => {
  const { user } = useAuth();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScreenings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('screenings')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setScreenings(data || []);
    } catch (error: any) {
      toast.error('Failed to load screenings');
      console.error('Error fetching screenings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenings();
  }, [user]);

  return { screenings, loading, refetch: fetchScreenings };
};
