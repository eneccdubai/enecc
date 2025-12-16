-- Habilitar acceso de administradores a todas las reservas
-- Esta migración permite que los usuarios con rol 'admin' puedan ver todas las reservas

-- Primero, verificar si existe la función para obtener el rol del usuario
CREATE OR REPLACE FUNCTION auth.user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Política para permitir que los admins vean todas las reservas
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
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

-- Política para permitir que los usuarios vean sus propias reservas (si no existe)
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Comentario
COMMENT ON POLICY "Admins can view all bookings" ON bookings IS 'Permite que los administradores vean todas las reservas en el sistema';
COMMENT ON POLICY "Users can view their own bookings" ON bookings IS 'Permite que los usuarios vean sus propias reservas';
