# Guía de Migración de Supabase

Este documento contiene toda la información necesaria para migrar el proyecto ENECC Dubai de una cuenta de Supabase a otra.

---

## 📋 Información de la Cuenta Actual

**Project Reference:** `bdfpiaoegclakkhtosvz`
**Project URL:** `https://bdfpiaoegclakkhtosvz.supabase.co`
**MCP Config URL:** `https://mcp.supabase.com/mcp?project_ref=bdfpiaoegclakkhtosvz`

---

## 🔑 Variables de Entorno Requeridas

### Variables del Frontend (`.env`)
```env
VITE_SUPABASE_URL=https://tu-nuevo-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_nueva_anon_key
VITE_DATA_SOURCE=supabase
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
VITE_ADMIN_EMAILS=email1@example.com,email2@example.com
```

### Variables de las Edge Functions
Estas se configuran en el dashboard de Supabase → Edge Functions → Secrets:

- `SUPABASE_URL` - URL del proyecto de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key (¡NUNCA exponer en el frontend!)
- `STRIPE_SECRET_KEY` - Clave secreta de Stripe (sk_test_... o sk_live_...)
- `PAYMENTS_ENABLED` - `true` o `false` (string)
- `STRIPE_DEFAULT_PRICE_ID` - ID del precio/producto por defecto en Stripe (opcional)
- `STRIPE_SUCCESS_URL` - URL de éxito después del pago (ej: `/dashboard?payment=success`)
- `STRIPE_CANCEL_URL` - URL de cancelación (ej: `/booking?payment=cancelled`)

---

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

#### 1. `properties`
Campos principales (asumidos basados en el código):
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `description` (TEXT)
- `location` (TEXT)
- `bedrooms` (INTEGER)
- `bathrooms` (INTEGER)
- `max_guests` (INTEGER)
- `price_per_night` (NUMERIC)
- `images` (JSONB o TEXT[])
- `amenities` (JSONB o TEXT[])
- `available` (BOOLEAN)
- `show_in_landing` (BOOLEAN)
- `ical_export_token` (TEXT, UNIQUE) - Agregado en migración 004
- `ical_export_enabled` (BOOLEAN) - Agregado en migración 004
- `ical_sync_enabled` (BOOLEAN)
- `ical_last_sync` (TIMESTAMP)
- `airbnb_ical_url` (TEXT)
- `booking_ical_url` (TEXT)
- `vrbo_ical_url` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

#### 2. `bookings`
Campos principales:
- `id` (UUID, Primary Key)
- `property_id` (UUID, Foreign Key → properties.id)
- `property_name` (TEXT)
- `property_location` (TEXT)
- `user_id` (UUID, Foreign Key → auth.users.id o users.id)
- `user_name` (TEXT)
- `user_email` (TEXT)
- `check_in` (DATE)
- `check_out` (DATE)
- `guests` (INTEGER)
- `nights` (INTEGER)
- `total_price` (NUMERIC)
- `status` (TEXT) - valores: 'pending', 'confirmed', 'cancelled', 'pending_payment'
- `stripe_session_id` (TEXT) - Agregado en migración 002
- `payment_status` (TEXT) - Agregado en migración 002: 'pending', 'paid', 'failed', 'refunded'
- `is_calendar_block` (BOOLEAN) - Agregado en migración 007, default: false
- `payment_date` (TIMESTAMP)
- `payment_amount` (NUMERIC)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

#### 3. `users` (tabla pública, relacionada con auth.users)
Campos principales:
- `id` (UUID, Primary Key, relacionado con auth.users.id)
- `email` (TEXT)
- `role` (TEXT) - valores: 'user', 'admin'
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

#### 4. `payment_settings`
Tabla creada en migración 001:
- `id` (INTEGER, Primary Key, siempre = 1)
- `stripe_publishable_key` (TEXT)
- `default_price_id` (TEXT)
- `success_url` (TEXT)
- `cancel_url` (TEXT)
- `payments_enabled` (BOOLEAN, default: false)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Constraint:** Solo puede existir un registro (id = 1)

---

## 📝 Migraciones de Base de Datos

Ejecutar las migraciones en el orden indicado:

### Migración 001: `001_create_payment_settings.sql`
Crea la tabla de configuración de pagos con Stripe.

**Archivo:** `supabase/migrations/001_create_payment_settings.sql`

```sql
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
```

---

### Migración 002: `002_add_stripe_fields_to_bookings.sql`
Agrega campos de Stripe a la tabla bookings.

**Archivo:** `supabase/migrations/002_add_stripe_fields_to_bookings.sql`

```sql
-- Agregar campos de Stripe a la tabla bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- Crear índice para búsquedas por session_id
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session_id ON bookings(stripe_session_id);

-- Comentarios para documentación
COMMENT ON COLUMN bookings.stripe_session_id IS 'ID de la sesión de Checkout de Stripe';
COMMENT ON COLUMN bookings.payment_status IS 'Estado del pago: pending, paid, failed, refunded';
```

