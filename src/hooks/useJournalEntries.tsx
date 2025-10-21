import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';

export interface JournalEntry {
  id: string;
  entry_type: string;
  title: string;
  content: string | null;
  who: string;
  entry_date: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 20;

export const useJournalEntries = (userId?: string, page: number = 0) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.journal.list(userId || user?.id || ''),
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Get total count
      const { count } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true });

      // Fetch page data with only required columns
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, entry_type, title, content, who, entry_date, tags, created_at, updated_at')
        .order('entry_date', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      return {
        entries: data || [],
        hasMore: (data?.length || 0) === PAGE_SIZE,
        totalCount: count || 0,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const addEntry = useMutation({
    mutationFn: async (entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{ ...entry, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newEntry) => {
      const queryKey = queryKeys.journal.list(userId || user?.id || '');
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        entries: [{ ...newEntry, id: 'temp-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...(old?.entries || [])],
      }));

      return { previousData };
    },
    onError: (err, newEntry, context) => {
      queryClient.setQueryData(queryKeys.journal.list(userId || user?.id || ''), context?.previousData);
      toast.error('Failed to add entry');
    },
    onSuccess: () => {
      toast.success('Entry added successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.list(userId || user?.id || '') });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>> }) => {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      const queryKey = queryKeys.journal.list(userId || user?.id || '');
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        entries: old?.entries?.map((e: JournalEntry) => 
          e.id === id ? { ...e, ...updates } : e
        ) || [],
      }));

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKeys.journal.list(userId || user?.id || ''), context?.previousData);
      toast.error('Failed to update entry');
    },
    onSuccess: () => {
      toast.success('Entry updated successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.list(userId || user?.id || '') });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      const queryKey = queryKeys.journal.list(userId || user?.id || '');
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        entries: old?.entries?.filter((e: JournalEntry) => e.id !== id) || [],
      }));

      return { previousData };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(queryKeys.journal.list(userId || user?.id || ''), context?.previousData);
      toast.error('Failed to delete entry');
    },
    onSuccess: () => {
      toast.success('Entry deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.list(userId || user?.id || '') });
    },
  });

  return { 
    entries: data?.entries || [],
    loading: isLoading,
    hasMore: data?.hasMore || false,
    totalCount: data?.totalCount || 0,
    error,
    addEntry: (entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>) => 
      new Promise((resolve, reject) => {
        addEntry.mutate(entry, {
          onSuccess: resolve,
          onError: reject,
        });
      }),
    updateEntry: async (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>>) => 
      new Promise((resolve, reject) => {
        updateEntry.mutate({ id, updates }, {
          onSuccess: resolve,
          onError: reject,
        });
      }),
    deleteEntry: async (id: string) => 
      new Promise<void>((resolve, reject) => {
        deleteEntry.mutate(id, {
          onSuccess: () => resolve(),
          onError: reject,
        });
      }),
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.journal.list(userId || user?.id || '') }),
  };
};
