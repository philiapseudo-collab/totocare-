-- Create symptom_history table for tracking user-reported symptoms
CREATE TABLE public.symptom_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_description TEXT NOT NULL,
  ai_assessment TEXT NOT NULL,
  severity_level TEXT NOT NULL CHECK (severity_level IN ('normal', 'monitor', 'urgent')),
  ai_explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.symptom_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own symptom history
CREATE POLICY "Users can view their own symptom history"
ON public.symptom_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own symptom entries
CREATE POLICY "Users can create their own symptom entries"
ON public.symptom_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own symptom history
CREATE POLICY "Users can delete their own symptom history"
ON public.symptom_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_symptom_history_updated_at
BEFORE UPDATE ON public.symptom_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_symptom_history_user_id ON public.symptom_history(user_id);
CREATE INDEX idx_symptom_history_created_at ON public.symptom_history(created_at DESC);