/**
 * Utilidades para manejar archivos iCalendar (.ics)
 * Compatible con Airbnb, Booking.com, VRBO y otros servicios
 */

/**
 * Parsea un archivo iCalendar y extrae los eventos (reservas)
 * @param {string} icsContent - Contenido del archivo .ics
 * @returns {Array} Array de eventos con check_in, check_out, summary, uid
 */
export const parseICalendar = (icsContent) => {
  const events = []

  // Dividir por eventos (VEVENT)
  const eventBlocks = icsContent.split('BEGIN:VEVENT')

  eventBlocks.forEach((block, index) => {
    // Saltar el primer bloque (header del calendario)
    if (index === 0) return

    // Asegurar que el bloque termine en END:VEVENT
    if (!block.includes('END:VEVENT')) return

    const event = {}
    const lines = block.split(/\r?\n/)

    lines.forEach(line => {
      line = line.trim()

      // UID (identificador único del evento)
      if (line.startsWith('UID:')) {
        event.uid = line.substring(4).trim()
      }

      // DTSTART (fecha de inicio)
      if (line.startsWith('DTSTART')) {
        const dateMatch = line.match(/[:;](\d{8})/)
        if (dateMatch) {
          const dateStr = dateMatch[1]
          // Formato: YYYYMMDD -> YYYY-MM-DD
          event.check_in = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
        }
      }

      // DTEND (fecha de fin)
      if (line.startsWith('DTEND')) {
        const dateMatch = line.match(/[:;](\d{8})/)
        if (dateMatch) {
          const dateStr = dateMatch[1]
          event.check_out = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
        }
      }

      // SUMMARY (resumen/título del evento)
      if (line.startsWith('SUMMARY:')) {
        event.summary = line.substring(8).trim()
      }

      // DESCRIPTION (descripción)
      if (line.startsWith('DESCRIPTION:')) {
        event.description = line.substring(12).trim()
      }
    })

    // Solo agregar eventos con fechas válidas
    if (event.check_in && event.check_out && event.uid) {
      events.push(event)
    }
  })

  return events
}

/**
 * Genera un archivo iCalendar (.ics) a partir de las reservas
 * @param {Array} bookings - Array de reservas
 * @param {Object} property - Información de la propiedad
 * @returns {string} Contenido del archivo .ics
 */
export const generateICalendar = (bookings, property) => {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ENECC//Property Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${property.name}`,
    `X-WR-CALDESC:Reservas para ${property.name}`,
    'X-WR-TIMEZONE:UTC'
  ]

  bookings.forEach(booking => {
    // Convertir fechas a formato iCalendar (YYYYMMDD)
    const checkIn = booking.check_in.replace(/-/g, '')
    const checkOut = booking.check_out.replace(/-/g, '')

    // UID único para cada reserva
    const uid = booking.id || `${checkIn}-${checkOut}-${Date.now()}`

    ics.push(
      'BEGIN:VEVENT',
      `UID:${uid}@enecc.com`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${checkIn}`,
      `DTEND;VALUE=DATE:${checkOut}`,
      `SUMMARY:Reservado - ${booking.user_name || 'Cliente'}`,
      `DESCRIPTION:Reserva de ${booking.guests || 1} huésped(es)`,
      `LOCATION:${property.location}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    )
  })

  ics.push('END:VCALENDAR')

  return ics.join('\r\n')
}

/**
 * Importa reservas desde una URL de iCalendar
 * @param {string} icalUrl - URL del archivo .ics
 * @returns {Promise<Array>} Array de eventos parseados
 */
export const importFromICalendarURL = async (icalUrl) => {
  if (!icalUrl || !icalUrl.trim()) {
    throw new Error('URL de iCalendar no válida')
  }

  try {
    const response = await fetch(icalUrl)

    if (!response.ok) {
      throw new Error(`Error al obtener calendario: ${response.status} ${response.statusText}`)
    }

    const icsContent = await response.text()
    return parseICalendar(icsContent)
  } catch (error) {
    console.error('Error importando desde iCalendar:', error)
    throw error
  }
}

/**
 * Sincroniza todas las URLs de iCalendar de una propiedad
 * @param {Object} property - Propiedad con URLs de iCalendar configuradas
 * @returns {Promise<Array>} Array con todas las reservas sincronizadas
 */
export const syncAllCalendars = async (property) => {
  const allEvents = []
  const urls = []

  // Recolectar todas las URLs configuradas
  if (property.airbnb_ical_url) urls.push({ source: 'airbnb', url: property.airbnb_ical_url })
  if (property.booking_ical_url) urls.push({ source: 'booking', url: property.booking_ical_url })
  if (property.vrbo_ical_url) urls.push({ source: 'vrbo', url: property.vrbo_ical_url })
  if (property.other_ical_urls && property.other_ical_urls.length > 0) {
    property.other_ical_urls.forEach((url, index) => {
      urls.push({ source: `other_${index}`, url })
    })
  }

  // Importar en paralelo
  const results = await Promise.allSettled(
    urls.map(async ({ source, url }) => {
      try {
        const events = await importFromICalendarURL(url)
        return events.map(event => ({ ...event, source }))
      } catch (error) {
        console.error(`Error sincronizando ${source}:`, error)
        return []
      }
    })
  )

  // Combinar todos los resultados exitosos
  results.forEach(result => {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allEvents.push(...result.value)
    }
  })

  // Eliminar duplicados basándose en las fechas
  const uniqueEvents = []
  const seen = new Set()

  allEvents.forEach(event => {
    const key = `${event.check_in}-${event.check_out}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueEvents.push(event)
    }
  })

  return uniqueEvents
}

/**
 * Calcula el número de noches entre dos fechas
 * @param {string} checkIn - Fecha de check-in (YYYY-MM-DD)
 * @param {string} checkOut - Fecha de check-out (YYYY-MM-DD)
 * @returns {number} Número de noches
 */
export const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Verifica si hay solapamiento entre dos rangos de fechas
 * @param {string} start1 - Inicio del primer rango
 * @param {string} end1 - Fin del primer rango
 * @param {string} start2 - Inicio del segundo rango
 * @param {string} end2 - Fin del segundo rango
 * @returns {boolean} True si hay solapamiento
 */
export const hasDateOverlap = (start1, end1, start2, end2) => {
  const s1 = new Date(start1)
  const e1 = new Date(end1)
  const s2 = new Date(start2)
  const e2 = new Date(end2)

  return s1 < e2 && s2 < e1
}

/**
 * Descarga un archivo .ics
 * @param {string} content - Contenido del archivo
 * @param {string} filename - Nombre del archivo
 */
export const downloadICS = (content, filename = 'calendar.ics') => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
