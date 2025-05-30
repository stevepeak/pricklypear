CREATE OR REPLACE FUNCTION create_thread(
    title text,
    type thread_type,
    topic thread_topic
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    new_thread_id uuid;
BEGIN
    -- Create the new thread
    INSERT INTO public.threads (title, type, topic, created_by)
    VALUES (title, type, topic, auth.uid())
    RETURNING id INTO new_thread_id;
    
    RETURN new_thread_id;
END;
$$;


CREATE OR REPLACE FUNCTION create_thread(
    title text,
    type thread_type,
    topic thread_topic,
    controls jsonb,
    participant_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    new_thread_id uuid;
    participant_id uuid;
BEGIN
    -- Create the new thread
    INSERT INTO public.threads (title, type, topic, controls, created_by)
    VALUES (title, type, topic, controls, auth.uid())
    RETURNING id INTO new_thread_id;
    
    -- Insert the thread creator as a participant
    INSERT INTO public.thread_participants (thread_id, user_id)
    VALUES (new_thread_id, auth.uid());
    
    -- Insert additional participants if provided
    IF array_length(participant_ids, 1) > 0 THEN
        FOREACH participant_id IN ARRAY participant_ids
        LOOP
            -- Skip if the participant is the creator
            IF participant_id != auth.uid() THEN
                INSERT INTO public.thread_participants (thread_id, user_id)
                VALUES (new_thread_id, participant_id);
            END IF;
        END LOOP;
    END IF;
    
    RETURN new_thread_id;
END;
$$;
