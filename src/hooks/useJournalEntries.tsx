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

export const useJournalEntries = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
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
  }, [user]);

  return { entries, loading, addEntry, updateEntry, deleteEntry, refetch: fetchEntries };
};
