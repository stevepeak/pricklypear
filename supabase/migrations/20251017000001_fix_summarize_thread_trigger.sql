-- Drop the existing trigger
DROP TRIGGER IF EXISTS "Summarize Thread" ON public.messages;

-- Drop the old function that uses supabase_functions.http_request (this might not exist but let's be safe)
DROP FUNCTION IF EXISTS supabase_functions.http_request(text, text, text, text, text);

-- Create a function to invoke the summarize-thread edge function with the thread_id
CREATE OR REPLACE FUNCTION public.trigger_summarize_thread()
RETURNS TRIGGER AS $$
DECLARE
  service_role_key text;
BEGIN
  -- Get the service role key from vault or use environment variable
  -- In local development, we need to use the anon key or service role key
  -- For production, this will use the actual service role key
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  IF service_role_key IS NULL THEN
    -- Fallback to a default for local development
    service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
  END IF;
  
  -- Use Kong internal gateway (works in both local and production Supabase)
  -- Kong is the internal API gateway accessible at http://kong:8000
  PERFORM net.http_post(
    url := 'http://kong:8000/functions/v1/summarize-thread',
    body := jsonb_build_object('threadId', NEW.thread_id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    timeout_milliseconds := 7000
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger using the new function
CREATE TRIGGER "Summarize Thread"
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_summarize_thread();

-- Add comment for documentation
COMMENT ON FUNCTION public.trigger_summarize_thread() IS 'Triggers thread summarization via edge function when a new message is inserted';

