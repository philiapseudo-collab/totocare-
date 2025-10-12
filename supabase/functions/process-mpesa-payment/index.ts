import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { donation_id, phone_number, amount } = await req.json();

    console.log('Processing M-Pesa payment:', { donation_id, phone_number, amount });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // TODO: Integrate with M-Pesa Daraja API (STK Push)
    // For now, this is a placeholder that simulates the payment initiation
    // In production, you would:
    // 1. Get M-Pesa credentials from secrets
    // 2. Generate access token from M-Pesa API
    // 3. Initiate STK Push request
    // 4. Handle the callback webhook
    // 5. Update donation status based on callback

    // Simulate STK Push initiation
    const mpesaTransactionId = `MPX${Date.now()}${Math.random().toString(36).substring(7)}`;
    
    // Update donation with transaction ID
    const { error: updateError } = await supabase
      .from('donations')
      .update({
        transaction_id: mpesaTransactionId,
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', donation_id);

    if (updateError) {
      throw updateError;
    }

    console.log('M-Pesa payment initiated successfully:', mpesaTransactionId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'M-Pesa payment initiated. Please check your phone.',
        transaction_id: mpesaTransactionId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('M-Pesa payment error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process M-Pesa payment',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
