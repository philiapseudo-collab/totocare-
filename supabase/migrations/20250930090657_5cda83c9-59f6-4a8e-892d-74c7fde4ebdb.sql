-- Add new columns to profiles table for onboarding data
ALTER TABLE public.profiles
ADD COLUMN blood_group TEXT,
ADD COLUMN current_weight NUMERIC,
ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;

-- Create index for profile_completed for faster queries
CREATE INDEX idx_profiles_completed ON public.profiles(profile_completed) WHERE profile_completed = FALSE;