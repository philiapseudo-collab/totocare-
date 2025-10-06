import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { differenceInWeeks, differenceInMonths, addWeeks, addMonths } from 'date-fns';

interface UpcomingVaccination {
  vaccine_name: string;
  dose_number: number;
  age_weeks: number | null;
  age_months: number | null;
  due_date: string;
  infant_name: string;
  infant_id: string;
  vaccine_details: any;
}

export const useUpcomingInfantVaccinations = () => {
  const [upcomingVaccinations, setUpcomingVaccinations] = useState<UpcomingVaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    if (!profile?.id) return;
    
    fetchUpcomingVaccinations();

    // Setup realtime subscriptions for infants and vaccinations
    const infantsChannel = supabase
      .channel('infants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'infants'
        },
        () => {
          fetchUpcomingVaccinations();
        }
      )
      .subscribe();

    const vaccinationsChannel = supabase
      .channel('upcoming-vaccinations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vaccinations'
        },
        () => {
          fetchUpcomingVaccinations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(infantsChannel);
      supabase.removeChannel(vaccinationsChannel);
    };
  }, [profile?.id]);

  const fetchUpcomingVaccinations = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      // Fetch all infants for this mother
      const { data: infants, error: infantsError } = await supabase
        .from('infants')
        .select('*')
        .eq('mother_id', profile.id);

      if (infantsError) throw infantsError;

      if (!infants || infants.length === 0) {
        setUpcomingVaccinations([]);
        return;
      }

      // Fetch all vaccinations for these infants
      const infantIds = infants.map(i => i.id);
      const { data: existingVaccinations, error: vaccinationsError } = await supabase
        .from('vaccinations')
        .select('vaccine_name, patient_id, status')
        .in('patient_id', infantIds);

      if (vaccinationsError) throw vaccinationsError;

      // Fetch the immunization schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from('immunization_schedule')
        .select('*')
        .eq('patient_type', 'infant')
        .order('age_weeks', { ascending: true, nullsFirst: false })
        .order('age_months', { ascending: true, nullsFirst: false });

      if (scheduleError) throw scheduleError;

      // Calculate upcoming vaccinations for each infant
      const upcoming: UpcomingVaccination[] = [];

      for (const infant of infants) {
        const birthDate = new Date(infant.birth_date);
        const today = new Date();
        const ageInWeeks = differenceInWeeks(today, birthDate);
        const ageInMonths = differenceInMonths(today, birthDate);

        // Get completed vaccinations for this infant
        const completedVaccines = new Set(
          (existingVaccinations || [])
            .filter(v => v.patient_id === infant.id && v.status === 'completed')
            .map(v => v.vaccine_name)
        );

        // Find vaccines due based on age
        for (const vaccine of schedule || []) {
          // Skip if already completed
          if (completedVaccines.has(vaccine.vaccine_name)) continue;

          let isDue = false;
          let dueDate: Date | null = null;

          // Check if vaccine is due based on age
          if (vaccine.age_weeks !== null && vaccine.age_weeks <= ageInWeeks) {
            isDue = true;
            dueDate = addWeeks(birthDate, vaccine.age_weeks);
          } else if (vaccine.age_months !== null && vaccine.age_months <= ageInMonths) {
            isDue = true;
            dueDate = addMonths(birthDate, vaccine.age_months);
          }

          if (isDue && dueDate) {
            upcoming.push({
              vaccine_name: vaccine.vaccine_name,
              dose_number: vaccine.dose_number || 1,
              age_weeks: vaccine.age_weeks,
              age_months: vaccine.age_months,
              due_date: dueDate.toISOString().split('T')[0],
              infant_name: infant.first_name,
              infant_id: infant.id,
              vaccine_details: vaccine.vaccine_details
            });
          }
        }
      }

      // Sort by due date and take next 3
      upcoming.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      setUpcomingVaccinations(upcoming.slice(0, 3));

    } catch (error) {
      console.error('Error fetching upcoming vaccinations:', error);
      setUpcomingVaccinations([]);
    } finally {
      setLoading(false);
    }
  };

  const scheduleVaccination = async (vaccination: UpcomingVaccination) => {
    try {
      const { error } = await supabase
        .from('vaccinations')
        .insert({
          vaccine_name: vaccination.vaccine_name,
          patient_id: vaccination.infant_id,
          patient_type: 'infant',
          scheduled_date: vaccination.due_date,
          status: 'due',
          notes: `Dose ${vaccination.dose_number} - Due at ${vaccination.age_weeks ? vaccination.age_weeks + ' weeks' : vaccination.age_months + ' months'}`
        });

      if (error) throw error;

      // Refresh the list
      await fetchUpcomingVaccinations();
      return true;
    } catch (error) {
      console.error('Error scheduling vaccination:', error);
      return false;
    }
  };

  const markAsCompleted = async (vaccination: UpcomingVaccination) => {
    try {
      const { error } = await supabase
        .from('vaccinations')
        .insert({
          vaccine_name: vaccination.vaccine_name,
          patient_id: vaccination.infant_id,
          patient_type: 'infant',
          scheduled_date: vaccination.due_date,
          administered_date: new Date().toISOString().split('T')[0],
          status: 'completed',
          notes: `Dose ${vaccination.dose_number} - Completed`
        });

      if (error) throw error;

      // Refresh the list
      await fetchUpcomingVaccinations();
      return true;
    } catch (error) {
      console.error('Error marking vaccination as completed:', error);
      return false;
    }
  };

  return {
    upcomingVaccinations,
    loading,
    scheduleVaccination,
    markAsCompleted,
    refetch: fetchUpcomingVaccinations
  };
};
