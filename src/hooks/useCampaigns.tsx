import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  category: 'maternal' | 'infant' | 'femalehood';
  classification: 'government' | 'ngo' | 'private';
  condition_type: string;
  target_amount: number;
  current_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('campaigns-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns'
        },
        () => {
          fetchCampaigns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns((data as Campaign[]) || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  return { campaigns, loading };
};
