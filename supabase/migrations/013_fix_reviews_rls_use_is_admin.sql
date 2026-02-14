-- Fix reviews RLS policies to use is_admin() function instead of direct users query
-- This avoids the same infinite recursion issue fixed in migration 012

DROP POLICY IF EXISTS "Only admins can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Only admins can update reviews" ON reviews;
DROP POLICY IF EXISTS "Only admins can delete reviews" ON reviews;

CREATE POLICY "reviews_insert_admin"
  ON reviews FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "reviews_update_admin"
  ON reviews FOR UPDATE
  USING (is_admin());

CREATE POLICY "reviews_delete_admin"
  ON reviews FOR DELETE
  USING (is_admin());
