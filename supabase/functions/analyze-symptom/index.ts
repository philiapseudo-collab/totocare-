import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptomDescription } = await req.json();

    if (!symptomDescription) {
      return new Response(
        JSON.stringify({ error: 'Symptom description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch danger signs from database for context
    const { data: dangerSigns } = await supabase
      .from('danger_signs')
      .select('*')
      .eq('patient_type', 'pregnant_mother')
      .order('severity', { ascending: false });

    const dangerSignsContext = dangerSigns?.map(sign => 
      `- ${sign.danger_sign} (${sign.severity}): ${sign.recommended_action}`
    ).join('\n') || '';

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a caring pregnancy health assistant. Your role is to analyze symptoms reported by pregnant mothers and provide guidance based on Kenya Ministry of Health guidelines.

IMPORTANT GUIDELINES:
- Be calm, caring, and reassuring in your tone
- Always start by acknowledging the mother's concern
- Classify symptoms into three categories:
  * normal: Common pregnancy symptoms that are typically not concerning
  * monitor: Symptoms that should be watched but may not need immediate action
  * urgent: Symptoms that require immediate medical attention
- Provide clear, actionable advice
- Always include the disclaimer that this is not a substitute for professional medical advice
- Reference specific danger signs from the database when relevant

DANGER SIGNS DATABASE (Kenya Ministry of Health):
${dangerSignsContext}

Your response should be in JSON format with these fields:
{
  "severity_level": "normal" | "monitor" | "urgent",
  "assessment": "Brief, reassuring statement about the symptom",
  "explanation": "Detailed explanation of why this symptom falls into this category",
  "recommendation": "Clear next steps for the mother"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this symptom: ${symptomDescription}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error('Failed to analyze symptom');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No analysis received from AI');
    }

    const analysis = JSON.parse(analysisText);

    return new Response(
      JSON.stringify({
        severity_level: analysis.severity_level,
        assessment: analysis.assessment,
        explanation: analysis.explanation,
        recommendation: analysis.recommendation
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-symptom function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
