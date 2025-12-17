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

  -- ⚠️ IMPORTANTE: Actualizar estos valores con tu nuevo proyecto
  -- Si no están configuradas, usar valores por defecto del nuevo proyecto
  IF supabase_url IS NULL THEN
    supabase_url := 'https://grmsqbcyzgonwvbmoeex.supabase.co';
  END IF;

  IF supabase_key IS NULL THEN
    -- Usar anon key del nuevo proyecto (deberás obtenerla del dashboard)
    -- Ve a: Settings → API → anon/public key
    supabase_key := 'TU_NUEVA_ANON_KEY_AQUI';
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
