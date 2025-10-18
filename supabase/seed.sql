begin;

-- 1) House-keeping
create extension if not exists pgcrypto;

-- 2) Helper – create one auth user + identity + profile in one shot
create or replace function public._demo_create_user(
  in_email       text,
  in_full_name   text,
  in_password    text default 'DemoPass1!'
) returns uuid
language plpgsql
as $$
declare
  new_uid uuid;
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    is_sso_user,
    created_at,
    updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    in_email,
    crypt(in_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', in_full_name),
    '', '', '', '',
    false,
    now(),
    now()
  ) returning id into new_uid;

  insert into auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at,
    last_sign_in_at
  ) values (
    gen_random_uuid(),
    new_uid::text,
    new_uid,
    jsonb_build_object('sub', new_uid::text, 'email', in_email),
    'email',
    now(),
    now(),
    now()
  );

  -- Profile is automatically created by the handle_new_user trigger
  -- Just update the name if needed
  update public.profiles set name = in_full_name where id = new_uid;

  return new_uid;
end;
$$;

-- 3) Demo users
do $$
declare
  alice_id uuid;
  bob_id uuid;
  charlie_id uuid;
  dana_id uuid;
  ai_user_id uuid;
  support_user_id uuid;
begin
  alice_id := public._demo_create_user('alice@example.com', 'Alice Wonderland');
  bob_id := public._demo_create_user('bob@example.com', 'Bob Builder');
  charlie_id := public._demo_create_user('charlie@example.com', 'Charlie Chaplin');
  dana_id := public._demo_create_user('dana@example.com', 'Dana Scully');
  ai_user_id := public._demo_create_user('ai@system.local', 'AI Assistant');
  support_user_id := public._demo_create_user('support@system.local', 'Customer Support');
  
  -- Set support user as admin
  update public.profiles set is_admin = true where id = support_user_id;

  -- Create various connections for Alice to demonstrate all connection statuses
  
  -- 1. Alice -> Bob: accepted (mutual connection)
  insert into public.connections (user_id, connected_user_id, status, created_at, updated_at)
  values (alice_id, bob_id, 'accepted', now() - interval '10 days', now() - interval '9 days');
  
  -- 2. Alice -> Charlie: pending (Alice sent invitation, Charlie hasn't responded yet)
  insert into public.connections (user_id, connected_user_id, status, created_at, updated_at)
  values (alice_id, charlie_id, 'pending', now() - interval '5 days', now() - interval '5 days');
  
  -- 3. Dana -> Alice: pending (Dana sent invitation to Alice, Alice hasn't responded)
  insert into public.connections (user_id, connected_user_id, status, created_at, updated_at)
  values (dana_id, alice_id, 'pending', now() - interval '3 days', now() - interval '3 days');
  
  -- 4. Alice -> Email invitation: pending (Alice invited someone not yet on the platform)
  insert into public.connections (user_id, connected_user_id, status, invitee_email, created_at, updated_at)
  values (alice_id, null, 'pending', 'future.user@example.com', now() - interval '7 days', now() - interval '7 days');
  
  -- Create threads for Alice demonstrating each thread type
  -- Nested block for thread creation
  declare
    chat_thread_id uuid;
    ai_thread_id uuid;
    support_thread_id uuid;
  begin
    -- 1. Default chat thread: Alice and Bob discussing parenting time
    chat_thread_id := gen_random_uuid();
    insert into public.threads (id, title, type, topic, status, created_by, created_at, controls)
    values (chat_thread_id, 'Weekend Schedule Discussion', 'default', 'parenting_time', 'Open', alice_id, now() - interval '2 days', '{"requireAiApproval": true}'::jsonb);
    
    -- Add participants
    insert into public.thread_participants (thread_id, user_id, created_at)
    values 
      (chat_thread_id, alice_id, now() - interval '2 days'),
      (chat_thread_id, bob_id, now() - interval '2 days');
    
    -- Add messages (read receipts are automatically created by trigger)
    insert into public.messages (id, thread_id, user_id, text, type, timestamp)
    values (gen_random_uuid(), chat_thread_id, alice_id, 'Hi Bob, I wanted to discuss the schedule for next weekend. Would you be available to have the kids Saturday morning?', 'user_message', now() - interval '2 days');
    
    insert into public.messages (id, thread_id, user_id, text, type, timestamp)
    values (gen_random_uuid(), chat_thread_id, bob_id, 'Sure, Saturday morning works. What time were you thinking?', 'user_message', now() - interval '1 day 22 hours');
    
    insert into public.messages (id, thread_id, user_id, text, type, timestamp)
    values (gen_random_uuid(), chat_thread_id, alice_id, 'Around 9 AM would be great. I can drop them off at your place.', 'user_message', now() - interval '1 day 20 hours');
    
    insert into public.messages (id, thread_id, user_id, text, type, timestamp)
    values (gen_random_uuid(), chat_thread_id, bob_id, 'Perfect, see you then!', 'user_message', now() - interval '1 day 18 hours');
    
    -- 2. AI chat thread: Alice asking for advice
    ai_thread_id := gen_random_uuid();
    insert into public.threads (id, title, type, topic, status, created_by, created_at, ai)
    values (ai_thread_id, 'Managing Co-Parenting Stress', 'ai_chat', 'parenting_time', 'Open', alice_id, now() - interval '5 days', true);
    
    -- Add participants (Alice and AI user)
    insert into public.thread_participants (thread_id, user_id, created_at)
    values 
      (ai_thread_id, alice_id, now() - interval '5 days'),
      (ai_thread_id, ai_user_id, now() - interval '5 days');
    
    -- Add messages (read receipts are automatically created by trigger)
    insert into public.messages (id, thread_id, user_id, text, type, timestamp)
    values (gen_random_uuid(), ai_thread_id, alice_id, 'I''m feeling overwhelmed with coordinating schedules and dealing with conflicts. Do you have any advice for managing co-parenting stress?', 'user_message', now() - interval '5 days');
    
    insert into public.messages (id, thread_id, user_id, text, type, timestamp)
    values (gen_random_uuid(), ai_thread_id, ai_user_id, 'Managing co-parenting stress is important for both you and your children. Here are some helpful strategies:\n\n1. **Establish Clear Boundaries**: Set specific times for communication and stick to child-related topics.\n\n2. **Use Written Communication**: Consider using apps or email for scheduling to reduce emotional exchanges.\n\n3. **Practice Self-Care**: Make time for activities that help you relax and recharge.\n\n4. **Focus on What You Can Control**: You can''t control your co-parent''s actions, but you can control your responses.\n\n5. **Seek Support**: Consider joining a co-parenting support group or talking to a therapist.\n\nRemember, it''s okay to feel overwhelmed. Take things one day at a time.', 'ai_message', now() - interval '5 days' + interval '30 seconds');
    
    insert into public.messages (id, thread_id, user_id, text, type, timestamp)
    values (gen_random_uuid(), ai_thread_id, alice_id, 'Thank you! The tip about written communication is really helpful. I think that would reduce a lot of tension.', 'user_message', now() - interval '4 days 23 hours');
    
    -- 3. Customer support thread: Alice asking about a feature
    support_thread_id := gen_random_uuid();
    insert into public.threads (id, title, type, topic, status, created_by, created_at)
    values (support_thread_id, 'Question about Document Storage', 'customer_support', 'other', 'Open', alice_id, now() - interval '12 hours');
    
    -- Add participants (Alice and support user)
    insert into public.thread_participants (thread_id, user_id, created_at)
    values 
      (support_thread_id, alice_id, now() - interval '12 hours'),
      (support_thread_id, support_user_id, now() - interval '12 hours');
    
    -- Add messages (read receipts are automatically created by trigger)
    insert into public.messages (id, thread_id, user_id, text, type, timestamp)
    values (gen_random_uuid(), support_thread_id, alice_id, 'Hi, I''m wondering if there''s a limit to how many documents I can upload? I have several court orders and receipts I need to store.', 'user_message', now() - interval '12 hours');
    
    insert into public.messages (id, thread_id, user_id, text, type, timestamp)
    values (gen_random_uuid(), support_thread_id, support_user_id, 'Hello! Great question. Your current plan allows for unlimited document storage. You can upload as many documents as you need. Each file should be under 50MB.\n\nWe support various file types including PDF, images (JPG, PNG), and Word documents. You can also organize them with labels like "CourtOrder", "Receipt", "Medical", etc.\n\nLet me know if you have any other questions!', 'customer_support', now() - interval '11 hours 45 minutes');
    
    insert into public.messages (id, thread_id, user_id, text, type, timestamp)
    values (gen_random_uuid(), support_thread_id, alice_id, 'Perfect! That''s exactly what I needed to know. The labeling feature sounds very useful. Thank you!', 'user_message', now() - interval '11 hours 30 minutes');
  end;
  
end $$;

commit;

-- 5) Clean-up helper
drop function if exists public._demo_create_user(text, text, text);
