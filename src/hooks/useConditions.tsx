import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';

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

const PAGE_SIZE = 20;

export const useConditions = (patientId?: string, page: number = 0) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.conditions.list(patientId),
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Get total count
      const { count } = await supabase
        .from('conditions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch page data with only required columns
      let query = supabase
        .from('conditions')
        .select('id, patient_id, condition_name, diagnosed_date, severity, is_active, treatment, notes, healthcare_provider_id')
        .eq('is_active', true)
        .order('diagnosed_date', { ascending: false })
        .range(from, to);

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return {
        conditions: data || [],
        hasMore: (data?.length || 0) === PAGE_SIZE,
        totalCount: count || 0,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const addCondition = useMutation({
    mutationFn: async (condition: Omit<Condition, 'id'>) => {
      const { data, error } = await supabase
        .from('conditions')
        .insert([condition])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newCondition) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.conditions.list(patientId) });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKeys.conditions.list(patientId));

      // Optimistically update
      queryClient.setQueryData(queryKeys.conditions.list(patientId), (old: any) => ({
        ...old,
        conditions: [{ ...newCondition, id: 'temp-id' }, ...(old?.conditions || [])],
      }));

      return { previousData };
    },
    onError: (err, newCondition, context) => {
      queryClient.setQueryData(queryKeys.conditions.list(patientId), context?.previousData);
      toast.error('Failed to add condition');
    },
    onSuccess: () => {
      toast.success('Condition added successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conditions.list(patientId) });
    },
  });

  const updateCondition = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Condition> }) => {
      const { data, error } = await supabase
        .from('conditions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.conditions.list(patientId) });
      const previousData = queryClient.getQueryData(queryKeys.conditions.list(patientId));

      queryClient.setQueryData(queryKeys.conditions.list(patientId), (old: any) => ({
        ...old,
        conditions: old?.conditions?.map((c: Condition) => 
          c.id === id ? { ...c, ...updates } : c
        ) || [],
      }));

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKeys.conditions.list(patientId), context?.previousData);
      toast.error('Failed to update condition');
    },
    onSuccess: () => {
      toast.success('Condition updated successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conditions.list(patientId) });
    },
  });

  return { 
    conditions: data?.conditions || [],
    loading: isLoading,
    hasMore: data?.hasMore || false,
    totalCount: data?.totalCount || 0,
    error,
    addCondition: addCondition.mutate,
    updateCondition: updateCondition.mutate,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.conditions.list(patientId) }),
  };
};
