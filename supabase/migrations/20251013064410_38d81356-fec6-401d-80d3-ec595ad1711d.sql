-- Fix search_path for validate_medication_reminders function
CREATE OR REPLACE FUNCTION validate_medication_reminders()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.notification_enabled = true AND (
    NEW.reminder_times IS NULL OR 
    jsonb_array_length(NEW.reminder_times) = 0
  ) THEN
    RAISE EXCEPTION 'Medications with notifications enabled must have at least one reminder time';
  END IF;
  RETURN NEW;
END;
$$;