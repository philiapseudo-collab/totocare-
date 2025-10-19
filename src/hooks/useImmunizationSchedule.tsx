import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';

export interface ImmunizationSchedule {
  id: string;
  vaccine_name: string;
  patient_type: string;
  age_weeks: number | null;
  age_months: number | null;
  gestational_timing: string | null;
  dose_number: number | null;
  vaccine_details: any;
  side_effects: any;
}

export const useImmunizationSchedule = (patientType?: string) => {
  return useQuery({
    queryKey: queryKeys.immunizationSchedule.list(patientType),
    queryFn: async () => {
      let query = supabase
        .from('immunization_schedule')
        .select('id, vaccine_name, patient_type, age_weeks, age_months, gestational_timing, dose_number, vaccine_details, side_effects')
        .order('age_months', { ascending: true, nullsFirst: false })
        .order('age_weeks', { ascending: true, nullsFirst: false });

      if (patientType) {
        query = query.eq('patient_type', patientType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ImmunizationSchedule[];
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (static data)
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days
  });
};
