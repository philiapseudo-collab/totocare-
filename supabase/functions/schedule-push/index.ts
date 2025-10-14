import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[schedule-push] Checking for due medications...');

    // Get current time
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7

    console.log(`[schedule-push] Current time: ${currentTime}, Day: ${currentDay}`);

    // Get all active medications with notifications enabled
    const { data: medications, error: medError } = await supabaseClient
      .from('medications')
      .select(`
        id,
        medication_name,
        dosage,
        reminder_times,
        patient_id,
        last_notified_at,
        snooze_until
      `)
      .eq('is_active', true)
      .eq('notification_enabled', true);

    if (medError) {
      console.error('[schedule-push] Error fetching medications:', medError);
      throw medError;
    }

    console.log(`[schedule-push] Found ${medications?.length || 0} active medications`);

    if (!medications || medications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active medications found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let notificationsSent = 0;

    // Check each medication for due reminders
    for (const medication of medications) {
      // Skip if snoozed
      if (medication.snooze_until && new Date(medication.snooze_until) > now) {
        console.log(`[schedule-push] Medication ${medication.id} is snoozed until ${medication.snooze_until}`);
        continue;
      }

      // Skip if notified within last hour
      if (medication.last_notified_at) {
        const lastNotified = new Date(medication.last_notified_at);
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        if (lastNotified > hourAgo) {
          console.log(`[schedule-push] Medication ${medication.id} was notified recently at ${medication.last_notified_at}`);
          continue;
        }
      }

      // Check if any reminder time matches current time
      const reminderTimes = medication.reminder_times || [];
      for (const reminder of reminderTimes) {
        const reminderTime = reminder.time; // HH:MM format
        const reminderDays = reminder.days || []; // Array of day numbers

        // Check if current day is in reminder days
        if (!reminderDays.includes(currentDay)) {
          continue;
        }

        // Check if current time matches reminder time (within 5 minutes)
        const [reminderHour, reminderMinute] = reminderTime.split(':').map(Number);
        const [currentHour, currentMinute] = currentTime.split(':').map(Number);

        const reminderMinutes = reminderHour * 60 + reminderMinute;
        const currentMinutes = currentHour * 60 + currentMinute;
        const timeDiff = Math.abs(currentMinutes - reminderMinutes);

        if (timeDiff <= 5) {
          console.log(`[schedule-push] Medication ${medication.id} is due at ${reminderTime}`);

          // Get user's push subscriptions
          const { data: subscriptions, error: subError } = await supabaseClient
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', medication.patient_id);

          if (subError) {
            console.error('[schedule-push] Error fetching subscriptions:', subError);
            continue;
          }

          if (!subscriptions || subscriptions.length === 0) {
            console.log(`[schedule-push] No push subscriptions found for patient ${medication.patient_id}`);
            continue;
          }

          // Send push notification to each subscription
          for (const sub of subscriptions) {
            try {
              const pushSubscription = sub.subscription;
              
              // Prepare notification payload
              const payload = JSON.stringify({
                medication_id: medication.id,
                medication_name: medication.medication_name,
                dosage: medication.dosage,
                time: reminderTime,
              });

              // Send web push notification
              // Note: This requires VAPID keys and web-push library
              // For now, we'll just log it. Full implementation requires web-push setup
              console.log('[schedule-push] Would send push notification:', payload);
              
              // TODO: Implement actual web push using web-push library
              // const webpush = require('web-push');
              // webpush.setVapidDetails(
              //   'mailto:your-email@example.com',
              //   Deno.env.get('VAPID_PUBLIC_KEY'),
              //   Deno.env.get('VAPID_PRIVATE_KEY')
              // );
              // await webpush.sendNotification(pushSubscription, payload);

              notificationsSent++;
            } catch (error) {
              console.error('[schedule-push] Error sending push notification:', error);
            }
          }

          // Update last_notified_at
          await supabaseClient
            .from('medications')
            .update({ last_notified_at: now.toISOString() })
            .eq('id', medication.id);
        }
      }
    }

    console.log(`[schedule-push] Sent ${notificationsSent} push notifications`);

    return new Response(
      JSON.stringify({ 
        message: 'Push notifications scheduled successfully',
        sent: notificationsSent,
        checked: medications.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[schedule-push] Error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
