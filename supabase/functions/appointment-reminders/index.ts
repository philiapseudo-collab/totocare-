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
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId, checkUpcoming }: AppointmentReminderRequest = await req.json();
    
    let appointments = [];
    
    if (appointmentId) {
      // Get specific appointment
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(first_name, last_name),
          healthcare_provider:profiles!appointments_healthcare_provider_id_fkey(first_name, last_name)
        `)
        .eq('id', appointmentId)
        .single();
        
      if (error) throw error;
      appointments = [data];
    } else if (checkUpcoming) {
      // Get appointments for the next 24 hours that haven't been reminded
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(first_name, last_name),
          healthcare_provider:profiles!appointments_healthcare_provider_id_fkey(first_name, last_name)
        `)
        .eq('status', 'scheduled')
        .eq('reminder_sent', false)
        .lte('appointment_date', tomorrow.toISOString())
        .gte('appointment_date', new Date().toISOString());
        
      if (error) throw error;
      appointments = data || [];
    }

    console.log(`Processing ${appointments.length} appointments for reminders`);

    // Process reminders
    const results = [];
    for (const appointment of appointments) {
      try {
        // Here you would integrate with your notification service
        // For now, we'll just log and mark as sent
        console.log(`Reminder for appointment ${appointment.id}:`);
        console.log(`Patient: ${appointment.patient?.first_name} ${appointment.patient?.last_name}`);
        console.log(`Date: ${appointment.appointment_date}`);
        console.log(`Type: ${appointment.appointment_type}`);
        
        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', appointment.id);
          
        if (updateError) throw updateError;
        
        results.push({
          appointmentId: appointment.id,
          status: 'success',
          message: 'Reminder sent successfully'
        });
      } catch (error: any) {
        console.error(`Error processing reminder for appointment ${appointment.id}:`, error);
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
        processedCount: appointments.length,
        results: results
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
        error: error.message,
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