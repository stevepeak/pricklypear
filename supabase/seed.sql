-- Create demo users for local development
-- This allows quick login without magic links

-- Ensure pgcrypto is available
create extension if not exists pgcrypto schema extensions;

-- Helper function to create auth user + identity + profile
create or replace function public._create_dev_user(
  in_email       text,
  in_full_name   text,
  in_password    text default 'DemoPass1!'
) returns uuid
language plpgsql
security definer set search_path = public, auth
as $$
declare
  new_uid uuid;
begin
  -- Insert into auth.users
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
    extensions.crypt(in_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', in_full_name),
    '', '', '', '',
    false,
    now(),
    now()
  ) returning id into new_uid;

  -- Insert into auth.identities
  insert into auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    new_uid::text,
    new_uid,
    jsonb_build_object('sub', new_uid::text, 'email', in_email, 'email_verified', true, 'phone_verified', false),
    'email',
    now(),
    now(),
    now()
  );

  -- Profile is created by trigger, no additional updates needed
  return new_uid;
end;
$$;

-- Create demo users
do $$
declare
  alice_id uuid;
  bob_id uuid;
  charlie_id uuid;
  dana_id uuid;
begin
  alice_id := public._create_dev_user('alice@example.com',   'Alice Wonderland');
  bob_id := public._create_dev_user('bob@example.com',     'Bob Builder');
  charlie_id := public._create_dev_user('charlie@example.com', 'Charlie Chaplin');
  dana_id := public._create_dev_user('dana@example.com',    'Dana Scully');

  -- Create various connections for Alice to demonstrate all connection statuses
  
  -- 1. Alice -> Bob: accepted (mutual connection)
  insert into public.connections (user_id, connected_user_id, status, created_at, updated_at)
  values (alice_id, bob_id, 'accepted', now() - interval '10 days', now() - interval '9 days');
  
  -- 2. Bob -> Alice: accepted (reciprocal connection showing Alice accepted someone's request)
  insert into public.connections (user_id, connected_user_id, status, created_at, updated_at)
  values (bob_id, alice_id, 'accepted', now() - interval '10 days', now() - interval '9 days');
  
  -- 3. Alice -> Charlie: pending (Alice sent invitation, Charlie hasn't responded yet)
  insert into public.connections (user_id, connected_user_id, status, created_at, updated_at)
  values (alice_id, charlie_id, 'pending', now() - interval '5 days', now() - interval '5 days');
  
  -- 4. Dana -> Alice: pending (Dana sent invitation to Alice, Alice hasn't responded)
  insert into public.connections (user_id, connected_user_id, status, created_at, updated_at)
  values (dana_id, alice_id, 'pending', now() - interval '3 days', now() - interval '3 days');
  
  -- 5. Alice -> Dana: declined (Alice declined a past connection, or Dana declined Alice's request)
  insert into public.connections (user_id, connected_user_id, status, created_at, updated_at)
  values (alice_id, dana_id, 'declined', now() - interval '15 days', now() - interval '14 days');
  
  -- 6. Alice -> Email invitation: pending (Alice invited someone not yet on the platform)
  insert into public.connections (user_id, connected_user_id, status, invitee_email, created_at, updated_at)
  values (alice_id, null, 'pending', 'future.user@example.com', now() - interval '7 days', now() - interval '7 days');
  
  -- 7. Charlie -> Alice: disabled (A previously accepted connection that was disabled)
  insert into public.connections (user_id, connected_user_id, status, created_at, updated_at)
  values (charlie_id, alice_id, 'disabled', now() - interval '20 days', now() - interval '1 day');
  
end $$;

-- Clean up helper function
drop function if exists public._create_dev_user(text, text, text);

