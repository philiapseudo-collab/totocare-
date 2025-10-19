import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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

export const useJournalEntries = (page: number = 0) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEntries = async () => {
    if (!user) return;
    
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Get total count
      const { count } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      // Fetch page data with only required columns
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, entry_type, title, content, who, entry_date, tags, created_at, updated_at')
        .order('entry_date', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setEntries(data || []);
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (error: any) {
      toast.error('Failed to load journal entries');
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      toast.error('You must be logged in to add entries');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{
          user_id: user.id,
          ...entry
        }])
        .select()
        .single();

      if (error) throw error;
      
      setEntries(prev => [data, ...prev]);
      toast.success('Entry added successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to add entry');
      console.error('Error adding entry:', error);
      throw error;
    }
  };

  const updateEntry = async (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    if (!user) {
      toast.error('You must be logged in to update entries');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setEntries(prev => prev.map(entry => entry.id === id ? data : entry));
      toast.success('Entry updated successfully');
      return data;
    } catch (error: any) {
      toast.error('Failed to update entry');
      console.error('Error updating entry:', error);
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete entries');
      return;
    }

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEntries(prev => prev.filter(entry => entry.id !== id));
      toast.success('Entry deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete entry');
      console.error('Error deleting entry:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user, page]);

  return { 
    entries, 
    loading, 
    hasMore, 
    totalCount,
    addEntry, 
    updateEntry, 
    deleteEntry, 
    refetch: fetchEntries 
  };
};
