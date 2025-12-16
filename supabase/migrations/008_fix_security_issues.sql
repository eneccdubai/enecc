-- Fix Security Issues
-- 1. Remove SECURITY DEFINER from calendar_sync_jobs view (recreate without it)
-- 2. Enable RLS on payment_settings table and add policies

-- ============================================
-- 1. Fix calendar_sync_jobs view
-- ============================================
-- Drop the existing view
DROP VIEW IF EXISTS calendar_sync_jobs;

-- Recreate the view without SECURITY DEFINER
-- This view should only be accessible to authenticated users (admins)
CREATE VIEW calendar_sync_jobs
WITH (security_invoker = true)
AS
SELECT
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job
WHERE command LIKE '%sync_all_calendars%';

-- Comment
COMMENT ON VIEW calendar_sync_jobs IS 'Vista para monitorear los jobs de sincronización de calendarios (sin SECURITY DEFINER)';

-- ============================================
-- 2. Enable RLS on payment_settings
-- ============================================
-- Enable RLS on payment_settings table
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read payment settings
-- (This allows the frontend to read the publishable key)
CREATE POLICY "Authenticated users can read payment settings"
  ON payment_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can update payment settings
-- Admins are identified by having role = 'admin' in the users table
CREATE POLICY "Admins can update payment settings"
  ON payment_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can insert payment settings
-- (Though this table should only have one row)
CREATE POLICY "Admins can insert payment settings"
  ON payment_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Comments for documentation
COMMENT ON POLICY "Authenticated users can read payment settings" ON payment_settings IS 'Permite a usuarios autenticados leer la configuración de pagos (necesario para obtener la clave pública de Stripe)';
COMMENT ON POLICY "Admins can update payment settings" ON payment_settings IS 'Solo administradores pueden actualizar la configuración de pagos';
COMMENT ON POLICY "Admins can insert payment settings" ON payment_settings IS 'Solo administradores pueden insertar configuración de pagos';
