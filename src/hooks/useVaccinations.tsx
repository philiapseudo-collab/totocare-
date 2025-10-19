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

const PAGE_SIZE = 20;

export const useVaccinations = (page: number = 0) => {
  const { user } = useAuth();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVaccinations = async () => {
    if (!user) return;
    
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Get total count
      const { count } = await supabase
        .from('vaccinations')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      // Fetch page data with only required columns
      const { data, error } = await supabase
        .from('vaccinations')
        .select('id, patient_id, vaccine_name, scheduled_date, administered_date, status, healthcare_provider_id, notes, patient_type')
        .order('scheduled_date', { ascending: true })
        .range(from, to);

      if (error) throw error;
      
      setVaccinations(data || []);
      setHasMore((data?.length || 0) === PAGE_SIZE);
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
  }, [user, page]);

  return { 
    vaccinations, 
    loading, 
    hasMore, 
    totalCount,
    refetch: fetchVaccinations 
  };
};
