# Variables de Entorno para Edge Functions

⚠️ **IMPORTANTE**: Después de migrar a un nuevo proyecto de Supabase, debes configurar estas variables de entorno en el Dashboard de Supabase.

## Cómo Configurar

1. Ve a tu proyecto en Supabase Dashboard: https://supabase.com/dashboard/project/grmsqbcyzgonwvbmoeex
2. Navega a **Edge Functions** → **Secrets**
3. Agrega cada una de las variables listadas abajo

## Variables Requeridas para `create-checkout-session`

### 1. `SUPABASE_URL`
- **Valor**: `https://grmsqbcyzgonwvbmoeex.supabase.co`
- **Descripción**: URL de tu proyecto de Supabase
- **Dónde encontrarlo**: Dashboard → Settings → API → Project URL

### 2. `SUPABASE_SERVICE_ROLE_KEY`
- **Valor**: Tu service_role key (empieza con `eyJ...`)
- **Descripción**: Service Role Key (¡NUNCA exponer en el frontend!)
- **Dónde encontrarlo**: Dashboard → Settings → API → service_role key
- **⚠️ IMPORTANTE**: Esta clave tiene acceso completo a tu base de datos, mantenla secreta

### 3. `STRIPE_SECRET_KEY`
- **Valor**: Tu clave secreta de Stripe (empieza con `sk_test_...` o `sk_live_...`)
- **Descripción**: Clave secreta de Stripe para crear sesiones de pago
- **Dónde encontrarlo**: Dashboard de Stripe → Developers → API keys → Secret key

### 4. `PAYMENTS_ENABLED`
- **Valor**: `true`
- **Descripción**: Habilita o deshabilita los pagos
- **Tipo**: String (debe ser exactamente `"true"` como string)

### 5. `STRIPE_SUCCESS_URL` (Opcional, tiene default)
- **Valor**: `/my-bookings?payment=success`
- **Descripción**: URL a la que redirigir después de un pago exitoso
- **Default**: `/my-bookings?payment=success`

### 6. `STRIPE_CANCEL_URL` (Opcional, tiene default)
- **Valor**: `/booking?payment=cancelled`
- **Descripción**: URL a la que redirigir si el usuario cancela el pago
- **Default**: `/booking?payment=cancelled`

### 7. `STRIPE_DEFAULT_PRICE_ID` (Opcional)
- **Valor**: ID de un precio/producto en Stripe (ej: `price_xxxxx`)
- **Descripción**: Si quieres usar un precio predefinido en lugar de crear uno dinámico
- **Default**: Se crea un precio dinámico por cada reserva

## Variables Requeridas para Otras Edge Functions

### `export-calendar` y `sync-calendar`
- `SUPABASE_URL`: `https://grmsqbcyzgonwvbmoeex.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: Tu service_role key

### `verify-payment`
- `SUPABASE_URL`: `https://grmsqbcyzgonwvbmoeex.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: Tu service_role key
- `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe

## Verificar Configuración

Después de configurar las variables, prueba crear una reserva con pago. Si ves errores como:

- `"SUPABASE_URL no está configurada..."`
- `"STRIPE_SECRET_KEY no está configurada..."`
- `"Los pagos no están habilitados..."`

Significa que falta configurar esa variable específica en el Dashboard.

## Notas

- Las variables de entorno son específicas para cada proyecto de Supabase
- Si migras a otro proyecto, debes configurarlas de nuevo
- Las variables se configuran por función, no globalmente (aunque Supabase permite compartirlas)

