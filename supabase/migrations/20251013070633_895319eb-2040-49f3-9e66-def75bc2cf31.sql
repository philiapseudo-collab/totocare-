-- Fix the get_due_medication_reminders function with correct day mapping and timezone handling
DROP FUNCTION IF EXISTS public.get_due_medication_reminders(uuid);

CREATE OR REPLACE FUNCTION public.get_due_medication_reminders(user_profile_id uuid)
RETURNS TABLE (
  medication_id uuid,
  medication_name text,
  dosage text,
  reminder_time text,
  patient_type text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_dow integer;
  current_time_str text;
BEGIN
  -- Convert PostgreSQL DOW (0=Sun, 1=Mon...6=Sat) to app format (1=Mon...7=Sun)
  current_dow := CASE 
    WHEN EXTRACT(DOW FROM CURRENT_TIMESTAMP) = 0 THEN 7  -- Sunday
    ELSE EXTRACT(DOW FROM CURRENT_TIMESTAMP)::integer
  END;
  
  -- Get current time as HH:MI format for comparison
  current_time_str := TO_CHAR(CURRENT_TIMESTAMP, 'HH24:MI');
  
  RETURN QUERY
  SELECT DISTINCT
    m.id as medication_id,
    m.medication_name,
    m.dosage,
    rt->>'time' as reminder_time,
    CASE 
      WHEN m.patient_id = user_profile_id THEN 'mother'
      ELSE 'infant'
    END as patient_type
  FROM medications m,
  jsonb_array_elements(m.reminder_times) AS rt
  WHERE m.notification_enabled = true
    AND m.is_active = true
    AND m.start_date <= CURRENT_DATE
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
    AND (m.snooze_until IS NULL OR m.snooze_until < CURRENT_TIMESTAMP)
    AND (m.last_notified_at IS NULL OR m.last_notified_at < CURRENT_TIMESTAMP - INTERVAL '1 hour')
    AND (m.patient_id = user_profile_id OR m.patient_id IN (
      SELECT id FROM infants WHERE mother_id = user_profile_id
    ))
    -- Check if current day is in the scheduled days array
    AND current_dow = ANY(
      ARRAY(SELECT jsonb_array_elements_text(rt->'days')::integer)
    )
    -- Check if current time is within 5 minutes of scheduled time
    AND ABS(
      EXTRACT(EPOCH FROM (
        current_time_str::time - (rt->>'time')::time
      ))
    ) <= 300;
END;
$$;