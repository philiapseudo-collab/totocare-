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

    const prompt = `You are a maternal and infant health advisor. Generate 3-4 concise, actionable health insights based on this data:
${pregnancyWeek ? `- Pregnancy: Week ${pregnancyWeek}` : ''}
${infantAgeMonths !== null && infantAgeMonths !== undefined ? `- Infant age: ${infantAgeMonths} months` : ''}
${recentConditions?.length ? `- Active conditions: ${recentConditions.join(', ')}` : ''}
${upcomingEvents?.length ? `- Upcoming: ${upcomingEvents.join(', ')}` : ''}

Provide practical, personalized tips focusing on current stage, nutrition, exercise, or important milestones. Keep each insight under 20 words.`;

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
            content: "You are a maternal and infant health expert. Provide clear, evidence-based health insights in a warm, supportive tone."
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
