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
begin
  perform public._create_dev_user('alice@example.com',   'Alice Wonderland');
  perform public._create_dev_user('bob@example.com',     'Bob Builder');
  perform public._create_dev_user('charlie@example.com', 'Charlie Chaplin');
  perform public._create_dev_user('dana@example.com',    'Dana Scully');
end $$;

-- Clean up helper function
drop function if exists public._create_dev_user(text, text, text);

