import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  blood_group: string | null;
  current_weight: number | null;
  profile_completed: boolean;
}

interface Pregnancy {
  current_week: number;
  due_date: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pregnancy, setPregnancy] = useState<Pregnancy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch pregnancy if exists
        if (profileData?.id) {
          const { data: pregnancyData } = await supabase
            .from('pregnancies')
            .select('current_week, due_date')
            .eq('mother_id', profileData.id)
            .eq('status', 'pregnant')
            .maybeSingle();

          setPregnancy(pregnancyData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, pregnancy, loading };
};
