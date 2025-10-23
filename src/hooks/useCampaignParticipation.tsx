import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useCampaignParticipation = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const checkParticipation = async (campaignId: string) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('campaign_participants')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking participation:', error);
      return false;
    }
  };

  const registerForCampaign = async (campaignId: string) => {
    if (!user) {
      toast.error('Please sign in to register for campaigns');
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: campaignId,
          user_id: user.id,
          participation_status: 'registered'
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('You are already registered for this campaign');
          return false;
        }
        throw error;
      }

      toast.success('Successfully registered for campaign!');
      return true;
    } catch (error) {
      console.error('Error registering for campaign:', error);
      toast.error('Failed to register for campaign');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const withdrawFromCampaign = async (campaignId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('campaign_participants')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Withdrawn from campaign');
      return true;
    } catch (error) {
      console.error('Error withdrawing from campaign:', error);
      toast.error('Failed to withdraw from campaign');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getParticipantCount = async (campaignId: string) => {
    try {
      const { count, error } = await supabase
        .from('campaign_participants')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting participant count:', error);
      return 0;
    }
  };

  return {
    loading,
    checkParticipation,
    registerForCampaign,
    withdrawFromCampaign,
    getParticipantCount
  };
};
