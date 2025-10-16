-- Create medication_actions table to track adherence
CREATE TABLE IF NOT EXISTS public.medication_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id uuid NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('taken', 'skipped', 'missed', 'snoozed')),
  scheduled_time timestamp with time zone NOT NULL,
  action_time timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_medication_actions_medication_id ON public.medication_actions(medication_id);
CREATE INDEX idx_medication_actions_user_id ON public.medication_actions(user_id);
CREATE INDEX idx_medication_actions_action_time ON public.medication_actions(action_time);
CREATE INDEX idx_medication_actions_action_type ON public.medication_actions(action_type);

-- Enable RLS
ALTER TABLE public.medication_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own medication actions"
  ON public.medication_actions
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can create their own medication actions"
  ON public.medication_actions
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own medication actions"
  ON public.medication_actions
  FOR UPDATE
  USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own medication actions"
  ON public.medication_actions
  FOR DELETE
  USING (
    user_id = auth.uid()
  );

COMMENT ON TABLE public.medication_actions IS 'Tracks medication adherence actions (taken, skipped, missed, snoozed)';
COMMENT ON COLUMN public.medication_actions.action_type IS 'Type of action: taken, skipped, missed, or snoozed';
COMMENT ON COLUMN public.medication_actions.scheduled_time IS 'The time the medication was scheduled to be taken';
COMMENT ON COLUMN public.medication_actions.action_time IS 'The actual time the action was recorded';