import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Vaccination {
  id: string;
  patient_id: string;
  vaccine_name: string;
  scheduled_date: string;
  administered_date: string | null;
  status: 'due' | 'overdue' | 'completed' | 'not_applicable';
  healthcare_provider_id: string | null;
  notes: string | null;
  patient_type: string;
}

export const useVaccinations = () => {
  const { user } = useAuth();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVaccinations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setVaccinations(data || []);
    } catch (error: any) {
      toast.error('Failed to load vaccinations');
      console.error('Error fetching vaccinations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinations();

    if (!user) return;

    // Setup realtime subscription
    const channel = supabase
      .channel('vaccinations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vaccinations'
        },
        () => {
          fetchVaccinations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { vaccinations, loading, refetch: fetchVaccinations };
};
