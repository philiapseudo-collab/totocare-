-- Add pre-notification minutes field to medications table
ALTER TABLE public.medications 
ADD COLUMN IF NOT EXISTS pre_notification_minutes integer DEFAULT 0;

COMMENT ON COLUMN public.medications.pre_notification_minutes IS 'Number of minutes before scheduled time to send a reminder (0 = no pre-notification)';