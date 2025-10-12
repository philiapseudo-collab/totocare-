import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsRequest {
  patientId: string;
  pregnancyId?: string;
  analysisType: 'pregnancy_progress' | 'infant_growth' | 'health_trends' | 'risk_assessment' | 'comprehensive';
  dateRange?: {
    start: string;
    end: string;
  };
}

// ============= ANALYTICS CACHE CLASS =============
class AnalyticsCache {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  private ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const analyticsCache = new AnalyticsCache(5);

// ============= HELPER FUNCTIONS =============
const calculateWeightGain = (visits: any[]): number => {
  if (!visits || visits.length < 2) return 0;
  const weights = visits.filter(v => v.weight).map(v => parseFloat(v.weight)).sort();
  if (weights.length < 2) return 0;
  return weights[weights.length - 1] - weights[0];
};

const analyzeBPTrend = (visits: any[]): { status: string; average: { systolic: number; diastolic: number } | null; trend: string } => {
  if (!visits || visits.length === 0) {
    return { status: 'no_data', average: null, trend: 'unknown' };
  }
  
  const bpReadings = visits
    .filter(v => v.blood_pressure)
    .map(v => {
      const [systolic, diastolic] = v.blood_pressure.split('/').map(Number);
      return { systolic, diastolic };
    });
  
  if (bpReadings.length === 0) {
    return { status: 'no_data', average: null, trend: 'unknown' };
  }
  
  const avgSystolic = bpReadings.reduce((sum, r) => sum + r.systolic, 0) / bpReadings.length;
  const avgDiastolic = bpReadings.reduce((sum, r) => sum + r.diastolic, 0) / bpReadings.length;
  
  let status = 'normal';
  if (avgSystolic > 140 || avgDiastolic > 90) status = 'high';
  else if (avgSystolic < 90 || avgDiastolic < 60) status = 'low';
  
  let trend = 'stable';
  if (bpReadings.length >= 3) {
    const recent = bpReadings.slice(-3);
    const firstAvg = (recent[0].systolic + recent[0].diastolic) / 2;
    const lastAvg = (recent[recent.length - 1].systolic + recent[recent.length - 1].diastolic) / 2;
    if (lastAvg > firstAvg + 5) trend = 'increasing';
    else if (lastAvg < firstAvg - 5) trend = 'decreasing';
  }
  
  return {
    status,
    average: { systolic: Math.round(avgSystolic), diastolic: Math.round(avgDiastolic) },
    trend
  };
};

const calculateHealthScore = (metrics: {
  visitCount: number;
  activeConditions: number;
  bpStatus: string;
  medicationAdherence: number;
}): { score: number; grade: string; insights: string[] } => {
  let score = 100;
  const insights: string[] = [];
  
  if (metrics.visitCount < 3) {
    score -= 15;
    insights.push('Increase clinic visit frequency');
  }
  
  score -= metrics.activeConditions * 10;
  if (metrics.activeConditions > 0) {
    insights.push('Monitor active health conditions closely');
  }
  
  if (metrics.bpStatus === 'high') {
    score -= 20;
    insights.push('Blood pressure requires attention');
  } else if (metrics.bpStatus === 'low') {
    score -= 10;
  }
  
  score += metrics.medicationAdherence * 10;
  score = Math.max(0, Math.min(100, score));
  
  let grade = 'A';
  if (score < 90) grade = 'B';
  if (score < 80) grade = 'C';
  if (score < 70) grade = 'D';
  if (score < 60) grade = 'F';
  
  return { score: Math.round(score), grade, insights };
};

const assessDataQuality = (data: {
  lastVisitDate?: string;
  visitCount: number;
  measurementCount: number;
}): { completeness: number; recency: number; consistency: number } => {
  const completeness = Math.min(100, (data.measurementCount / 10) * 100);
  
  let recency = 0;
  if (data.lastVisitDate) {
    const daysSinceVisit = Math.floor(
      (Date.now() - new Date(data.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceVisit <= 30) recency = 100;
    else if (daysSinceVisit <= 60) recency = 70;
    else if (daysSinceVisit <= 90) recency = 40;
    else recency = 20;
  }
  
  const consistency = data.visitCount >= 3 ? 100 : (data.visitCount / 3) * 100;
  
  return {
    completeness: Math.round(completeness),
    recency: Math.round(recency),
    consistency: Math.round(consistency)
  };
};

const identifyRiskFactors = (conditions: any[]): string[] => {
  if (!conditions) return [];
  
  const highRiskConditions = [
    'gestational diabetes',
    'preeclampsia',
    'hypertension',
    'placenta previa',
    'anemia',
    'thyroid disorder'
  ];
  
  return conditions
    .filter(c => c.is_active)
    .filter(c => highRiskConditions.some(risk => 
      c.condition_name.toLowerCase().includes(risk.toLowerCase())
    ))
    .map(c => c.condition_name);
};

// ============= PREGNANCY ANALYTICS CLASS =============
class PregnancyAnalytics {
  calculateGestationalAge(conceptionDate: Date | null, lmpDate?: Date): { weeks: number; days: number } {
    const referenceDate = conceptionDate || lmpDate;
    if (!referenceDate) return { weeks: 0, days: 0 };
    
    const today = new Date();
    const diffMs = today.getTime() - new Date(referenceDate).getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return {
      weeks: Math.floor(totalDays / 7),
      days: totalDays % 7
    };
  }

  calculateTrimester(weeks: number): string {
    if (weeks < 14) return 'first';
    if (weeks < 28) return 'second';
    return 'third';
  }

  getExpectedWeightGain(weeks: number, prePregnancyBMI?: number): { min: number; max: number; current: number } {
    let minGain = 0, maxGain = 0;
    
    if (!prePregnancyBMI || prePregnancyBMI < 18.5) {
      minGain = weeks * 0.44;
      maxGain = weeks * 0.63;
    } else if (prePregnancyBMI < 25) {
      minGain = weeks * 0.39;
      maxGain = weeks * 0.55;
    } else if (prePregnancyBMI < 30) {
      minGain = weeks * 0.23;
      maxGain = weeks * 0.39;
    } else {
      minGain = weeks * 0.17;
      maxGain = weeks * 0.31;
    }
    
    return {
      min: Math.round(minGain * 10) / 10,
      max: Math.round(maxGain * 10) / 10,
      current: weeks
    };
  }

  getNextMilestones(currentWeek: number): string[] {
    const milestones = [
      { week: 12, text: 'First trimester complete - Major organs formed' },
      { week: 20, text: 'Anatomy scan - Gender may be visible' },
      { week: 24, text: 'Viability milestone' },
      { week: 28, text: 'Third trimester begins' },
      { week: 32, text: 'Weekly monitoring recommended' },
      { week: 36, text: 'Full term approaching' },
      { week: 40, text: 'Due date' }
    ];
    
    return milestones
      .filter(m => m.week > currentWeek)
      .slice(0, 3)
      .map(m => `Week ${m.week}: ${m.text}`);
  }

  assessRiskLevel(data: {
    age?: number;
    conditions: any[];
    multiparityCount?: number;
    bpStatus: string;
    weightGain?: number;
  }): { level: string; score: number; factors: string[] } {
    let riskScore = 0;
    const factors: string[] = [];
    
    if (data.age && (data.age < 18 || data.age > 35)) {
      riskScore += 15;
      factors.push(data.age < 18 ? 'Teenage pregnancy' : 'Advanced maternal age');
    }
    
    const highRiskConditions = identifyRiskFactors(data.conditions);
    riskScore += highRiskConditions.length * 20;
    factors.push(...highRiskConditions);
    
    if (data.multiparityCount && data.multiparityCount > 4) {
      riskScore += 15;
      factors.push('Grand multiparity');
    }
    
    if (data.bpStatus === 'high') {
      riskScore += 25;
      factors.push('Elevated blood pressure');
    }
    
    let level = 'low';
    if (riskScore >= 40) level = 'high';
    else if (riskScore >= 20) level = 'moderate';
    
    return { level, score: riskScore, factors };
  }
}

// ============= INFANT ANALYTICS CLASS =============
class InfantAnalytics {
  calculateAgeMetrics(birthDate: Date): { days: number; weeks: number; months: number } {
    const today = new Date();
    const diffMs = today.getTime() - new Date(birthDate).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return {
      days,
      weeks: Math.floor(days / 7),
      months: Math.floor(days / 30.44)
    };
  }

  getExpectedMilestones(ageMonths: number): string[] {
    const milestones: Record<number, string[]> = {
      0: ['First smile', 'Tracks objects with eyes'],
      1: ['Lifts head briefly', 'Responds to sounds'],
      2: ['Holds head steady', 'Coos and babbles'],
      3: ['Reaches for toys', 'Rolls over'],
      4: ['Sits with support', 'Laughs'],
      6: ['Sits without support', 'Babbles consonants'],
      9: ['Crawls', 'Points at objects'],
      12: ['First steps', 'Says first words'],
      18: ['Runs', 'Uses spoon'],
      24: ['Jumps', 'Two-word phrases']
    };
    
    return milestones[ageMonths] || [];
  }

  assessGrowthPercentile(data: {
    currentWeight?: number;
    currentHeight?: number;
    birthWeight?: number;
    ageMonths: number;
    gender?: string;
  }): { weightStatus: string; heightStatus: string; trend: string } {
    let weightStatus = 'normal';
    let heightStatus = 'normal';
    
    if (data.currentWeight && data.birthWeight) {
      const expectedGain = data.ageMonths * 0.6;
      const actualGain = data.currentWeight - data.birthWeight;
      
      if (actualGain < expectedGain * 0.8) weightStatus = 'below_average';
      else if (actualGain > expectedGain * 1.2) weightStatus = 'above_average';
    }
    
    return {
      weightStatus,
      heightStatus,
      trend: 'stable'
    };
  }

  getVaccinationSchedule(ageMonths: number): Array<{ vaccine: string; dueAge: string; status: string }> {
    const schedule = [
      { vaccine: 'BCG', dueAge: 'At birth', ageMonths: 0 },
      { vaccine: 'OPV 0', dueAge: 'At birth', ageMonths: 0 },
      { vaccine: 'Pentavalent 1', dueAge: '6 weeks', ageMonths: 1.5 },
      { vaccine: 'Pentavalent 2', dueAge: '10 weeks', ageMonths: 2.5 },
      { vaccine: 'Pentavalent 3', dueAge: '14 weeks', ageMonths: 3.5 },
      { vaccine: 'Measles 1', dueAge: '9 months', ageMonths: 9 },
      { vaccine: 'Measles 2', dueAge: '18 months', ageMonths: 18 }
    ];
    
    return schedule
      .filter(v => v.ageMonths <= ageMonths + 3)
      .map(v => ({
        vaccine: v.vaccine,
        dueAge: v.dueAge,
        status: ageMonths >= v.ageMonths ? 'due' : 'upcoming'
      }));
  }
}


// ============= MAIN ANALYTICS FUNCTIONS =============
const generateComprehensiveAnalytics = async (supabase: any, patientId: string, pregnancyId?: string) => {
  const cacheKey = `comprehensive_${patientId}`;
  const cached = analyticsCache.get(cacheKey);
  if (cached) return cached;

  try {
    const pregnancyAnalytics = new PregnancyAnalytics();
    const infantAnalytics = new InfantAnalytics();

    const [
      { data: pregnancy },
      { data: appointments },
      { data: clinicVisits },
      { data: conditions },
      { data: screenings },
      { data: vaccinations },
      { data: medications }
    ] = await Promise.all([
      supabase.from('pregnancies').select('*').eq('mother_id', patientId).eq('status', 'pregnant').maybeSingle(),
      supabase.from('appointments').select('*').eq('patient_id', patientId).order('appointment_date', { ascending: false }).limit(10),
      supabase.from('clinic_visits').select('*').eq('patient_id', patientId).order('visit_date', { ascending: false }).limit(10),
      supabase.from('conditions').select('*').eq('patient_id', patientId).eq('is_active', true),
      supabase.from('screenings').select('*').eq('patient_id', patientId).order('scheduled_date', { ascending: false }),
      supabase.from('vaccinations').select('*').eq('patient_id', patientId).order('scheduled_date', { ascending: false }),
      supabase.from('medications').select('*').eq('patient_id', patientId).eq('is_active', true)
    ]);

    const currentWeek = pregnancy?.current_week || 0;
    const bpAnalysis = analyzeBPTrend(clinicVisits || []);
    const riskAssessment = pregnancy ? pregnancyAnalytics.assessRiskLevel({
      conditions: conditions || [],
      multiparityCount: pregnancy.multiparity_count,
      bpStatus: bpAnalysis.status
    }) : null;

    const healthScore = calculateHealthScore({
      visitCount: clinicVisits?.length || 0,
      activeConditions: conditions?.length || 0,
      bpStatus: bpAnalysis.status,
      medicationAdherence: 0.8
    });

    const dataQuality = assessDataQuality({
      lastVisitDate: clinicVisits?.[0]?.visit_date,
      visitCount: clinicVisits?.length || 0,
      measurementCount: (clinicVisits?.length || 0) * 2
    });

    const result = {
      pregnancy: pregnancy ? {
        currentWeek: pregnancy.current_week,
        dueDate: pregnancy.due_date,
        trimester: pregnancyAnalytics.calculateTrimester(currentWeek),
        multiparity: pregnancy.multiparity_count || 0,
        nextMilestones: pregnancyAnalytics.getNextMilestones(currentWeek)
      } : null,
      appointments: {
        total: appointments?.length || 0,
        upcoming: appointments?.filter((a: any) => a.status === 'scheduled' && new Date(a.appointment_date) > new Date()).length || 0,
        completed: appointments?.filter((a: any) => a.status === 'completed').length || 0
      },
      healthMetrics: {
        totalClinicVisits: clinicVisits?.length || 0,
        weightGain: calculateWeightGain(clinicVisits || []),
        bloodPressure: bpAnalysis,
        lastVisitDate: clinicVisits?.[0]?.visit_date || null,
        healthScore
      },
      riskAssessment: riskAssessment || {
        level: 'unknown',
        score: 0,
        factors: [],
        activeConditions: conditions?.length || 0,
        activeMedications: medications?.length || 0
      },
      upcomingCare: {
        pendingScreenings: screenings?.filter((s: any) => s.status === 'due').length || 0,
        dueVaccinations: vaccinations?.filter((v: any) => v.status === 'due').length || 0
      },
      dataQuality
    };

    analyticsCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error generating comprehensive analytics:', error);
    throw error;
  }
};

const calculatePregnancyProgress = async (supabase: any, patientId: string) => {
  const cacheKey = `pregnancy_${patientId}`;
  const cached = analyticsCache.get(cacheKey);
  if (cached) return cached;

  const pregnancyAnalytics = new PregnancyAnalytics();
  
  const { data: pregnancy, error } = await supabase
    .from('pregnancies')
    .select('*')
    .eq('mother_id', patientId)
    .eq('status', 'pregnant')
    .maybeSingle();

  if (error || !pregnancy) {
    return { error: 'No active pregnancy found' };
  }

  const dueDate = new Date(pregnancy.due_date);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const conceptionDate = pregnancy.conception_date ? new Date(pregnancy.conception_date) : null;
  const gestationalAge = pregnancyAnalytics.calculateGestationalAge(conceptionDate);
  const currentWeek = pregnancy.current_week || gestationalAge.weeks;
  const trimester = pregnancyAnalytics.calculateTrimester(currentWeek);

  const result = {
    daysUntilDue,
    currentWeek,
    currentDay: gestationalAge.days,
    trimester,
    dueDate: pregnancy.due_date,
    multiparity: pregnancy.multiparity_count || 0,
    upcomingMilestones: pregnancyAnalytics.getNextMilestones(currentWeek),
    expectedWeightGain: pregnancyAnalytics.getExpectedWeightGain(currentWeek)
  };

  analyticsCache.set(cacheKey, result);
  return result;
};

const calculateInfantGrowth = async (supabase: any, patientId: string) => {
  const cacheKey = `infant_${patientId}`;
  const cached = analyticsCache.get(cacheKey);
  if (cached) return cached;

  const infantAnalytics = new InfantAnalytics();

  const { data: infants, error } = await supabase
    .from('infants')
    .select('*')
    .eq('mother_id', patientId)
    .order('birth_date', { ascending: false });

  if (error || !infants || infants.length === 0) {
    return { error: 'No infant data found' };
  }

  const infant = infants[0];
  const ageMetrics = infantAnalytics.calculateAgeMetrics(new Date(infant.birth_date));
  const expectedMilestones = infantAnalytics.getExpectedMilestones(ageMetrics.months);
  const growthAssessment = infantAnalytics.assessGrowthPercentile({
    currentWeight: infant.current_weight,
    currentHeight: infant.current_height,
    birthWeight: infant.birth_weight,
    ageMonths: ageMetrics.months,
    gender: infant.gender
  });
  const vaccinationSchedule = infantAnalytics.getVaccinationSchedule(ageMetrics.months);

  const result = {
    ...ageMetrics,
    currentWeight: infant.current_weight,
    currentHeight: infant.current_height,
    birthWeight: infant.birth_weight,
    birthHeight: infant.birth_height,
    weightGain: infant.current_weight && infant.birth_weight 
      ? infant.current_weight - infant.birth_weight 
      : null,
    heightGain: infant.current_height && infant.birth_height
      ? infant.current_height - infant.birth_height
      : null,
    growthAssessment,
    upcomingMilestones: expectedMilestones,
    vaccinationSchedule
  };

  analyticsCache.set(cacheKey, result);
  return result;
};

const analyzeHealthTrends = async (supabase: any, patientId: string, dateRange?: { start: string; end: string }) => {
  const startDate = dateRange?.start || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = dateRange?.end || new Date().toISOString();

  // Get clinic visits in date range
  const { data: visits, error: visitsError } = await supabase
    .from('clinic_visits')
    .select('*')
    .eq('patient_id', patientId)
    .gte('visit_date', startDate)
    .lte('visit_date', endDate)
    .order('visit_date', { ascending: true });

  // Get conditions
  const { data: conditions, error: conditionsError } = await supabase
    .from('conditions')
    .select('*')
    .eq('patient_id', patientId)
    .eq('is_active', true);

  if (visitsError || conditionsError) {
    return { error: 'Error fetching health data' };
  }

  // Analyze weight trends
  const weightData = visits?.filter((v: any) => v.weight).map((v: any) => ({
    date: v.visit_date,
    weight: v.weight
  })) || [];

  // Blood pressure trends
  const bpData = visits?.filter((v: any) => v.blood_pressure).map((v: any) => ({
    date: v.visit_date,
    bloodPressure: v.blood_pressure
  })) || [];

  return {
    totalVisits: visits?.length || 0,
    activeConditions: conditions?.length || 0,
    weightTrend: weightData,
    bloodPressureTrend: bpData,
    conditions: conditions || []
  };
};

const assessRisk = async (supabase: any, patientId: string) => {
  // Get all relevant health data
  const { data: conditions } = await supabase
    .from('conditions')
    .select('*')
    .eq('patient_id', patientId)
    .eq('is_active', true);

  const { data: pregnancy } = await supabase
    .from('pregnancies')
    .select('*')
    .eq('mother_id', patientId)
    .eq('status', 'pregnant')
    .single();

  let riskLevel = 'low';
  const riskFactors = [];

  // Check for high-risk conditions
  const highRiskConditions = [
    'gestational diabetes',
    'hypertensive disorders',
    'preeclampsia',
    'severe anemia'
  ];

  conditions?.forEach((condition: any) => {
    if (highRiskConditions.some(risk => 
      condition.condition_name.toLowerCase().includes(risk.toLowerCase())
    )) {
      riskLevel = 'high';
      riskFactors.push(condition.condition_name);
    }
  });

  // Check pregnancy-related risks
  if (pregnancy) {
    if (pregnancy.multiparity_count && pregnancy.multiparity_count > 4) {
      riskLevel = 'moderate';
      riskFactors.push('Grand multiparity');
    }
  }

  return {
    riskLevel,
    riskFactors,
    totalConditions: conditions?.length || 0,
    recommendations: riskLevel === 'high' 
      ? ['Increased monitoring recommended', 'Consult specialist', 'More frequent visits']
      : riskLevel === 'moderate'
      ? ['Regular monitoring', 'Follow care plan']
      : ['Continue routine care']
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required", success: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication", success: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { patientId, pregnancyId, analysisType, dateRange }: AnalyticsRequest = await req.json();

    if (!patientId || !analysisType) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters", success: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validTypes = ['pregnancy_progress', 'infant_growth', 'health_trends', 'risk_assessment', 'comprehensive'];
    if (!validTypes.includes(analysisType)) {
      return new Response(
        JSON.stringify({ error: "Invalid analysis type", success: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;

    switch (analysisType) {
      case 'comprehensive':
        result = await generateComprehensiveAnalytics(supabase, patientId, pregnancyId);
        break;
      case 'pregnancy_progress':
        result = await calculatePregnancyProgress(supabase, patientId);
        break;
      case 'infant_growth':
        result = await calculateInfantGrowth(supabase, patientId);
        break;
      case 'health_trends':
        result = await analyzeHealthTrends(supabase, patientId, dateRange);
        break;
      case 'risk_assessment':
        result = await assessRisk(supabase, patientId);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid analysis type", success: false }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysisType,
        patientId,
        data: result
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in health-analytics function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Unable to generate analytics. Please try again later.",
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);