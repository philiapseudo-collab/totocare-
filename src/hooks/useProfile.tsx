import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { queryKeys } from '@/lib/queryKeys';
import { useEffect } from 'react';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  blood_group: string | null;
  current_weight: number | null;
  profile_completed: boolean;
}

export interface Pregnancy {
  current_week: number;
  due_date: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: queryKeys.profile(user?.id),
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, date_of_birth, blood_group, current_weight, profile_completed')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const { data: pregnancy, isLoading: pregnancyLoading } = useQuery({
    queryKey: queryKeys.pregnancies.active(profile?.id),
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('pregnancies')
        .select('current_week, due_date')
        .eq('mother_id', profile.id)
        .eq('status', 'pregnant')
        .maybeSingle();

      if (error) throw error;
      return data as Pregnancy | null;
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Subscribe to realtime updates for profile changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.profile(user.id) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return { 
    profile, 
    pregnancy, 
    loading: profileLoading || pregnancyLoading 
  };
};
