import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SymptomHistoryEntry {
  id: string;
  user_id: string;
  symptom_description: string;
  ai_assessment: string;
  severity_level: 'normal' | 'monitor' | 'urgent';
  ai_explanation: string | null;
  created_at: string;
  updated_at: string;
}

export const useSymptomHistory = () => {
  const queryClient = useQueryClient();

  const { data: symptoms, isLoading } = useQuery({
    queryKey: ['symptom-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('symptom_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SymptomHistoryEntry[];
    },
  });

  const saveSymptom = useMutation({
    mutationFn: async (symptomData: {
      symptom_description: string;
      ai_assessment: string;
      severity_level: 'normal' | 'monitor' | 'urgent';
      ai_explanation: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('symptom_history')
        .insert([{
          user_id: user.id,
          ...symptomData
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptom-history'] });
      toast.success('Symptom saved to history');
    },
    onError: (error: Error) => {
      toast.error('Failed to save symptom: ' + error.message);
    },
  });

  const deleteSymptom = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('symptom_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptom-history'] });
      toast.success('Symptom deleted from history');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete symptom: ' + error.message);
    },
  });

  return {
    symptoms,
    isLoading,
    saveSymptom,
    deleteSymptom,
  };
};
