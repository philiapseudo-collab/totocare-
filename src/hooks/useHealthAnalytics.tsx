import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

interface UseHealthAnalyticsOptions {
  analysisType?: 'comprehensive' | 'pregnancy_progress' | 'infant_growth' | 'risk_assessment';
  useCache?: boolean;
  refreshInterval?: number;
}

export function useHealthAnalytics(
  patientId: string,
  options: UseHealthAnalyticsOptions = {}
) {
  const {
    analysisType = 'comprehensive',
    useCache = true,
    refreshInterval = 0,
  } = options;

  const queryKey = ['health-analytics', patientId, analysisType];

  const fetchAnalytics = async (): Promise<HealthAnalytics> => {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    const { data, error } = await supabase.functions.invoke('health-analytics', {
      body: {
        patientId,
        analysisType,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to fetch analytics');
    }

    return data.data;
  };

  const query = useQuery({
    queryKey,
    queryFn: fetchAnalytics,
    enabled: !!patientId,
    staleTime: useCache ? 5 * 60 * 1000 : 0, // 5 minutes if cache enabled
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    retry: 2,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    isStale: query.isStale,
  };
}
