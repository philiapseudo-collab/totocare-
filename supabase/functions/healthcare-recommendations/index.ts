import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendationRequest {
  patientId?: string;
  infantId?: string;
  gestationalWeek?: number;
  infantAgeMonths?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { patientId, infantId, gestationalWeek, infantAgeMonths }: RecommendationRequest = await req.json();

    const recommendations: any = {
      antenatalVisits: [],
      vaccinations: [],
      dangerSigns: [],
      nutritionGuidelines: [],
      growthMilestones: [],
      healthTopics: [],
    };

    // Fetch antenatal visit recommendations based on gestational week
    if (gestationalWeek) {
      const { data: visits } = await supabase
        .from('antenatal_visit_schedule')
        .select('*')
        .lte('gestational_week_min', gestationalWeek)
        .or(`gestational_week_max.gte.${gestationalWeek},gestational_week_max.is.null`)
        .order('visit_number', { ascending: true });

      recommendations.antenatalVisits = visits || [];

      // Fetch relevant danger signs for pregnant mothers
      const { data: pregDangerSigns } = await supabase
        .from('danger_signs')
        .select('*')
        .eq('patient_type', 'pregnant_mother')
        .order('severity', { ascending: false });

      recommendations.dangerSigns.push(...(pregDangerSigns || []));

      // Fetch nutrition guidelines for pregnant mothers
      const { data: nutrition } = await supabase
        .from('nutrition_guidelines')
        .select('*')
        .eq('target_group', 'pregnant_mother');

      recommendations.nutritionGuidelines.push(...(nutrition || []));

      // Fetch relevant healthcare topics
      const { data: topics } = await supabase
        .from('healthcare_topics')
        .select('*')
        .eq('category', 'antenatal_care')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      recommendations.healthTopics.push(...(topics || []));
    }

    // Fetch infant-related recommendations
    if (infantAgeMonths !== undefined) {
      // Fetch vaccination schedule
      const { data: vaccines } = await supabase
        .from('immunization_schedule')
        .select('*')
        .eq('patient_type', 'infant')
        .lte('age_months', infantAgeMonths + 3) // Next 3 months
        .gte('age_months', infantAgeMonths)
        .order('age_months', { ascending: true });

      recommendations.vaccinations = vaccines || [];

      // Fetch growth milestones
      const { data: milestones } = await supabase
        .from('growth_milestones')
        .select('*')
        .lte('age_months', infantAgeMonths + 2)
        .gte('age_months', Math.max(0, infantAgeMonths - 1))
        .order('age_months', { ascending: true });

      recommendations.growthMilestones = milestones || [];

      // Fetch infant danger signs
      const { data: infantDangerSigns } = await supabase
        .from('danger_signs')
        .select('*')
        .in('patient_type', ['newborn', 'infant'])
        .order('severity', { ascending: false });

      recommendations.dangerSigns.push(...(infantDangerSigns || []));

      // Fetch nutrition guidelines for infants
      let nutritionTarget = 'infant_0_6m';
      if (infantAgeMonths >= 6 && infantAgeMonths < 12) {
        nutritionTarget = 'infant_6_12m';
      } else if (infantAgeMonths >= 12) {
        nutritionTarget = 'child_1_2y';
      }

      const { data: infantNutrition } = await supabase
        .from('nutrition_guidelines')
        .select('*')
        .eq('target_group', nutritionTarget);

      recommendations.nutritionGuidelines.push(...(infantNutrition || []));

      // Fetch relevant healthcare topics
      const { data: infantTopics } = await supabase
        .from('healthcare_topics')
        .select('*')
        .eq('category', 'infant_care')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      recommendations.healthTopics.push(...(infantTopics || []));
    }

    // Remove duplicates from danger signs
    recommendations.dangerSigns = Array.from(
      new Map(recommendations.dangerSigns.map((item: any) => [item.id, item])).values()
    );

    return new Response(JSON.stringify(recommendations), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
