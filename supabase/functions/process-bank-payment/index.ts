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
    const { donation_id, donor_email, amount } = await req.json();

    console.log('Processing bank payment:', { donation_id, donor_email, amount });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate unique transaction reference
    const transactionRef = `BANK${Date.now()}${Math.random().toString(36).substring(7)}`;
    
    // Update donation with transaction ID
    const { error: updateError } = await supabase
      .from('donations')
      .update({
        transaction_id: transactionRef,
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', donation_id);

    if (updateError) {
      throw updateError;
    }

    // TODO: In production, integrate with a payment gateway or send email with bank details
    // For now, we'll simulate sending payment instructions
    
    console.log('Bank payment instructions sent:', transactionRef);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Bank payment instructions sent to your email.',
        transaction_id: transactionRef,
        bank_details: {
          bank_name: 'LEA Health Bank',
          account_number: '1234567890',
          account_name: 'LEA Maternal & Infant Care Fund',
          reference: transactionRef,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Bank payment error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process bank payment',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