---

### Migración 003: `003_enable_admin_bookings_access.sql`
Habilita acceso de administradores a todas las reservas.

**Archivo:** `supabase/migrations/003_enable_admin_bookings_access.sql`

```sql
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
```

---

### Migración 004: `004_add_calendar_export_tokens.sql`
Agrega campos para exportación de calendarios.

**Archivo:** `supabase/migrations/004_add_calendar_export_tokens.sql`

```sql
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
```

---

### Migración 005: `005_fix_bookings_rls.sql`
Corrige y completa las políticas RLS para bookings.

**Archivo:** `supabase/migrations/005_fix_bookings_rls.sql`

```sql
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
```

---

### Migración 006: `006_setup_auto_sync_calendar.sql`
Configura sincronización automática de calendarios con pg_cron.

**⚠️ IMPORTANTE:** Esta migración contiene valores hardcodeados del proyecto anterior que DEBES actualizar.

**Archivo:** `supabase/migrations/006_setup_auto_sync_calendar.sql`

**NOTA:** Antes de ejecutar, reemplaza los valores hardcodeados (líneas 26-30) con las variables de entorno de tu nuevo proyecto o valores del nuevo proyecto.

```sql
-- Habilitar extensión pg_cron para tareas programadas
-- pg_cron está disponible en todos los planes de Supabase
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Habilitar extensión pg_net para hacer requests HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Función para sincronizar todas las propiedades con sincronización habilitada
CREATE OR REPLACE FUNCTION sync_all_calendars()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  property_record RECORD;
  request_id bigint;
  supabase_url text;
  supabase_key text;
BEGIN
  -- Obtener URL y key desde las variables de entorno de Supabase
  supabase_url := current_setting('app.settings.supabase_url', true);
  supabase_key := current_setting('app.settings.supabase_anon_key', true);

  -- ⚠️ ACTUALIZAR ESTOS VALORES CON TU NUEVO PROYECTO
  -- Si no están configuradas, usar valores por defecto (deberás configurarlas)
  IF supabase_url IS NULL THEN
    supabase_url := 'TU_NUEVO_SUPABASE_URL'; -- Ej: 'https://xxxxx.supabase.co'
  END IF;

  IF supabase_key IS NULL THEN
    supabase_key := 'TU_NUEVA_ANON_KEY'; -- Ej: 'eyJhbGc...'
  END IF;

  -- Recorrer todas las propiedades con sincronización habilitada
  FOR property_record IN
    SELECT id, name
    FROM properties
    WHERE ical_sync_enabled = true
    AND (airbnb_ical_url IS NOT NULL OR booking_ical_url IS NOT NULL OR vrbo_ical_url IS NOT NULL)
  LOOP
    -- Llamar a la Edge Function de sincronización usando pg_net
    -- pg_net.http_post devuelve un ID que podemos usar para rastrear la request
    SELECT INTO request_id net.http_post(
      url := supabase_url || '/functions/v1/sync-calendar',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_key
      ),
      body := jsonb_build_object('property_id', property_record.id)
    );

    -- Log de sincronización
    RAISE NOTICE 'Sincronización iniciada para propiedad %: % (request_id: %)',
      property_record.id, property_record.name, request_id;
  END LOOP;

  RAISE NOTICE 'Sincronización automática completada';
END;
$$;

-- Comentario para documentación
COMMENT ON FUNCTION sync_all_calendars() IS 'Sincroniza automáticamente todas las propiedades con sincronización habilitada llamando a la Edge Function';

-- Programar cron job para ejecutar cada 3 horas
-- Formato cron: minuto hora dia mes dia_semana
-- '0 */3 * * *' = Cada 3 horas, al minuto 0
SELECT cron.schedule(
  'sync-calendars-every-3-hours',  -- Nombre único del job
  '0 */3 * * *',                    -- Cada 3 horas
  'SELECT sync_all_calendars();'    -- Comando a ejecutar
);

-- Verificar que el cron job se creó correctamente
-- Puedes consultar cron.job para ver todos los jobs programados
COMMENT ON SCHEMA cron IS 'Extensión pg_cron para tareas programadas';

-- Crear vista para monitorear el estado de los cron jobs
CREATE OR REPLACE VIEW calendar_sync_jobs AS
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

-- Comentario
COMMENT ON VIEW calendar_sync_jobs IS 'Vista para monitorear los jobs de sincronización de calendarios';

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Sincronización automática configurada!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Cron job programado: cada 3 horas';
  RAISE NOTICE 'Para verificar: SELECT * FROM calendar_sync_jobs;';
  RAISE NOTICE 'Para ver historial: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;';
END $$;
```

---

