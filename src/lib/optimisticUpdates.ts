import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

// Helper functions for optimistic updates

export const optimisticMedicationUpdate = {
  // Mark medication as taken
  markTaken: (
    queryClient: QueryClient,
    medicationId: string,
    patientId: string
  ) => {
    const queryKey = queryKeys.medications.list(patientId);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return old.map((med: any) =>
        med.id === medicationId
          ? { ...med, last_notified_at: new Date().toISOString() }
          : med
      );
    });
  },

  // Add new medication
  add: (
    queryClient: QueryClient,
    newMedication: any,
    patientId: string
  ) => {
    const queryKey = queryKeys.medications.list(patientId);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return [newMedication];
      return [newMedication, ...old];
    });
  },

  // Delete medication
  remove: (
    queryClient: QueryClient,
    medicationId: string,
    patientId: string
  ) => {
    const queryKey = queryKeys.medications.list(patientId);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return old.filter((med: any) => med.id !== medicationId);
    });
  },
};

export const optimisticJournalUpdate = {
  // Add new entry
  add: (
    queryClient: QueryClient,
    newEntry: any,
    userId: string
  ) => {
    const queryKey = queryKeys.journal.list(userId);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return [newEntry];
      return [newEntry, ...old];
    });
  },

  // Update entry
  update: (
    queryClient: QueryClient,
    entryId: string,
    updates: any,
    userId: string
  ) => {
    const queryKey = queryKeys.journal.list(userId);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return old.map((entry: any) =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      );
    });
  },

  // Delete entry
  remove: (
    queryClient: QueryClient,
    entryId: string,
    userId: string
  ) => {
    const queryKey = queryKeys.journal.list(userId);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return old.filter((entry: any) => entry.id !== entryId);
    });
  },
};

export const optimisticConditionUpdate = {
  // Add new condition
  add: (
    queryClient: QueryClient,
    newCondition: any,
    patientId: string
  ) => {
    const queryKey = queryKeys.conditions.list(patientId);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return [newCondition];
      return [newCondition, ...old];
    });
  },

  // Update condition
  update: (
    queryClient: QueryClient,
    conditionId: string,
    updates: any,
    patientId: string
  ) => {
    const queryKey = queryKeys.conditions.list(patientId);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return old.map((condition: any) =>
        condition.id === conditionId ? { ...condition, ...updates } : condition
      );
    });
  },
};

export const optimisticVaccinationUpdate = {
  // Mark as administered
  markAdministered: (
    queryClient: QueryClient,
    vaccinationId: string,
    patientId: string
  ) => {
    const queryKey = queryKeys.vaccinations.list(patientId);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return old.map((vax: any) =>
        vax.id === vaccinationId
          ? {
              ...vax,
              status: 'completed',
              administered_date: new Date().toISOString().split('T')[0],
            }
          : vax
      );
    });
  },

  // Add new vaccination
  add: (
    queryClient: QueryClient,
    newVaccination: any,
    patientId: string
  ) => {
    const queryKey = queryKeys.vaccinations.list(patientId);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return [newVaccination];
      return [...old, newVaccination];
    });
  },
};
