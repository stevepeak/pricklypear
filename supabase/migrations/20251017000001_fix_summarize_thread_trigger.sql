-- Drop the existing trigger
DROP TRIGGER IF EXISTS "Summarize Thread" ON public.messages;

-- Create a function to invoke the summarize-thread edge function with the thread_id
CREATE OR REPLACE FUNCTION public.trigger_summarize_thread()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the summarize-thread edge function asynchronously with the thread_id
  PERFORM supabase_functions.http_request(
    'https://vgddrhyjttyrathqhefb.supabase.co/functions/v1/summarize-thread',
    'POST',
    '{"Content-Type":"application/json"}',
    '{}',
    '{"threadId":"' || NEW.thread_id || '"}',
    '7000'
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

