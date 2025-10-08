import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pregnancyWeek, infantAgeMonths, recentConditions, upcomingEvents } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Medical reference data from Kenya Ministry of Health Mother & Child Health Handbook
    const medicalGuidelines = {
      dangerSignsMother: ["Heavy bleeding", "Fever", "Severe headache", "Foul vaginal discharge", "Fits/Convulsions"],
      dangerSignsBaby: ["Stops breastfeeding", "Fast/difficult breathing", "Hot or cold", "Less active", "Jaundice"],
      nutritionPregnancy: "Eat 5+ food groups daily, one extra meal, 7-12kg total weight gain",
      nutritionBreastfeeding: "Two extra small meals daily, exclusive breastfeeding 6 months",
      weightGain: {
        trimester1: "0.5kg/month",
        trimester2: "1-1.5kg/month",
        trimester3: "2-2.2kg/month"
      },
      ancSchedule: "8 visits during pregnancy at weeks 8, 12, 16, 20, 24, 28, 32, 36"
    };

    const context = [];
    if (pregnancyWeek) {
      context.push(`Pregnancy Week ${pregnancyWeek}`);
      if (pregnancyWeek <= 13) context.push("1st trimester - expect 0.5kg/month weight gain");
      else if (pregnancyWeek <= 26) context.push("2nd trimester - expect 1-1.5kg/month weight gain");
      else context.push("3rd trimester - expect 2-2.2kg/month weight gain");
    }
    if (infantAgeMonths !== null && infantAgeMonths !== undefined) {
      context.push(`Infant ${infantAgeMonths} months old`);
      if (infantAgeMonths < 6) context.push("Exclusive breastfeeding recommended");
    }
    if (recentConditions?.length) context.push(`Active conditions: ${recentConditions.join(', ')}`);
    if (upcomingEvents?.length) context.push(`Upcoming: ${upcomingEvents.join(', ')}`);

    const prompt = `Based on Kenya Ministry of Health guidelines, generate 3-4 actionable health insights for:
${context.join('\n')}

Reference Guidelines:
- Nutrition: ${pregnancyWeek ? medicalGuidelines.nutritionPregnancy : medicalGuidelines.nutritionBreastfeeding}
- ANC: ${medicalGuidelines.ancSchedule}
- Watch for danger signs: ${pregnancyWeek ? medicalGuidelines.dangerSignsMother.join(', ') : medicalGuidelines.dangerSignsBaby.join(', ')}

Provide practical, stage-specific tips on nutrition, exercise, danger signs to watch, or milestones. Each insight under 20 words.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a maternal and infant health expert following Kenya Ministry of Health guidelines. Provide clear, evidence-based health insights from the Mother & Child Health Handbook in a warm, supportive tone. Focus on practical advice mothers can act on immediately."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI gateway error:", response.status, error);
      throw new Error("Failed to generate insights");
    }

    const data = await response.json();
    const insights = data.choices[0].message.content
      .split('\n')
      .filter((line: string) => line.trim() && !line.match(/^\d+\./))
      .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
      .filter((line: string) => line.length > 0)
      .slice(0, 4);

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
