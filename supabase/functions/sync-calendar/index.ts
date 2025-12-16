import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Parsea un archivo iCalendar y extrae los eventos (reservas)
 */
function parseICalendar(icsContent: string): any[] {
  const events = []
  const eventBlocks = icsContent.split('BEGIN:VEVENT')

  eventBlocks.forEach((block, index) => {
    if (index === 0) return
    if (!block.includes('END:VEVENT')) return

    const event: any = {}
    const lines = block.split(/\r?\n/)

    lines.forEach(line => {
      line = line.trim()

      if (line.startsWith('UID:')) {
        event.uid = line.substring(4).trim()
      }

      if (line.startsWith('DTSTART')) {
        const dateMatch = line.match(/[:;](\d{8})/)
        if (dateMatch) {
          const dateStr = dateMatch[1]
          event.check_in = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
        }
      }

      if (line.startsWith('DTEND')) {
        const dateMatch = line.match(/[:;](\d{8})/)
        if (dateMatch) {
          const dateStr = dateMatch[1]
          event.check_out = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
        }
      }

      if (line.startsWith('SUMMARY:')) {
        event.summary = line.substring(8).trim()
      }

      if (line.startsWith('DESCRIPTION:')) {
        event.description = line.substring(12).trim()
      }
    })

    if (event.check_in && event.check_out && event.uid) {
      events.push(event)
    }
  })

  return events
}

/**
 * Verifica si hay solapamiento entre dos rangos de fechas
 */
function hasDateOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = new Date(start1)
  const e1 = new Date(end1)
  const s2 = new Date(start2)
  const e2 = new Date(end2)
  return s1 < e2 && s2 < e1
}

/**
 * Calcula el número de noches entre dos fechas
 */
function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
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

    // Inicializar cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener el property_id del body
    const { property_id } = await req.json()

    if (!property_id) {
      return new Response(JSON.stringify({ error: 'property_id requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Obtener la propiedad con sus URLs de calendario
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .single()

    if (propertyError) throw propertyError
    if (!property) throw new Error('Propiedad no encontrada')

    // 2. Verificar que la sincronización esté habilitada
    if (!property.ical_sync_enabled) {
      return new Response(JSON.stringify({
        success: false,
        message: 'La sincronización no está habilitada para esta propiedad'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Recolectar todas las URLs configuradas
    const urls = []
    if (property.airbnb_ical_url) urls.push({ source: 'airbnb', url: property.airbnb_ical_url })
    if (property.booking_ical_url) urls.push({ source: 'booking', url: property.booking_ical_url })
    if (property.vrbo_ical_url) urls.push({ source: 'vrbo', url: property.vrbo_ical_url })

    if (urls.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No hay URLs de calendario configuradas'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Importar eventos de todos los calendarios externos
    const allEvents = []
    for (const { source, url } of urls) {
      try {
        console.log(`Fetching calendar from ${source}:`, url)
        const response = await fetch(url)
        if (!response.ok) {
          console.error(`Error fetching ${source}: ${response.status}`)
          continue
        }
        const icsContent = await response.text()
        const events = parseICalendar(icsContent)
        allEvents.push(...events.map(e => ({ ...e, source })))
        console.log(`Imported ${events.length} events from ${source}`)
      } catch (error) {
        console.error(`Error sincronizando ${source}:`, error)
      }
    }

    if (allEvents.length === 0) {
      // Actualizar timestamp de sincronización
      await supabase
        .from('properties')
        .update({ ical_last_sync: new Date().toISOString() })
        .eq('id', property_id)

      return new Response(JSON.stringify({
        success: true,
        imported: 0,
        skipped: 0,
        total: 0,
        message: 'No se encontraron fechas bloqueadas en los calendarios externos'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 5. Obtener reservas existentes para evitar duplicados
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('check_in, check_out')
      .eq('property_id', property_id)
      .eq('status', 'confirmed')

    const existingRanges = existingBookings || []

    // 6. Filtrar eventos que ya existen o se solapan
    const newBookings = []
    let skippedCount = 0

    allEvents.forEach(event => {
      // Verificar si ya existe una reserva con estas fechas
      const alreadyExists = existingRanges.some(booking =>
        booking.check_in === event.check_in && booking.check_out === event.check_out
      )

      if (alreadyExists) {
        skippedCount++
        return
      }

      // Verificar solapamientos
      const hasOverlap = existingRanges.some(booking =>
        hasDateOverlap(event.check_in, event.check_out, booking.check_in, booking.check_out)
      )

      if (hasOverlap) {
        console.warn(`Reserva externa se solapa con una existente: ${event.check_in} - ${event.check_out}`)
        skippedCount++
        return
      }

      // Crear bloqueo de calendario (no es una reserva real)
      const nights = calculateNights(event.check_in, event.check_out)

      newBookings.push({
        property_id: property_id,
        property_name: property.name,
        property_location: property.location,
        check_in: event.check_in,
        check_out: event.check_out,
        guests: 1,
        nights: nights,
        total_price: 0, // Los bloqueos de calendario NO generan ingresos
        is_calendar_block: true, // Marcar como bloqueo de calendario
        status: 'confirmed',
        user_id: null, // Bloqueos externos sin usuario específico
        user_name: `Bloqueo ${event.source || 'Externo'}`,
        user_email: `external-${event.source || 'booking'}@enecc.com`,
        created_at: new Date().toISOString()
      })
    })

    // 7. Insertar nuevas reservas
    let importedCount = 0
    if (newBookings.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('bookings')
        .insert(newBookings)
        .select()

      if (insertError) {
        console.error('Error insertando reservas:', insertError)
        throw insertError
      }

      importedCount = inserted?.length || 0
    }

    // 8. Actualizar timestamp de sincronización
    await supabase
      .from('properties')
      .update({ ical_last_sync: new Date().toISOString() })
      .eq('id', property_id)

    return new Response(JSON.stringify({
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      total: allEvents.length,
      message: `Se bloquearon ${importedCount} fechas nuevas, ${skippedCount} omitidas (ya existían)`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error en sync-calendar:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: `Error al sincronizar: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
