-- Agregar campos para exportación de calendarios
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS ical_export_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS ical_export_enabled BOOLEAN DEFAULT true;

-- Crear índice para búsquedas rápidas por token
CREATE INDEX IF NOT EXISTS idx_properties_ical_export_token
ON properties(ical_export_token);

-- Función para generar tokens únicos
CREATE OR REPLACE FUNCTION generate_ical_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  -- Generar token de 32 caracteres
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generar tokens para propiedades existentes que no tengan uno
UPDATE properties
SET ical_export_token = generate_ical_token()
WHERE ical_export_token IS NULL OR ical_export_token = '';

-- Trigger para generar token automáticamente al crear nueva propiedad
CREATE OR REPLACE FUNCTION ensure_ical_export_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ical_export_token IS NULL OR NEW.ical_export_token = '' THEN
    NEW.ical_export_token := generate_ical_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_ical_export_token_trigger ON properties;
CREATE TRIGGER ensure_ical_export_token_trigger
  BEFORE INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION ensure_ical_export_token();

-- Comentarios para documentación
COMMENT ON COLUMN properties.ical_export_token IS 'Token único para exportar calendario públicamente (usado en URL pública)';
COMMENT ON COLUMN properties.ical_export_enabled IS 'Si está habilitada la exportación pública del calendario';
