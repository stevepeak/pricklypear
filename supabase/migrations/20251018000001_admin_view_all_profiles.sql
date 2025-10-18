-- Create a helper function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Allow admins to view all profiles
-- This is needed so admins can see user names in support threads
CREATE POLICY "Admins can view all profiles" 
ON "public"."profiles" 
FOR SELECT 
USING (
  public.is_admin()
);

