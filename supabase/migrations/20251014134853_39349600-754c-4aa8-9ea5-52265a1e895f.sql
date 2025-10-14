-- Add user_journey field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_journey text CHECK (user_journey IN ('pregnant', 'infant', 'family_planning'));

-- Add index for better query performance
CREATE INDEX idx_profiles_user_journey ON public.profiles(user_journey);