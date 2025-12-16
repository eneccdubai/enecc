/**
 * Servicio de sincronización de calendarios con Supabase
 * Maneja la sincronización bidireccional entre calendarios externos (Airbnb, Booking, etc)
 * y nuestra base de datos local
 */

import { supabase } from '../supabase/config'
import { generateICalendar } from './icalendar'

/**
 * Sincroniza las reservas de calendarios externos a la base de datos
 * Usa un Edge Function para evitar problemas de CORS
 * @param {string} propertyId - ID de la propiedad
 * @returns {Promise<Object>} Resultado de la sincronización
 */
export const syncExternalCalendars = async (propertyId) => {
  try {
    // Obtener URL base de Supabase y la API key
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    // Llamar al Edge Function que maneja todo el proceso server-side
    const response = await fetch(`${supabaseUrl}/functions/v1/sync-calendar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ property_id: propertyId })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error en syncExternalCalendars:', error)
    return {
      success: false,
      error: error.message,
      message: `Error al sincronizar: ${error.message}`
    }
  }
}

/**
 * Exporta las reservas de una propiedad como archivo iCalendar
 * @param {string} propertyId - ID de la propiedad
 * @returns {Promise<string>} Contenido del archivo .ics
 */
export const exportPropertyCalendar = async (propertyId) => {
  try {
    // 1. Obtener la propiedad
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (propertyError) throw propertyError
    if (!property) throw new Error('Propiedad no encontrada')

    // 2. Obtener todas las reservas confirmadas
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .eq('status', 'confirmed')
      .gte('check_out', new Date().toISOString().split('T')[0]) // Solo reservas futuras y actuales

    if (bookingsError) throw bookingsError

    // 3. Generar archivo iCalendar
    const icsContent = generateICalendar(bookings || [], property)

    return icsContent
  } catch (error) {
    console.error('Error exportando calendario:', error)
    throw error
  }
}

/**
 * Actualiza las URLs de iCalendar de una propiedad
 * @param {string} propertyId - ID de la propiedad
 * @param {Object} urls - Objeto con las URLs
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const updateCalendarURLs = async (propertyId, urls) => {
  try {
    const updates = {
      airbnb_ical_url: urls.airbnb || null,
      booking_ical_url: urls.booking || null,
      vrbo_ical_url: urls.vrbo || null,
      other_ical_urls: urls.others || [],
      ical_sync_enabled: urls.syncEnabled !== undefined ? urls.syncEnabled : true
    }

    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data,
      message: 'URLs de calendario actualizadas correctamente'
    }
  } catch (error) {
    console.error('Error actualizando URLs de calendario:', error)
    return {
      success: false,
      error: error.message,
      message: `Error al actualizar: ${error.message}`
    }
  }
}

/**
 * Obtiene la URL pública para exportar el calendario de una propiedad
 * @param {string} propertyId - ID de la propiedad
 * @returns {Promise<string>} URL pública del calendario
 */
export const getExportCalendarURL = async (propertyId) => {
  try {
    const { data: property, error } = await supabase
      .from('properties')
      .select('ical_export_token')
      .eq('id', propertyId)
      .single()

    if (error) throw error
    if (!property || !property.ical_export_token) {
      throw new Error('Token de exportación no encontrado')
    }

    // Obtener URL base de Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

    // Construir URL pública usando la Edge Function de Supabase
    // Formato: https://[project-ref].supabase.co/functions/v1/export-calendar/{token}.ics
    return `${supabaseUrl}/functions/v1/export-calendar/${property.ical_export_token}.ics`
  } catch (error) {
    console.error('Error obteniendo URL de exportación:', error)
    throw error
  }
}

/**
 * Programa una sincronización automática cada 3 horas (como Airbnb)
 * @param {string} propertyId - ID de la propiedad
 * @returns {number} ID del intervalo (para poder cancelarlo después)
 */
export const scheduleAutoSync = (propertyId) => {
  const THREE_HOURS = 3 * 60 * 60 * 1000 // 3 horas en milisegundos

  // Sincronizar inmediatamente
  syncExternalCalendars(propertyId)

  // Programar sincronización cada 3 horas
  const intervalId = setInterval(() => {
    syncExternalCalendars(propertyId)
  }, THREE_HOURS)

  return intervalId
}

/**
 * Cancela una sincronización automática programada
 * @param {number} intervalId - ID del intervalo a cancelar
 */
export const cancelAutoSync = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId)
  }
}
