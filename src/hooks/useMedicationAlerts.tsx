import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MedicationAlert {
  id: string;
  user_id: string;
  drug_name: string;
  category: string;
  risk_level: string;
  alert_message: string;
  is_bookmarked: boolean;
  patient_type: string;
  created_at: string;
  updated_at: string;
}

export const useMedicationAlerts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['medication-alerts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('medication_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MedicationAlert[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (alert: Omit<MedicationAlert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('medication_alerts')
        .insert({
          user_id: user.id,
          ...alert,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medication-alerts'] });
      toast({
        title: "Saved",
        description: "Drug check saved to history",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save drug check",
        variant: "destructive",
      });
      console.error('Error saving medication alert:', error);
    },
  });

  const updateBookmarkMutation = useMutation({
    mutationFn: async ({ id, is_bookmarked }: { id: string; is_bookmarked: boolean }) => {
      const { error } = await supabase
        .from('medication_alerts')
        .update({ is_bookmarked })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medication-alerts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
      console.error('Error updating bookmark:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medication_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medication-alerts'] });
      toast({
        title: "Deleted",
        description: "Drug check removed from history",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete drug check",
        variant: "destructive",
      });
      console.error('Error deleting medication alert:', error);
    },
  });

  return {
    alerts,
    isLoading,
    saveAlert: saveMutation.mutate,
    updateBookmark: updateBookmarkMutation.mutate,
    deleteAlert: deleteMutation.mutate,
  };
};