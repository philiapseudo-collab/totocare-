import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
import { optimisticMedicationUpdate } from "@/lib/optimisticUpdates";
import { toast } from "sonner";

export const useMedicationsOptimized = (patientId: string) => {
  const queryClient = useQueryClient();

  // Fetch medications with centralized query key
  const {
    data: medications,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.medications.list(patientId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("patient_id", patientId)
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add medication with optimistic update
  const addMedication = useMutation({
    mutationFn: async (newMedication: any) => {
      const { data, error } = await supabase
        .from("medications")
        .insert(newMedication)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newMedication) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.medications.list(patientId) });

      // Snapshot previous value
      const previousMedications = queryClient.getQueryData(queryKeys.medications.list(patientId));

      // Optimistically update
      optimisticMedicationUpdate.add(queryClient, newMedication, patientId);

      return { previousMedications };
    },
    onError: (error, newMedication, context) => {
      // Rollback on error
      if (context?.previousMedications) {
        queryClient.setQueryData(
          queryKeys.medications.list(patientId),
          context.previousMedications
        );
      }
      toast.error("Failed to add medication");
    },
    onSuccess: () => {
      toast.success("Medication added successfully");
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.list(patientId) });
    },
  });

  // Mark medication as taken with optimistic update
  const markAsTaken = useMutation({
    mutationFn: async ({ medicationId, actionData }: { medicationId: string; actionData: any }) => {
      // Update medication
      const { error: medError } = await supabase
        .from("medications")
        .update({ last_notified_at: new Date().toISOString() })
        .eq("id", medicationId);

      if (medError) throw medError;

      // Log action
      const { data, error: actionError } = await supabase
        .from("medication_actions")
        .insert(actionData)
        .select()
        .single();

      if (actionError) throw actionError;
      return data;
    },
    onMutate: async ({ medicationId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medications.list(patientId) });

      const previousMedications = queryClient.getQueryData(queryKeys.medications.list(patientId));

      // Optimistically update
      optimisticMedicationUpdate.markTaken(queryClient, medicationId, patientId);

      return { previousMedications };
    },
    onError: (error, variables, context) => {
      if (context?.previousMedications) {
        queryClient.setQueryData(
          queryKeys.medications.list(patientId),
          context.previousMedications
        );
      }
      toast.error("Failed to mark medication as taken");
    },
    onSuccess: () => {
      toast.success("Marked as taken");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.list(patientId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.adherence(patientId, "week") });
    },
  });

  // Delete medication with optimistic update
  const deleteMedication = useMutation({
    mutationFn: async (medicationId: string) => {
      const { error } = await supabase
        .from("medications")
        .update({ is_active: false })
        .eq("id", medicationId);

      if (error) throw error;
    },
    onMutate: async (medicationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medications.list(patientId) });

      const previousMedications = queryClient.getQueryData(queryKeys.medications.list(patientId));

      // Optimistically remove
      optimisticMedicationUpdate.remove(queryClient, medicationId, patientId);

      return { previousMedications };
    },
    onError: (error, medicationId, context) => {
      if (context?.previousMedications) {
        queryClient.setQueryData(
          queryKeys.medications.list(patientId),
          context.previousMedications
        );
      }
      toast.error("Failed to delete medication");
    },
    onSuccess: () => {
      toast.success("Medication deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.list(patientId) });
    },
  });

  return {
    medications,
    isLoading,
    error,
    addMedication: addMedication.mutate,
    markAsTaken: markAsTaken.mutate,
    deleteMedication: deleteMedication.mutate,
  };
};
