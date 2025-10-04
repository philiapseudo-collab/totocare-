import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalculationInput {
  gestationalWeeks?: number;
  gestationalDays?: number;
  lastMenstrualPeriod?: string;
  userId?: string;
}

interface CalculationResult {
  dueDate: string;
  daysRemaining: number;
  weeksRemaining: number;
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  percentageComplete: number;
  lastMenstrualPeriod: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gestationalWeeks, gestationalDays, lastMenstrualPeriod, userId }: CalculationInput = await req.json();

    console.log('Calculate due date request:', { gestationalWeeks, gestationalDays, lastMenstrualPeriod, userId });

    // Validation
    if (!lastMenstrualPeriod && (gestationalWeeks === undefined || gestationalWeeks === null)) {
      return new Response(
        JSON.stringify({ 
          error: 'Either lastMenstrualPeriod or gestationalWeeks must be provided' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate gestational age if provided
    if (gestationalWeeks !== undefined) {
      if (gestationalWeeks < 0 || gestationalWeeks > 42) {
        return new Response(
          JSON.stringify({ 
            error: 'Gestational weeks must be between 0 and 42' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (gestationalDays !== undefined && (gestationalDays < 0 || gestationalDays > 6)) {
        return new Response(
          JSON.stringify({ 
            error: 'Gestational days must be between 0 and 6' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let lmpDate: Date;
    let currentGestationalDays: number;
    let currentWeek: number;
    let currentDay: number;

    // Calculate based on input method
    if (lastMenstrualPeriod) {
      // Method 1: LMP date provided
      lmpDate = new Date(lastMenstrualPeriod);
      
      if (isNaN(lmpDate.getTime())) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid date format for lastMenstrualPeriod. Use ISO format (YYYY-MM-DD)' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      lmpDate.setHours(0, 0, 0, 0);
      
      // Calculate current gestational age from LMP
      const daysSinceLMP = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
      currentGestationalDays = daysSinceLMP;
      currentWeek = Math.floor(daysSinceLMP / 7);
      currentDay = daysSinceLMP % 7;
    } else {
      // Method 2: Gestational age provided
      const weeks = gestationalWeeks || 0;
      const days = gestationalDays || 0;
      
      currentWeek = weeks;
      currentDay = days;
      currentGestationalDays = (weeks * 7) + days;
      
      // Calculate LMP by going back from today
      lmpDate = new Date(today);
      lmpDate.setDate(lmpDate.getDate() - currentGestationalDays);
    }

    // Calculate due date (280 days from LMP)
    const TOTAL_PREGNANCY_DAYS = 280;
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + TOTAL_PREGNANCY_DAYS);

    // Calculate days remaining (40 weeks - current gestational age)
    const daysRemaining = Math.max(0, TOTAL_PREGNANCY_DAYS - currentGestationalDays);
    const weeksRemaining = Math.max(0, 40 - currentWeek);

    // Determine trimester
    let trimester: 1 | 2 | 3;
    if (currentWeek <= 13) {
      trimester = 1;
    } else if (currentWeek <= 27) {
      trimester = 2;
    } else {
      trimester = 3;
    }

    // Calculate percentage complete
    const percentageComplete = Math.min(100, Math.round((currentGestationalDays / TOTAL_PREGNANCY_DAYS) * 100));

    const result: CalculationResult = {
      dueDate: dueDate.toISOString().split('T')[0],
      daysRemaining,
      weeksRemaining,
      currentWeek,
      currentDay,
      trimester,
      percentageComplete,
      lastMenstrualPeriod: lmpDate.toISOString().split('T')[0],
    };

    console.log('Calculation result:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error calculating due date:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
