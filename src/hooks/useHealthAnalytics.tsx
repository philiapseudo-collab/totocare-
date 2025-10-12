import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

interface HealthAnalytics {
  pregnancy: {
    currentWeek: number;
    currentDay?: number;
    dueDate: string;
    trimester: string;
    multiparity: number;
    nextMilestones: string[];
    expectedWeightGain?: { min: number; max: number; current: number };
    daysUntilDue?: number;
  } | null;
  appointments: {
    total: number;
    upcoming: number;
    completed: number;
  };
  healthMetrics: {
    totalClinicVisits: number;
    weightGain: number;
    bloodPressure: {
      status: string;
      average: { systolic: number; diastolic: number } | null;
      trend: string;
    };
    lastVisitDate: string | null;
    healthScore: {
      score: number;
      grade: string;
      insights: string[];
    };
  };
  riskAssessment: {
    level: string;
    score: number;
    factors: string[];
    activeConditions: number;
    activeMedications: number;
  };
  upcomingCare: {
    pendingScreenings: number;
    dueVaccinations: number;
  };
  dataQuality: {
    completeness: number;
    recency: number;
    consistency: number;
  };
}

export function useHealthAnalytics() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [analytics, setAnalytics] = useState<HealthAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !profile?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('health-analytics', {
          body: {
            patientId: profile.id,
            analysisType: 'comprehensive'
          }
        });

        if (error) throw error;

        setAnalytics(data.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, profile?.id]);

  const refetch = async () => {
    if (!user || !profile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('health-analytics', {
        body: {
          patientId: profile.id,
          analysisType: 'comprehensive'
        }
      });

      if (error) throw error;

      setAnalytics(data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, error, refetch };
}
