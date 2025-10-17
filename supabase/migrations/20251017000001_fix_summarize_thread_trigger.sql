-- Drop the existing trigger
DROP TRIGGER IF EXISTS "Summarize Thread" ON public.messages;

-- Create a function to invoke the summarize-thread edge function with the thread_id
CREATE OR REPLACE FUNCTION public.trigger_summarize_thread()
RETURNS TRIGGER AS $$
BEGIN
  -- Use Kong internal gateway (works in both local and production Supabase)
  -- Kong is the internal API gateway accessible at http://kong:8000
  PERFORM net.http_post(
    url := 'http://kong:8000/functions/v1/summarize-thread',
    body := jsonb_build_object('threadId', NEW.thread_id),
    headers := '{"Content-Type":"application/json"}'::jsonb,
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

