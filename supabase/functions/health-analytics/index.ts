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

// Helper: Calculate weight gain from clinic visits
const calculateWeightGain = (visits: any[]): number => {
  if (!visits || visits.length < 2) return 0;
  const weights = visits.filter(v => v.weight).map(v => parseFloat(v.weight)).sort();
  if (weights.length < 2) return 0;
  return weights[weights.length - 1] - weights[0];
};

// Helper: Analyze blood pressure trend
const analyzeBPTrend = (visits: any[]): string => {
  if (!visits || visits.length === 0) return 'no_data';
  
  const bpReadings = visits
    .filter(v => v.blood_pressure)
    .map(v => {
      const [systolic, diastolic] = v.blood_pressure.split('/').map(Number);
      return { systolic, diastolic };
    });
  
  if (bpReadings.length === 0) return 'no_data';
  
  const avgSystolic = bpReadings.reduce((sum, r) => sum + r.systolic, 0) / bpReadings.length;
  const avgDiastolic = bpReadings.reduce((sum, r) => sum + r.diastolic, 0) / bpReadings.length;
  
  if (avgSystolic > 140 || avgDiastolic > 90) return 'high';
  if (avgSystolic < 90 || avgDiastolic < 60) return 'low';
  return 'normal';
};

// Helper: Identify risk factors from conditions
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

// Helper: Get upcoming milestones based on pregnancy week
const getUpcomingMilestones = (currentWeek: number): string[] => {
  const milestones = [
    { week: 12, text: 'First trimester complete' },
    { week: 20, text: 'Anatomy scan' },
    { week: 28, text: 'Third trimester begins' },
    { week: 32, text: 'Regular prenatal visits' },
    { week: 36, text: 'Weekly check-ups start' },
    { week: 40, text: 'Due date approaching' }
  ];
  
  return milestones
    .filter(m => m.week > currentWeek)
    .slice(0, 3)
    .map(m => `Week ${m.week}: ${m.text}`);
};


// Comprehensive analytics combining all health data
const generateComprehensiveAnalytics = async (supabase: any, patientId: string, pregnancyId?: string) => {
  try {
    // Fetch all relevant data
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
    
    return {
      pregnancy: pregnancy ? {
        currentWeek: pregnancy.current_week,
        dueDate: pregnancy.due_date,
        trimester: pregnancy.current_trimester,
        multiparity: pregnancy.multiparity_count || 0
      } : null,
      appointments: {
        total: appointments?.length || 0,
        upcoming: appointments?.filter((a: any) => a.status === 'scheduled' && new Date(a.appointment_date) > new Date()).length || 0,
        completed: appointments?.filter((a: any) => a.status === 'completed').length || 0
      },
      healthMetrics: {
        totalClinicVisits: clinicVisits?.length || 0,
        weightGain: calculateWeightGain(clinicVisits || []),
        bloodPressureTrend: analyzeBPTrend(clinicVisits || []),
        lastVisitDate: clinicVisits?.[0]?.visit_date || null
      },
      riskAssessment: {
        activeConditions: conditions?.length || 0,
        riskFactors: identifyRiskFactors(conditions || []),
        activeMedications: medications?.length || 0
      },
      upcomingCare: {
        pendingScreenings: screenings?.filter((s: any) => s.status === 'due').length || 0,
        dueVaccinations: vaccinations?.filter((v: any) => v.status === 'due').length || 0,
        nextMilestones: pregnancy ? getUpcomingMilestones(currentWeek) : []
      }
    };
  } catch (error) {
    console.error('Error generating comprehensive analytics:', error);
    throw error;
  }
};

const calculatePregnancyProgress = async (supabase: any, patientId: string) => {
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
  const currentWeek = conceptionDate 
    ? Math.floor((today.getTime() - conceptionDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
    : pregnancy.current_week || 0;
  
  let trimester: string = 'first';
  if (currentWeek >= 28) trimester = 'third';
  else if (currentWeek >= 14) trimester = 'second';

  return {
    daysUntilDue,
    currentWeek,
    trimester,
    dueDate: pregnancy.due_date,
    multiparity: pregnancy.multiparity_count || 0,
    upcomingMilestones: getUpcomingMilestones(currentWeek)
  };
};

const calculateInfantGrowth = async (supabase: any, patientId: string) => {
  // Get infant data for the mother
  const { data: infants, error } = await supabase
    .from('infants')
    .select('*')
    .eq('mother_id', patientId)
    .order('birth_date', { ascending: false });

  if (error || !infants || infants.length === 0) {
    return { error: 'No infant data found' };
  }

  const infant = infants[0]; // Most recent infant
  const birthDate = new Date(infant.birth_date);
  const today = new Date();
  const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const ageInWeeks = Math.floor(ageInDays / 7);
  const ageInMonths = Math.floor(ageInDays / 30.44); // Average month length

  // Growth calculations
  const weightGain = infant.current_weight && infant.birth_weight 
    ? infant.current_weight - infant.birth_weight 
    : null;
  
  const heightGain = infant.current_height && infant.birth_height
    ? infant.current_height - infant.birth_height
    : null;

  // Determine next milestones based on age
  const milestones = [];
  if (ageInWeeks < 6) milestones.push('First smile');
  if (ageInWeeks < 16) milestones.push('Rolling over');
  if (ageInMonths < 6) milestones.push('Sitting up');
  if (ageInMonths < 10) milestones.push('Crawling');
  if (ageInMonths < 12) milestones.push('First steps');

  return {
    ageInDays,
    ageInWeeks,
    ageInMonths,
    currentWeight: infant.current_weight,
    currentHeight: infant.current_height,
    weightGain,
    heightGain,
    upcomingMilestones: milestones
  };
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