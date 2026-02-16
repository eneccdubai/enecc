-- Fix admin access: allow user self-registration + ensure admin users exist
-- Problem: no INSERT policy on users table, so new Google OAuth users
-- can't create their row, and is_admin() returns false → RLS blocks everything

-- 1. Allow authenticated users to insert their own row in users table
CREATE POLICY "users_insert_self"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Insert admin users directly (upsert to avoid conflicts)
-- These emails must match ADMIN_EMAILS in the frontend
INSERT INTO users (id, email, role)
SELECT au.id, au.email, 'admin'
FROM auth.users au
WHERE au.email IN ('enecc.team@gmail.com', 'mimetria@eneccdubai.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 3. Also update is_admin() to check email directly as fallback
-- This way even if the users row doesn't exist yet, admin emails get through
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
  )
  OR (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) IN ('enecc.team@gmail.com', 'mimetria@eneccdubai.com');
$$;
