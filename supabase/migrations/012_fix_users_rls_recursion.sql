-- Fix infinite recursion in users table RLS policies
-- The problem: admin policies on "users" do SELECT from "users", triggering the same policy

-- Drop the recursive policies
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;

-- Replace users_select_own with a policy that lets users read their own row
-- AND lets admins (checked via the same table but using a security definer function) read all
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Create a security definer function to check admin role without triggering RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Users can read their own row, admins can read all
CREATE POLICY "users_select"
  ON users FOR SELECT
  USING (
    auth.uid() = id
    OR is_admin()
  );

-- Users can update their own row, admins can update all
CREATE POLICY "users_update"
  ON users FOR UPDATE
  USING (
    auth.uid() = id
    OR is_admin()
  );
