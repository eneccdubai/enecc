-- Fix RLS policies for bookings table
-- This ensures users can properly view and manage their bookings

-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON bookings;

-- SELECT policies
-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- INSERT policies
-- Users can create bookings (user_id will be set to their own ID)
CREATE POLICY "Users can create their own bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policies
-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can update all bookings
CREATE POLICY "Admins can update all bookings"
  ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- DELETE policies
-- Admins can delete any booking
CREATE POLICY "Admins can delete bookings"
  ON bookings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Comments
COMMENT ON POLICY "Users can view their own bookings" ON bookings IS 'Allows users to view only their own bookings';
COMMENT ON POLICY "Admins can view all bookings" ON bookings IS 'Allows administrators to view all bookings in the system';
COMMENT ON POLICY "Users can create their own bookings" ON bookings IS 'Allows users to create bookings for themselves';
COMMENT ON POLICY "Users can update their own bookings" ON bookings IS 'Allows users to update their own bookings';
COMMENT ON POLICY "Admins can update all bookings" ON bookings IS 'Allows administrators to update any booking';
COMMENT ON POLICY "Admins can delete bookings" ON bookings IS 'Allows administrators to delete any booking';
