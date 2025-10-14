-- Create medication_alerts table for drug safety checks
CREATE TABLE IF NOT EXISTS public.medication_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  drug_name TEXT NOT NULL,
  category TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  alert_message TEXT NOT NULL,
  is_bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medication_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for medication_alerts
CREATE POLICY "Users can view their own medication alerts"
  ON public.medication_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medication alerts"
  ON public.medication_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication alerts"
  ON public.medication_alerts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medication alerts"
  ON public.medication_alerts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_medication_alerts_updated_at
  BEFORE UPDATE ON public.medication_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();