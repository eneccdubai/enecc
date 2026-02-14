-- Fix properties and storage RLS policies to use is_admin() function
-- Avoids infinite recursion from direct users table queries

-- Properties
DROP POLICY IF EXISTS "properties_insert_admin" ON properties;
DROP POLICY IF EXISTS "properties_update_admin" ON properties;
DROP POLICY IF EXISTS "properties_delete_admin" ON properties;

CREATE POLICY "properties_insert_admin"
  ON properties FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "properties_update_admin"
  ON properties FOR UPDATE
  USING (is_admin());

CREATE POLICY "properties_delete_admin"
  ON properties FOR DELETE
  USING (is_admin());

-- Storage
DROP POLICY IF EXISTS "property_images_insert_admin" ON storage.objects;
DROP POLICY IF EXISTS "property_images_delete_admin" ON storage.objects;

CREATE POLICY "property_images_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND is_admin()
  );

CREATE POLICY "property_images_delete_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images'
    AND is_admin()
  );
