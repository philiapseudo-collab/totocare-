-- Update the handle_new_user function to not require metadata for names
-- Users will fill in their names during profile setup instead

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles with empty names (will be filled during setup)
  INSERT INTO public.profiles (user_id, first_name, last_name, profile_completed)
  VALUES (NEW.id, '', '', false);
  
  -- Insert into user_roles (default to 'mother', can be changed during setup)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'mother');
  
  RETURN NEW;
END;
$$;