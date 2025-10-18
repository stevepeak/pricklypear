-- Add is_admin column to profiles table
ALTER TABLE profiles 
  ADD COLUMN is_admin boolean DEFAULT false NOT NULL;

-- Add index for efficient querying of admin users
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Comment the column for documentation
COMMENT ON COLUMN profiles.is_admin IS 'Whether the user has admin privileges (can view and reply to all support threads)';

-- Update RLS policies for threads to allow admins to view all customer_support threads
CREATE POLICY "Admins can view all support threads" 
ON "public"."threads" 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ) 
  AND type = 'customer_support'
);

-- Update RLS policies for messages to allow admins to view messages in support threads
CREATE POLICY "Admins can view messages in support threads" 
ON "public"."messages" 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ) 
  AND EXISTS (
    SELECT 1 FROM threads 
    WHERE threads.id = thread_id 
    AND threads.type = 'customer_support'
  )
);

-- Allow admins to insert messages in support threads
CREATE POLICY "Admins can insert messages in support threads" 
ON "public"."messages" 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ) 
  AND EXISTS (
    SELECT 1 FROM threads 
    WHERE threads.id = thread_id 
    AND threads.type = 'customer_support'
  )
);

-- Allow admins to update message read receipts for support thread messages
CREATE POLICY "Admins can update read receipts in support threads" 
ON "public"."message_read_receipts" 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ) 
  AND EXISTS (
    SELECT 1 FROM messages m
    JOIN threads t ON m.thread_id = t.id
    WHERE m.id = message_id 
    AND t.type = 'customer_support'
  )
);

-- Allow admins to view thread participants for support threads
CREATE POLICY "Admins can view support thread participants" 
ON "public"."thread_participants" 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ) 
  AND EXISTS (
    SELECT 1 FROM threads 
    WHERE threads.id = thread_id 
    AND threads.type = 'customer_support'
  )
);

-- Set support@system.local as admin if the user exists
-- This will work in both development and production environments
UPDATE profiles 
SET is_admin = true 
WHERE email = 'support@system.local';

