import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Genera contenido iCalendar a partir de reservas
 */
function generateICalendar(bookings: any[], property: any): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  // Generar VEVENT para cada reserva
  const events = bookings.map((booking, index) => {
    const checkIn = booking.check_in.replace(/[-]/g, '')
    const checkOut = booking.check_out.replace(/[-]/g, '')
    const created = booking.created_at ? new Date(booking.created_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : timestamp

    return `BEGIN:VEVENT
DTSTART;VALUE=DATE:${checkIn}
DTEND;VALUE=DATE:${checkOut}
DTSTAMP:${timestamp}
UID:${booking.id}@enecc.com
CREATED:${created}
DESCRIPTION:Reserva confirmada - ${booking.user_name || 'Cliente'}
LAST-MODIFIED:${timestamp}
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:ENECC - Reservado (${booking.nights} ${booking.nights === 1 ? 'noche' : 'noches'})
TRANSP:OPAQUE
END:VEVENT`
  }).join('\n')

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ENECC Dubai//Booking Calendar 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${property.name}
X-WR-TIMEZONE:Asia/Dubai
${events}
END:VCALENDAR`
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener variables de entorno
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Inicializar cliente de Supabase con service role key (sin autenticación)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Extraer token de la URL: /export-calendar/{token} o /export-calendar/{token}.ics
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const tokenWithExt = pathParts[pathParts.length - 1] // Último segmento
    const token = tokenWithExt.replace('.ics', '') // Remover extensión .ics si existe

    if (!token) {
      return new Response('Token requerido', {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // 1. Buscar la propiedad por su token de exportación
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('ical_export_token', token)
      .single()

    if (propertyError || !property) {
      console.error('Propiedad no encontrada:', propertyError)
      return new Response('Calendario no encontrado', {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Note: La verificación de ical_export_enabled fue removida porque la columna no existe en la tabla

    // 2. Obtener todas las reservas confirmadas de esta propiedad
    // Solo reservas futuras y actuales (check_out >= hoy)
    const today = new Date().toISOString().split('T')[0]

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', property.id)
      .eq('status', 'confirmed')
      .gte('check_out', today)
      .order('check_in', { ascending: true })

    if (bookingsError) {
      console.error('Error obteniendo reservas:', bookingsError)
      return new Response('Error obteniendo reservas', {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // 3. Generar el contenido del archivo iCalendar
    const icsContent = generateICalendar(bookings || [], property)

    // 4. Retornar con el Content-Type correcto para iCalendar
    return new Response(icsContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="${property.name.replace(/\s+/g, '-')}-calendar.ics"`,
        'Cache-Control': 'public, max-age=3600', // Cache de 1 hora
      }
    })
  } catch (error) {
    console.error('Error en export-calendar:', error)
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    })
  }
})
