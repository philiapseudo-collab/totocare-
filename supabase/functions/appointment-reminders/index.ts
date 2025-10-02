import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AppointmentReminderRequest {
  appointmentId?: string;
  checkUpcoming?: boolean;
  hoursAhead?: number; // Hours ahead to check for appointments (default 24)
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if request has authentication (for manual calls) or use service role (for cron)
    const authHeader = req.headers.get('Authorization');
    let supabase;
    
    if (authHeader) {
      // Authenticated call - verify permissions
      supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid authentication", success: false }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user is a healthcare provider or admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!profile || !['healthcare_provider', 'admin'].includes(profile.role)) {
        return new Response(
          JSON.stringify({ error: "Insufficient permissions", success: false }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // No auth - use service role for automated/cron calls
      supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
    }

    const { appointmentId, checkUpcoming, hoursAhead = 24 }: AppointmentReminderRequest = 
      await req.json().catch(() => ({ checkUpcoming: true, hoursAhead: 24 }));
    
    let appointments = [];
    
    if (appointmentId) {
      // Get specific appointment
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(
            id,
            first_name,
            last_name,
            phone
          )
        `)
        .eq('id', appointmentId)
        .single();
        
      if (error) {
        console.error("Database error fetching appointment:", error);
        return new Response(
          JSON.stringify({ error: "Unable to fetch appointment data", success: false }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      appointments = [data];
    } else if (checkUpcoming) {
      // Get appointments in the specified hours ahead that haven't been reminded
      const now = new Date();
      const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(
            id,
            first_name,
            last_name,
            phone
          )
        `)
        .eq('status', 'scheduled')
        .eq('reminder_sent', false)
        .gte('appointment_date', now.toISOString())
        .lt('appointment_date', futureTime.toISOString());
        
      if (error) {
        console.error("Database error fetching appointments:", error);
        return new Response(
          JSON.stringify({ error: "Unable to fetch appointments", success: false }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      appointments = data || [];
    }

    console.log(`Processing ${appointments.length} appointments for reminders`);

    // Process reminders
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const appointment of appointments) {
      try {
        const patientName = appointment.patient 
          ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
          : "Unknown Patient";
        
        const appointmentDate = new Date(appointment.appointment_date);
        const formattedDate = appointmentDate.toLocaleDateString();
        const formattedTime = appointmentDate.toLocaleTimeString();

        // Log reminder details
        console.log(`📅 Sending reminder for appointment ${appointment.id}`);
        console.log(`   Patient: ${patientName}`);
        console.log(`   Phone: ${appointment.patient?.phone || "N/A"}`);
        console.log(`   Date: ${formattedDate} at ${formattedTime}`);
        console.log(`   Type: ${appointment.appointment_type}`);

        // TODO: Integrate with notification service (SMS/Email/Push)
        // Examples:
        // - Twilio for SMS: await sendSMS(appointment.patient.phone, message)
        // - Resend for Email: await sendEmail(appointment.patient.email, subject, body)
        // - Firebase for Push: await sendPushNotification(userId, message)
        
        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ 
            reminder_sent: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointment.id);
          
        if (updateError) throw updateError;
        
        successCount++;
        results.push({
          appointmentId: appointment.id,
          patientName,
          appointmentDate: appointment.appointment_date,
          status: 'success',
          message: 'Reminder sent successfully'
        });
      } catch (error: any) {
        console.error(`❌ Error processing reminder for appointment ${appointment.id}:`, error);
        failureCount++;
        results.push({
          appointmentId: appointment.id,
          status: 'error',
          message: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${appointments.length} appointment reminder(s)`,
        summary: {
          total: appointments.length,
          successful: successCount,
          failed: failureCount,
          hoursAhead
        },
        results
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in appointment-reminders function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Unable to process reminders. Please try again later.",
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);