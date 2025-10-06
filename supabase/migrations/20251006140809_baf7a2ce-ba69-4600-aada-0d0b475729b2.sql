-- Set up a daily cron job to check for deliveries at midnight
SELECT cron.schedule(
  'check-deliveries-daily',
  '0 0 * * *', -- Run at midnight every day
  $$
  SELECT
    net.http_post(
        url:='https://krphczarhjtnbqlyhfsn.supabase.co/functions/v1/check-deliveries',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtycGhjemFyaGp0bmJxbHloZnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzYxMzAsImV4cCI6MjA3NDc1MjEzMH0.UdiE1FoB4of-7nUI2Z4OY5g5Klx0Y0yq6MDBBC8ZrXo"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Also create a manual trigger function that can be called from the client
CREATE OR REPLACE FUNCTION public.trigger_delivery_check()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Just call the check function directly
  RETURN public.check_and_create_deliveries();
END;
$$;

GRANT EXECUTE ON FUNCTION public.trigger_delivery_check() TO authenticated;