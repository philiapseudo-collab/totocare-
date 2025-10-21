import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { differenceInMonths, differenceInWeeks } from 'date-fns';

interface VaccinationRecommendation {
  vaccine_name: string;
  patient_type: string;
  age_months?: number;
  age_weeks?: number;
  gestational_timing?: string;
  dose_number?: number;
  vaccine_details?: any;
  patient_id?: string;
  patient_name?: string;
}

export const useVaccinationRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<VaccinationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRecommendations = async () => {
      try {
        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;

        // Get infants
        const { data: infants } = await supabase
          .from('infants')
          .select('*')
          .eq('mother_id', profile.id);

        // Get pregnancy
        const { data: pregnancy } = await supabase
          .from('pregnancies')
          .select('current_week, due_date')
          .eq('mother_id', profile.id)
          .eq('status', 'pregnant')
          .maybeSingle();

        // Get immunization schedule
        const { data: schedule } = await supabase
          .from('immunization_schedule')
          .select('*')
          .order('age_months', { ascending: true });

        // Get existing vaccinations
        const { data: existingVaccinations } = await supabase
          .from('vaccinations')
          .select('vaccine_name, patient_id');

        if (!schedule) return;

        const suggestions: VaccinationRecommendation[] = [];

        // Check infant vaccinations
        if (infants && infants.length > 0) {
          infants.forEach(infant => {
            const ageInMonths = differenceInMonths(new Date(), new Date(infant.birth_date));
            
            const infantSchedule = schedule.filter(s => s.patient_type === 'infant');
            
            infantSchedule.forEach(item => {
              // Check if vaccine is due based on age
              if (item.age_months !== null && ageInMonths >= item.age_months && ageInMonths <= (item.age_months + 2)) {
                // Check if not already added
                const alreadyExists = existingVaccinations?.some(
                  v => v.vaccine_name === item.vaccine_name && 
                       v.patient_id === infant.id
                );

                if (!alreadyExists) {
                  suggestions.push({
                    ...item,
                    patient_id: infant.id,
                    patient_name: infant.first_name
                  });
                }
              }
            });
          });
        }

        // Check mother vaccinations based on gestational age
        if (pregnancy && pregnancy.current_week) {
          const motherSchedule = schedule.filter(s => s.patient_type === 'mother');
          
          motherSchedule.forEach(item => {
            if (item.gestational_timing) {
              // Parse gestational timing (e.g., "27-36 weeks")
              const timingMatch = item.gestational_timing.match(/(\d+)-?(\d*)/);
              if (timingMatch) {
                const startWeek = parseInt(timingMatch[1]);
                const endWeek = timingMatch[2] ? parseInt(timingMatch[2]) : startWeek + 4;
                
                if (pregnancy.current_week >= startWeek && pregnancy.current_week <= endWeek) {
                  const alreadyExists = existingVaccinations?.some(
                    v => v.vaccine_name === item.vaccine_name && 
                         v.patient_id === profile.id
                  );

                  if (!alreadyExists) {
                    suggestions.push({
                      ...item,
                      patient_id: profile.id,
                      patient_name: 'You (Mother)'
                    });
                  }
                }
              }
            }
          });
        }

        setRecommendations(suggestions);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  return { recommendations, loading };
};
