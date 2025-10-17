-- Enable required extensions for scheduled jobs and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Schedule the send-unread-notifications function to run every 15 minutes
-- Note: In production, you'll need to replace the URL with your actual Supabase project URL
-- and configure the service role key as a secret
SELECT cron.schedule(
  'send-unread-notifications',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT extensions.http_post(
    url := 'http://host.docker.internal:54321/functions/v1/send-unread-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Add a comment for documentation
COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL - used to send unread message notifications every 15 minutes';

