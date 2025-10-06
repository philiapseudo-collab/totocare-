import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AntenatalVisit {
  id: string;
  visit_number: number;
  gestational_week_min: number;
  gestational_week_max: number | null;
  visit_title: string;
  key_activities: any;
  tests_required: any;
  health_education_topics: any;
}

export const useAntenatalSchedule = (currentWeek?: number) => {
  const [visits, setVisits] = useState<AntenatalVisit[]>([]);
  const [currentVisit, setCurrentVisit] = useState<AntenatalVisit | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('antenatal_visit_schedule')
        .select('*')
        .order('visit_number', { ascending: true });

      if (error) throw error;
      setVisits(data || []);

      // Find current visit based on gestational week
      if (currentWeek && data) {
        const current = data.find(
          (visit) =>
            visit.gestational_week_min <= currentWeek &&
            (visit.gestational_week_max === null || visit.gestational_week_max >= currentWeek)
        );
        setCurrentVisit(current || null);
      }
    } catch (error: any) {
      toast.error('Failed to load antenatal schedule');
      console.error('Error fetching antenatal schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [currentWeek]);

  return { visits, currentVisit, loading, refetch: fetchSchedule };
};
