-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to automatically create infant records for completed pregnancies
CREATE OR REPLACE FUNCTION public.create_infant_from_delivery()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pregnancy_record RECORD;
  new_infant_id UUID;
BEGIN
  -- Find all pregnancies that have reached or passed 40 weeks and don't have an infant yet
  FOR pregnancy_record IN
    SELECT p.*
    FROM pregnancies p
    WHERE p.status = 'pregnant'
      AND p.due_date <= CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM infants i WHERE i.pregnancy_id = p.id
      )
  LOOP
    -- Create infant record with birth date as due date (can be updated later with actual birth date)
    INSERT INTO infants (
      mother_id,
      pregnancy_id,
      first_name,
      birth_date,
      gender,
      created_at,
      updated_at
    ) VALUES (
      pregnancy_record.mother_id,
      pregnancy_record.id,
      'Baby', -- Default name, can be updated by mother
      pregnancy_record.due_date,
      NULL, -- Gender to be filled in by mother
      NOW(),
      NOW()
    )
    RETURNING id INTO new_infant_id;

    -- Update pregnancy status to delivered
    UPDATE pregnancies
    SET status = 'delivered',
        updated_at = NOW()
    WHERE id = pregnancy_record.id;

    -- Log the creation
    RAISE NOTICE 'Created infant % for pregnancy %', new_infant_id, pregnancy_record.id;
  END LOOP;
END;
$$;

-- Create a function that can be called by the edge function
CREATE OR REPLACE FUNCTION public.check_and_create_deliveries()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_count INTEGER := 0;
BEGIN
  -- Call the main function
  PERFORM public.create_infant_from_delivery();
  
  -- Count how many infants were created
  SELECT COUNT(*) INTO result_count
  FROM infants
  WHERE created_at >= NOW() - INTERVAL '1 minute';
  
  RETURN json_build_object(
    'success', true,
    'infants_created', result_count,
    'checked_at', NOW()
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_infant_from_delivery() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_create_deliveries() TO authenticated, anon;