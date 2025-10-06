import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HealthcareTopic {
  id: string;
  category: string;
  title: string;
  subtitle: string | null;
  icon: string | null;
  order_index: number;
  is_active: boolean;
}

export interface HealthcareContent {
  id: string;
  topic_id: string;
  section_title: string;
  content_type: string;
  content: any;
  order_index: number;
}

export const useHealthcareTopics = (category?: string) => {
  const [topics, setTopics] = useState<HealthcareTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    try {
      let query = supabase
        .from('healthcare_topics')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTopics(data || []);
    } catch (error: any) {
      toast.error('Failed to load healthcare topics');
      console.error('Error fetching healthcare topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [category]);

  return { topics, loading, refetch: fetchTopics };
};

export const useHealthcareContent = (topicId?: string) => {
  const [content, setContent] = useState<HealthcareContent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    if (!topicId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('healthcare_content')
        .select('*')
        .eq('topic_id', topicId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setContent(data || []);
    } catch (error: any) {
      toast.error('Failed to load healthcare content');
      console.error('Error fetching healthcare content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [topicId]);

  return { content, loading, refetch: fetchContent };
};
