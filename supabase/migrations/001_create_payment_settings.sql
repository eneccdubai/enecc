-- Crear tabla para configuración de pagos con Stripe
CREATE TABLE IF NOT EXISTS payment_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Solo un registro global
  stripe_publishable_key TEXT,
  default_price_id TEXT,
  success_url TEXT,
  cancel_url TEXT,
  payments_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1) -- Asegurar que solo hay un registro
);

-- Crear índice único para garantizar un solo registro
CREATE UNIQUE INDEX IF NOT EXISTS payment_settings_single_row ON payment_settings (id);

-- Insertar registro inicial con valores por defecto
INSERT INTO payment_settings (id, stripe_publishable_key, default_price_id, success_url, cancel_url, payments_enabled)
VALUES (1, '', '', '', '', false)
ON CONFLICT (id) DO NOTHING;

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_payment_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS payment_settings_updated_at ON payment_settings;
CREATE TRIGGER payment_settings_updated_at
  BEFORE UPDATE ON payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_settings_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE payment_settings IS 'Configuración global de pagos con Stripe';
COMMENT ON COLUMN payment_settings.stripe_publishable_key IS 'Clave pública de Stripe (pk_test_... o pk_live_...)';
COMMENT ON COLUMN payment_settings.default_price_id IS 'ID del precio/producto por defecto en Stripe';
COMMENT ON COLUMN payment_settings.success_url IS 'URL a la que redirigir después de un pago exitoso';
COMMENT ON COLUMN payment_settings.cancel_url IS 'URL a la que redirigir si el usuario cancela el pago';
COMMENT ON COLUMN payment_settings.payments_enabled IS 'Flag para activar/desactivar pagos con Stripe';