### Migración 007: `007_add_calendar_block_flag.sql`
Agrega columna para distinguir entre reservas reales y bloqueos de calendario.

**Archivo:** `supabase/migrations/007_add_calendar_block_flag.sql`

```sql
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
```

---

## 🔧 Edge Functions

### 1. `create-checkout-session`

**Ubicación:** `supabase/functions/create-checkout-session/index.ts`

**Configuración en `config.toml`:**
```toml
[functions.create-checkout-session]
verify_jwt = true  # Verificar JWT (requiere autenticación)
```

**Variables de entorno necesarias:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `PAYMENTS_ENABLED`
- `STRIPE_DEFAULT_PRICE_ID` (opcional)
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`

**Funcionalidad:** Crea una sesión de Checkout de Stripe para procesar pagos de reservas.

---

### 2. `export-calendar`

**Ubicación:** `supabase/functions/export-calendar/index.ts`

**Configuración en `config.toml`:**
```toml
[functions.export-calendar]
verify_jwt = false  # Público, sin autenticación (usa token en URL)
```

**Variables de entorno necesarias:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Funcionalidad:** Genera un archivo iCalendar (.ics) público para exportar reservas de una propiedad usando un token único.
**URL de acceso:** `https://tu-proyecto.supabase.co/functions/v1/export-calendar/{ical_export_token}` o `.../{token}.ics`

---

### 3. `sync-calendar`

**Ubicación:** `supabase/functions/sync-calendar/index.ts`

**Configuración en `config.toml`:**
```toml
[functions.sync-calendar]
verify_jwt = true  # Requiere autenticación
```

**Variables de entorno necesarias:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Funcionalidad:** Sincroniza calendarios externos (Airbnb, Booking.com, VRBO) con las reservas en la base de datos. Crea bloqueos de calendario para fechas ocupadas en las plataformas externas.

---

### 4. `verify-payment`

**Ubicación:** `supabase/functions/verify-payment/index.ts`

**Configuración en `config.toml`:**
```toml
[functions.verify-payment]
verify_jwt = true  # Requiere autenticación
```

**Variables de entorno necesarias:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`

**Funcionalidad:** Verifica el estado de un pago en Stripe y actualiza el estado de la reserva correspondiente.

---

## 🔐 Políticas RLS (Row Level Security)

### Tabla `bookings`

**RLS habilitado:** Sí

**Políticas:**
1. **"Users can view their own bookings"** (SELECT)
   - Los usuarios pueden ver solo sus propias reservas

2. **"Admins can view all bookings"** (SELECT)
   - Los administradores pueden ver todas las reservas

3. **"Users can create their own bookings"** (INSERT)
   - Los usuarios pueden crear reservas para sí mismos

4. **"Users can update their own bookings"** (UPDATE)
   - Los usuarios pueden actualizar sus propias reservas

5. **"Admins can update all bookings"** (UPDATE)
   - Los administradores pueden actualizar cualquier reserva

6. **"Admins can delete bookings"** (DELETE)
   - Los administradores pueden eliminar cualquier reserva

### Tabla `properties`

**Nota:** Asegúrate de que RLS esté configurado según tus necesidades de seguridad. Las políticas específicas no están documentadas en las migraciones, pero deben permitir:
- Lectura pública (para usuarios no autenticados en la búsqueda)
- Escritura solo para administradores

### Tabla `users`

**Nota:** Debe tener políticas RLS que permitan:
- Los usuarios pueden ver/actualizar su propio perfil
- Los administradores pueden ver/actualizar todos los perfiles

---

## 🚀 Pasos para la Migración

### 1. Crear el Nuevo Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto con el nombre deseado
3. Anota el `Project URL` y las claves API:
   - `anon/public key` → `VITE_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (para Edge Functions)

### 2. Configurar Variables de Entorno

#### Frontend (`.env`)
```env
VITE_SUPABASE_URL=https://tu-nuevo-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_nueva_anon_key
```

#### Edge Functions (en el Dashboard de Supabase)
1. Ve a **Edge Functions** → **Secrets**
2. Agrega todas las variables mencionadas en la sección "Variables de las Edge Functions"

### 3. Aplicar Migraciones

**Opción A: Usando Supabase CLI**
```bash
# Si usas Supabase CLI
supabase link --project-ref tu-nuevo-project-ref
supabase db push
```

**Opción B: Manualmente desde el Dashboard**
1. Ve a **SQL Editor** en el dashboard de Supabase
2. Ejecuta cada migración en orden (001 → 007)
3. Verifica que no haya errores

**Opción C: Usando MCP de Supabase (si está configurado)**
Usa las herramientas MCP para aplicar las migraciones directamente.

### 4. Desplegar Edge Functions

**Opción A: Usando Supabase CLI**
```bash
# Desde la raíz del proyecto
supabase functions deploy create-checkout-session
supabase functions deploy export-calendar
supabase functions deploy sync-calendar
supabase functions deploy verify-payment
```

