-- Schedule the check-deliveries function to run daily at 6 AM
SELECT cron.schedule(
  'check-deliveries-daily',
  '0 6 * * *', -- Every day at 6:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://krphczarhjtnbqlyhfsn.supabase.co/functions/v1/check-deliveries',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtycGhjemFyaGp0bmJxbHloZnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzYxMzAsImV4cCI6MjA3NDc1MjEzMH0.UdiE1FoB4of-7nUI2Z4OY5g5Klx0Y0yq6MDBBC8ZrXo"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Add a comment to track the cron job
COMMENT ON EXTENSION pg_cron IS 'Runs check-deliveries function daily at 6 AM to automatically create infant records for completed pregnancies';