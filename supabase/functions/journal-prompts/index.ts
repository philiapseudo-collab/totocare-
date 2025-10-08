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
    const { pregnancyWeek, infantAgeMonths, entryType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const context = pregnancyWeek 
      ? `pregnancy at week ${pregnancyWeek}`
      : infantAgeMonths !== null 
      ? `infant at ${infantAgeMonths} months old`
      : 'general maternal health';

    const prompt = `Generate 3 thoughtful, reflective journal prompts for a mother tracking their ${context}. Entry type: ${entryType || 'general'}.
Make prompts specific to this stage, encouraging emotional reflection, milestone tracking, or health observations. Each prompt should be a question, under 15 words.`;

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
            content: "You are a supportive maternal health companion. Create meaningful, stage-appropriate journal prompts."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate prompts");
    }

    const data = await response.json();
    const prompts = data.choices[0].message.content
      .split('\n')
      .filter((line: string) => line.trim() && line.includes('?'))
      .map((line: string) => line.replace(/^[-•*\d.]\s*/, '').trim())
      .slice(0, 3);

    return new Response(JSON.stringify({ prompts }), {
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
