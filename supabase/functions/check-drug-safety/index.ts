import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drugName } = await req.json();
    console.log('Checking drug safety for:', drugName);

    if (!drugName || drugName.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Drug name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a medication safety advisor for pregnant mothers. Analyze the drug or substance provided and return information in the following JSON format:
{
  "category": "Prescription" | "Over-the-counter" | "Substance/abuse",
  "risk_level": "Low risk" | "Moderate caution" | "High risk",
  "alert_message": "A clear, friendly message about the safety of this drug during pregnancy"
}

Guidelines:
- Be clear and reassuring but honest about risks
- Keep messages concise (1-2 sentences)
- Always recommend consulting a healthcare professional for specific medical advice
- For substances like alcohol, tobacco, recreational drugs: Always mark as "High risk"
- For common OTC medications, be specific about trimester concerns
- If unsure about a drug, mark as "Moderate caution" and recommend professional consultation`;

    const userPrompt = `Analyze this drug/substance for pregnancy safety: ${drugName}`;

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
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    const result = JSON.parse(content);

    console.log('Drug safety analysis result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-drug-safety function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});