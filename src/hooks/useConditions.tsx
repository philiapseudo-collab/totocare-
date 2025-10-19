import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Condition {
  id: string;
  patient_id: string;
  condition_name: string;
  diagnosed_date: string | null;
  severity: 'mild' | 'moderate' | 'severe' | null;
  is_active: boolean;
  treatment: string | null;
  notes: string | null;
  healthcare_provider_id: string | null;
}

const PAGE_SIZE = 20;

export const useConditions = (page: number = 0) => {
  const { user } = useAuth();
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchConditions = async () => {
    if (!user) return;
    
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Get total count
      const { count } = await supabase
        .from('conditions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setTotalCount(count || 0);

      // Fetch page data with only required columns
      const { data, error } = await supabase
        .from('conditions')
        .select('id, patient_id, condition_name, diagnosed_date, severity, is_active, treatment, notes, healthcare_provider_id')
        .eq('is_active', true)
        .order('diagnosed_date', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setConditions(data || []);
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (error: any) {
      toast.error('Failed to load conditions');
      console.error('Error fetching conditions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, [user, page]);

  return { 
    conditions, 
    loading, 
    hasMore, 
    totalCount,
    refetch: fetchConditions 
  };
};
