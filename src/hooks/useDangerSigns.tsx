import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DangerSign {
  id: string;
  patient_type: string;
  timing: string;
  danger_sign: string;
  severity: string;
  recommended_action: string;
}

export const useDangerSigns = (patientType?: string, timing?: string) => {
  const [dangerSigns, setDangerSigns] = useState<DangerSign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDangerSigns = async () => {
    try {
      let query = supabase
        .from('danger_signs')
        .select('*')
        .order('severity', { ascending: false });

      if (patientType) {
        query = query.eq('patient_type', patientType);
      }
      if (timing) {
        query = query.eq('timing', timing);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDangerSigns(data || []);
    } catch (error: any) {
      toast.error('Failed to load danger signs');
      console.error('Error fetching danger signs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDangerSigns();
  }, [patientType, timing]);

  return { dangerSigns, loading, refetch: fetchDangerSigns };
};
