import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  userId: string;
  type: 'appointment' | 'vaccination' | 'screening' | 'general';
  title: string;
  message: string;
  scheduledFor?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { userId, type, title, message, scheduledFor }: NotificationRequest = await req.json();

    console.log(`Sending ${type} notification to user ${userId}:`, title);

    // Get user profile for contact information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, phone')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    // Log notification (in production, integrate with email/SMS service)
    const notificationLog = {
      user_id: userId,
      type,
      title,
      message,
      status: 'sent',
      sent_at: scheduledFor || new Date().toISOString(),
      recipient_name: `${profile.first_name} ${profile.last_name}`,
      recipient_phone: profile.phone,
    };

    console.log('Notification details:', notificationLog);

    // TODO: Integrate with actual notification service (Resend, Twilio, etc.)
    // For now, we're just logging

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully',
        details: notificationLog,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
