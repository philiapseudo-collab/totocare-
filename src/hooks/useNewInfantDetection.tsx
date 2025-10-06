import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

interface NewInfant {
  id: string;
  first_name: string;
  birth_date: string;
  gender: string | null;
  pregnancy_id: string | null;
}

export const useNewInfantDetection = () => {
  const [newInfants, setNewInfants] = useState<NewInfant[]>([]);
  const [hasNewInfants, setHasNewInfants] = useState(false);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    if (!profile?.id) return;

    checkForNewInfants();

    // Setup realtime listener for new infants
    const channel = supabase
      .channel('new-infants-detection')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'infants',
          filter: `mother_id=eq.${profile.id}`
        },
        (payload) => {
          console.log('New infant detected:', payload);
          checkForNewInfants();
          toast.info('A new baby profile has been created!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const checkForNewInfants = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      // Find infants with default name 'Baby' (indicating they need details filled in)
      const { data, error } = await supabase
        .from('infants')
        .select('*')
        .eq('mother_id', profile.id)
        .eq('first_name', 'Baby')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNewInfants(data || []);
      setHasNewInfants((data || []).length > 0);

      // Also trigger a manual delivery check when this page loads
      // This ensures we catch any deliveries that might have been missed
      await triggerDeliveryCheck();

    } catch (error) {
      console.error('Error checking for new infants:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerDeliveryCheck = async () => {
    try {
      const { data, error } = await supabase.rpc('trigger_delivery_check');
      
      if (error) {
        console.error('Error triggering delivery check:', error);
        return;
      }

      console.log('Delivery check result:', data);
      
      // Cast data to the expected type
      const result = data as { success: boolean; infants_created: number; checked_at: string } | null;
      
      if (result && result.infants_created > 0) {
        toast.success(`${result.infants_created} new baby profile(s) created!`);
        // Refresh the list
        await checkForNewInfants();
      }
    } catch (error) {
      console.error('Error in triggerDeliveryCheck:', error);
    }
  };

  const dismissInfant = async (infantId: string) => {
    setNewInfants(prev => prev.filter(i => i.id !== infantId));
    setHasNewInfants(newInfants.length > 1);
  };

  return {
    newInfants,
    hasNewInfants,
    loading,
    checkForNewInfants,
    dismissInfant,
    triggerDeliveryCheck
  };
};
