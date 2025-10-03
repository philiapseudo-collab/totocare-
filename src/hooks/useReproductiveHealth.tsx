import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ReproductiveHealthRecord {
  id: string;
  mother_id: string;
  record_date: string;
  menstrual_cycle_day: number | null;
  cycle_length: number | null;
  flow_intensity: string | null;
  temperature: number | null;
  symptoms: string[] | null;
  mood: string | null;
  notes: string | null;
}

export const useReproductiveHealth = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<ReproductiveHealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('reproductive_health')
        .select('*')
        .order('record_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast.error('Failed to load reproductive health records');
      console.error('Error fetching reproductive health records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  return { records, loading, refetch: fetchRecords };
};
