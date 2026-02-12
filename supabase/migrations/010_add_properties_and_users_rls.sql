-- Migration 010: Add RLS policies for properties, users, and storage

-- ============================================================
-- PROPERTIES TABLE — RLS Policies
-- ============================================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Anyone can read properties
CREATE POLICY "properties_select_public"
  ON properties FOR SELECT
  USING (true);

-- Only admins can insert properties
CREATE POLICY "properties_insert_admin"
  ON properties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Only admins can update properties
CREATE POLICY "properties_update_admin"
  ON properties FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Only admins can delete properties
CREATE POLICY "properties_delete_admin"
  ON properties FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );


-- ============================================================
-- USERS TABLE — RLS Policies
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own row
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "users_select_admin"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Authenticated users can update their own row
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any user
CREATE POLICY "users_update_admin"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );


-- ============================================================
-- STORAGE — property-images bucket + policies
-- ============================================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view images (public bucket)
CREATE POLICY "property_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- Admins can upload images
CREATE POLICY "property_images_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Admins can delete images
CREATE POLICY "property_images_delete_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );
