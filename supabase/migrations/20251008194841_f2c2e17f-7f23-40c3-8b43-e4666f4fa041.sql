-- Add reminder fields to medications table
ALTER TABLE public.medications
ADD COLUMN IF NOT EXISTS reminder_times jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS notification_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_notified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS snooze_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS reminder_sound text DEFAULT 'default';

-- Add comment to explain the reminder_times structure
COMMENT ON COLUMN public.medications.reminder_times IS 'Array of reminder times in format: [{"time": "08:00", "days": [1,2,3,4,5,6,7]}]';

-- Create a function to get due medication reminders
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
  SELECT 
    m.id,
    m.medication_name,
    m.dosage,
    rt->>'time' as reminder_time,
    CASE 
      WHEN m.patient_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) THEN 'mother'
      ELSE 'infant'
    END as patient_type
  FROM medications m,
  jsonb_array_elements(m.reminder_times) AS rt
  WHERE m.notification_enabled = true
    AND m.is_active = true
    AND (m.snooze_until IS NULL OR m.snooze_until < now())
    AND (m.patient_id = user_profile_id OR m.patient_id IN (
      SELECT id FROM infants WHERE mother_id = user_profile_id
    ))
    AND EXTRACT(DOW FROM now()) + 1 = ANY(
      SELECT jsonb_array_elements_text(rt->'days')::integer
    );
END;
$$;