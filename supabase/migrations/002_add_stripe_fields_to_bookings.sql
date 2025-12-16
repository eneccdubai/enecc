-- Agregar campos de Stripe a la tabla bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- Crear índice para búsquedas por session_id
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session_id ON bookings(stripe_session_id);

-- Comentarios para documentación
COMMENT ON COLUMN bookings.stripe_session_id IS 'ID de la sesión de Checkout de Stripe';
COMMENT ON COLUMN bookings.payment_status IS 'Estado del pago: pending, paid, failed, refunded';
