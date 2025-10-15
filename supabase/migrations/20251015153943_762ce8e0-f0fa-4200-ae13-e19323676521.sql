-- Add pre_notified_at field to track when pre-notifications were sent
ALTER TABLE public.medications 
ADD COLUMN IF NOT EXISTS pre_notified_at timestamp with time zone;

COMMENT ON COLUMN public.medications.pre_notified_at IS 'Timestamp when pre-notification was last sent';

-- Drop the old function first
DROP FUNCTION IF EXISTS public.get_due_medication_reminders(uuid);

-- Create the updated function with support for pre-notifications
CREATE FUNCTION public.get_due_medication_reminders(user_profile_id uuid)
RETURNS TABLE(medication_id uuid, medication_name text, dosage text, reminder_time text, patient_type text, is_pre_notification boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_dow integer;
  current_time_str text;
  current_timestamp_utc timestamptz;
BEGIN
  current_timestamp_utc := CURRENT_TIMESTAMP;
  
  -- Convert PostgreSQL DOW (0=Sun, 1=Mon...6=Sat) to app format (1=Mon...7=Sun)
  current_dow := CASE 
    WHEN EXTRACT(DOW FROM current_timestamp_utc) = 0 THEN 7  -- Sunday
    ELSE EXTRACT(DOW FROM current_timestamp_utc)::integer
  END;
  
  -- Get current time as HH:MI format for comparison
  current_time_str := TO_CHAR(current_timestamp_utc, 'HH24:MI');
  
  RETURN QUERY
  -- Regular notifications (at scheduled time)
  SELECT DISTINCT
    m.id as medication_id,
    m.medication_name,
    m.dosage,
    rt->>'time' as reminder_time,
    CASE 
      WHEN m.patient_id = user_profile_id THEN 'mother'
      ELSE 'infant'
    END as patient_type,
    false as is_pre_notification
  FROM medications m,
  jsonb_array_elements(m.reminder_times) AS rt
  WHERE m.notification_enabled = true
    AND m.is_active = true
    AND m.start_date <= CURRENT_DATE
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
    AND (m.snooze_until IS NULL OR m.snooze_until < current_timestamp_utc)
    AND (m.last_notified_at IS NULL OR m.last_notified_at < current_timestamp_utc - INTERVAL '1 hour')
    AND (m.patient_id = user_profile_id OR m.patient_id IN (
      SELECT id FROM infants WHERE mother_id = user_profile_id
    ))
    AND current_dow = ANY(
      ARRAY(SELECT jsonb_array_elements_text(rt->'days')::integer)
    )
    AND ABS(
      EXTRACT(EPOCH FROM (
        current_time_str::time - (rt->>'time')::time
      ))
    ) <= 300
  
  UNION ALL
  
  -- Pre-notifications (before scheduled time)
  SELECT DISTINCT
    m.id as medication_id,
    m.medication_name,
    m.dosage,
    rt->>'time' as reminder_time,
    CASE 
      WHEN m.patient_id = user_profile_id THEN 'mother'
      ELSE 'infant'
    END as patient_type,
    true as is_pre_notification
  FROM medications m,
  jsonb_array_elements(m.reminder_times) AS rt
  WHERE m.notification_enabled = true
    AND m.is_active = true
    AND m.pre_notification_minutes > 0
    AND m.start_date <= CURRENT_DATE
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
    AND (m.snooze_until IS NULL OR m.snooze_until < current_timestamp_utc)
    AND (m.pre_notified_at IS NULL OR m.pre_notified_at < current_timestamp_utc - INTERVAL '1 hour')
    AND (m.patient_id = user_profile_id OR m.patient_id IN (
      SELECT id FROM infants WHERE mother_id = user_profile_id
    ))
    AND current_dow = ANY(
      ARRAY(SELECT jsonb_array_elements_text(rt->'days')::integer)
    )
    -- Check if current time is pre_notification_minutes before scheduled time
    AND ABS(
      EXTRACT(EPOCH FROM (
        current_time_str::time - ((rt->>'time')::time - (m.pre_notification_minutes || ' minutes')::interval)
      ))
    ) <= 300;
END;
$function$;