**Opción B: Usando el Dashboard**
1. Ve a **Edge Functions** en el dashboard
2. Crea cada función manualmente y copia el código desde los archivos correspondientes

### 5. Configurar Extensions

Las siguientes extensiones se crean automáticamente en las migraciones:
- `pg_cron` (para sincronización automática)
- `pg_net` (para hacer requests HTTP)

Verifica que estén habilitadas en **Database** → **Extensions**.

### 6. Actualizar Configuración del Proyecto

#### Actualizar `.mcp.json` (si usas MCP)
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=TU_NUEVO_PROJECT_REF"
    }
  }
}
```

#### Actualizar `supabase/config.toml`
Ya está configurado correctamente, pero verifica si necesitas cambiar algo.

### 7. Migrar Datos (Opcional)

Si necesitas migrar datos existentes:

1. **Exportar datos de la cuenta antigua:**
   - Usa `pg_dump` o el export tool de Supabase
   - O exporta manualmente desde el dashboard

2. **Importar datos a la cuenta nueva:**
   - Usa `psql` para importar
   - O importa manualmente desde el dashboard

**⚠️ IMPORTANTE:**
- No migres la tabla `auth.users` directamente (crea conflictos)
- Crea usuarios manualmente o con el sistema de registro
- Actualiza los `user_id` en las tablas relacionadas después de crear usuarios

### 8. Verificar Configuración

1. Verifica que todas las migraciones se aplicaron correctamente
2. Verifica que las Edge Functions están desplegadas y funcionan
3. Verifica que las variables de entorno están configuradas
4. Prueba la autenticación
5. Prueba crear una reserva
6. Prueba el flujo de pago (si está habilitado)

### 9. Actualizar URLs y Referencias

Busca y reemplaza en el código cualquier referencia hardcodeada al proyecto anterior:
- URLs de Supabase
- Project references
- Keys (aunque deberían estar en variables de entorno)

---

## 📌 Notas Importantes

1. **Seguridad:**
   - NUNCA expongas `SUPABASE_SERVICE_ROLE_KEY` en el frontend
   - Solo úsala en Edge Functions o en el backend
   - Revisa todas las políticas RLS después de la migración

2. **Cron Jobs:**
   - El cron job de sincronización automática se crea en la migración 006
   - Verifica que funcione: `SELECT * FROM calendar_sync_jobs;`
   - Para ver el historial: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`

3. **Tokens de Exportación:**
   - Cada propiedad tiene un token único para exportar calendarios
   - Los tokens se generan automáticamente al crear propiedades
   - La URL pública es: `https://tu-proyecto.supabase.co/functions/v1/export-calendar/{token}`

4. **Bloqueos de Calendario:**
   - Las reservas sincronizadas de plataformas externas se marcan como `is_calendar_block = true`
   - Estos bloqueos tienen `total_price = 0` y no generan ingresos
   - Se identifican por el patrón de email: `external-*@enecc.com`

5. **Backup:**
   - Antes de migrar, haz un backup completo de la base de datos anterior
   - Exporta todas las configuraciones y datos importantes

---

## ✅ Checklist de Migración

- [ ] Nuevo proyecto de Supabase creado
- [ ] Variables de entorno del frontend configuradas (`.env`)
- [ ] Variables de entorno de Edge Functions configuradas
- [ ] Migración 001 aplicada (payment_settings)
- [ ] Migración 002 aplicada (stripe fields)
- [ ] Migración 003 aplicada (admin access)
- [ ] Migración 004 aplicada (calendar export tokens)
- [ ] Migración 005 aplicada (RLS policies)
- [ ] Migración 006 aplicada (auto sync - **actualizar valores hardcodeados**)
- [ ] Migración 007 aplicada (calendar block flag)
- [ ] Edge Function `create-checkout-session` desplegada
- [ ] Edge Function `export-calendar` desplegada
- [ ] Edge Function `sync-calendar` desplegada
- [ ] Edge Function `verify-payment` desplegada
- [ ] Extensiones `pg_cron` y `pg_net` habilitadas
- [ ] Políticas RLS verificadas
- [ ] Datos migrados (si aplica)
- [ ] Usuarios creados/verificados
- [ ] Autenticación probada
- [ ] Reservas probadas
- [ ] Pagos probados (si aplica)
- [ ] Sincronización de calendarios probada
- [ ] Exportación de calendarios probada
- [ ] Cron job de sincronización verificada
- [ ] `.mcp.json` actualizado (si aplica)
- [ ] Documentación del proyecto actualizada

---

## 🔗 Referencias Útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [pg_cron Documentation](https://github.com/citusdata/pg_cron)

---

**Última actualización:** $(date)
**Versión del documento:** 1.0

