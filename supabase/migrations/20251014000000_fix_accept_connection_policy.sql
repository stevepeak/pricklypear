-- Fix the "Accept connection" RLS policy to allow users to accept/decline connection requests
-- 
-- Problem: The previous policy had conflicting USING and WITH CHECK clauses:
-- - USING allowed connected_user_id to update
-- - WITH CHECK required user_id to be the current user
-- This made it impossible to accept connections since connected_user_id ≠ user_id
--
-- Solution: Allow the recipient (connected_user_id) to update the status to accepted/declined

DROP POLICY IF EXISTS "Accept connection" ON "public"."connections";

CREATE POLICY "Accept connection" ON "public"."connections"
FOR UPDATE
USING ("connected_user_id" = auth.uid())
WITH CHECK (
  "connected_user_id" = auth.uid() 
  AND status IN ('accepted', 'declined')
);

