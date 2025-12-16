/**
 * Utilidades comunes para manejo de reservas y disponibilidad
 */

/**
 * Verifica si hay solapamiento entre dos rangos de fechas
 * @param {string|Date} start1 - Inicio del primer rango
 * @param {string|Date} end1 - Fin del primer rango
 * @param {string|Date} start2 - Inicio del segundo rango
 * @param {string|Date} end2 - Fin del segundo rango
 * @returns {boolean} True si hay solapamiento
 */
export const hasDateOverlap = (start1, end1, start2, end2) => {
  const s1 = new Date(start1)
  const e1 = new Date(end1)
  const s2 = new Date(start2)
  const e2 = new Date(end2)

  // Verificar si hay solapamiento: start1 < end2 && start2 < end1
  return s1 < e2 && s2 < e1
}

/**
 * Calcula el número de noches entre dos fechas
 * @param {string|Date} checkIn - Fecha de check-in
 * @param {string|Date} checkOut - Fecha de check-out
 * @returns {number} Número de noches
 */
export const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getTodayDateString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Genera un array con todas las fechas entre dos fechas (excluyendo la fecha final)
 * @param {string|Date} startDate - Fecha de inicio
 * @param {string|Date} endDate - Fecha de fin
 * @returns {string[]} Array de fechas en formato YYYY-MM-DD
 */
export const generateDateRange = (startDate, endDate) => {
  const dates = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    dates.push(dateString)
  }

  return dates
}

/**
 * Verifica si una propiedad está disponible para un rango de fechas específico
 * @param {string} propertyId - ID de la propiedad
 * @param {string} checkIn - Fecha de check-in
 * @param {string} checkOut - Fecha de check-out
 * @param {Array} bookings - Array de reservas confirmadas
 * @returns {boolean} True si la propiedad está disponible
 */
export const isPropertyAvailable = (propertyId, checkIn, checkOut, bookings) => {
  if (!checkIn || !checkOut) {
    return true
  }

  const propertyBookings = bookings.filter(b => b.property_id === propertyId)

  // Verificar si alguna reserva se solapa con las fechas seleccionadas
  return !propertyBookings.some(booking =>
    hasDateOverlap(checkIn, checkOut, booking.check_in, booking.check_out)
  )
}
