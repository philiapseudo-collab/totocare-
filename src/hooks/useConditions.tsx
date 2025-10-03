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

export const useConditions = () => {
  const { user } = useAuth();
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConditions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('conditions')
        .select('*')
        .eq('is_active', true)
        .order('diagnosed_date', { ascending: false });

      if (error) throw error;
      setConditions(data || []);
    } catch (error: any) {
      toast.error('Failed to load conditions');
      console.error('Error fetching conditions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, [user]);

  return { conditions, loading, refetch: fetchConditions };
};
