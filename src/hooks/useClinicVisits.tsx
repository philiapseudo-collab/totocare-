import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ClinicVisit {
  id: string;
  patient_id: string;
  visit_date: string;
  visit_type: string;
  healthcare_provider_id: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  blood_pressure: string | null;
  weight: number | null;
  notes: string | null;
  next_visit_date: string | null;
}

export const useClinicVisits = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<ClinicVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('clinic_visits')
        .select('*')
        .order('visit_date', { ascending: false });

      if (error) throw error;
      setVisits(data || []);
    } catch (error: any) {
      toast.error('Failed to load clinic visits');
      console.error('Error fetching clinic visits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [user]);

  return { visits, loading, refetch: fetchVisits };
};
