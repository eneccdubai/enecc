-- Agregar columna para distinguir entre reservas reales y bloqueos de calendario
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS is_calendar_block boolean DEFAULT false;

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_bookings_calendar_block
ON bookings(is_calendar_block);

-- Marcar las reservas externas existentes como bloqueos de calendario
-- Identificamos reservas externas por el email pattern 'external-*@enecc.com'
UPDATE bookings
SET is_calendar_block = true,
    total_price = 0
WHERE user_email LIKE 'external-%@enecc.com'
  AND is_calendar_block IS NOT true;

-- Comentario para documentación
COMMENT ON COLUMN bookings.is_calendar_block IS
  'Indica si es un bloqueo de calendario sincronizado (true) o una reserva real (false). Los bloqueos no generan ingresos.';

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Columna is_calendar_block agregada exitosamente';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Las reservas externas existentes han sido marcadas como bloqueos de calendario';
  RAISE NOTICE 'Los bloqueos de calendario tienen total_price = 0 y no se incluyen en cálculos de ingresos';
END $$;
