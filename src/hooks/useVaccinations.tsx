import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';

export interface Vaccination {
  id: string;
  patient_id: string;
  vaccine_name: string;
  scheduled_date: string;
  administered_date: string | null;
  status: 'due' | 'overdue' | 'completed' | 'not_applicable';
  healthcare_provider_id: string | null;
  notes: string | null;
  patient_type: string;
}

const PAGE_SIZE = 20;

export const useVaccinations = (patientId?: string, page: number = 0) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.vaccinations.list(patientId),
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Get total count
      let countQuery = supabase
        .from('vaccinations')
        .select('*', { count: 'exact', head: true });

      if (patientId) {
        countQuery = countQuery.eq('patient_id', patientId);
      }

      const { count } = await countQuery;

      // Fetch page data with only required columns
      let query = supabase
        .from('vaccinations')
        .select('id, patient_id, vaccine_name, scheduled_date, administered_date, status, healthcare_provider_id, notes, patient_type')
        .order('scheduled_date', { ascending: true })
        .range(from, to);

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return {
        vaccinations: data || [],
        hasMore: (data?.length || 0) === PAGE_SIZE,
        totalCount: count || 0,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const markAsAdministered = useMutation({
    mutationFn: async ({ id, administered_date }: { id: string; administered_date: string }) => {
      const { data, error } = await supabase
        .from('vaccinations')
        .update({ 
          administered_date, 
          status: 'completed' as const
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, administered_date }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.vaccinations.list(patientId) });
      const previousData = queryClient.getQueryData(queryKeys.vaccinations.list(patientId));

      queryClient.setQueryData(queryKeys.vaccinations.list(patientId), (old: any) => ({
        ...old,
        vaccinations: old?.vaccinations?.map((v: Vaccination) => 
          v.id === id ? { ...v, administered_date, status: 'completed' as const } : v
        ) || [],
      }));

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKeys.vaccinations.list(patientId), context?.previousData);
      toast.error('Failed to update vaccination');
    },
    onSuccess: () => {
      toast.success('Vaccination marked as completed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vaccinations.list(patientId) });
    },
  });

  return { 
    vaccinations: data?.vaccinations || [],
    loading: isLoading,
    hasMore: data?.hasMore || false,
    totalCount: data?.totalCount || 0,
    error,
    markAsAdministered: markAsAdministered.mutate,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.vaccinations.list(patientId) }),
  };
};
