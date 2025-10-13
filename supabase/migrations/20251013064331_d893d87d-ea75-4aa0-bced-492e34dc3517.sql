-- Drop and recreate the get_due_medication_reminders function with proper time checking
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
BEGIN
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
    AND (m.snooze_until IS NULL OR m.snooze_until < now())
    AND (m.last_notified_at IS NULL OR m.last_notified_at < now() - INTERVAL '1 hour')
    AND (m.patient_id = user_profile_id OR m.patient_id IN (
      SELECT id FROM infants WHERE mother_id = user_profile_id
    ))
    -- Check if current day is in the scheduled days array
    AND (EXTRACT(DOW FROM now())::integer + 1) = ANY(
      ARRAY(SELECT jsonb_array_elements_text(rt->'days')::integer)
    )
    -- Check if current time is within 5 minutes of scheduled time
    AND ABS(
      EXTRACT(EPOCH FROM (
        CURRENT_TIME - (rt->>'time')::time
      ))
    ) <= 300;
END;
$$;

-- Add validation trigger to ensure reminder_times is not empty when notifications are enabled
CREATE OR REPLACE FUNCTION validate_medication_reminders()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.notification_enabled = true AND (
    NEW.reminder_times IS NULL OR 
    jsonb_array_length(NEW.reminder_times) = 0
  ) THEN
    RAISE EXCEPTION 'Medications with notifications enabled must have at least one reminder time';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_medication_reminders ON medications;
CREATE TRIGGER check_medication_reminders
  BEFORE INSERT OR UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION validate_medication_reminders();