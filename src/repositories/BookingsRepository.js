/**
 * BookingsRepository
 *
 * Capa de lógica de negocio para reservas.
 * Maneja validaciones y transformaciones.
 */

import dataAdapter from '../adapters'

class BookingsRepository {
  constructor() {
    this.adapter = dataAdapter
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Obtiene todas las reservas (con filtros opcionales)
   */
  async getAll(filters = {}) {
    return await this.adapter.getBookings(filters)
  }

  /**
   * Obtiene reservas de un usuario específico
   */
  async getByUserId(userId) {
    return await this.adapter.getBookings({ user_id: userId })
  }

  /**
   * Obtiene reservas de una propiedad específica
   */
  async getByPropertyId(propertyId) {
    return await this.adapter.getBookings({ property_id: propertyId })
  }

  /**
   * Obtiene una reserva por ID
   */
  async getById(id) {
    return await this.adapter.getBookingById(id)
  }

  /**
   * Crea una nueva reserva
   */
  async create(bookingData) {
    // Validaciones básicas
    this._validateBookingData(bookingData)

    return await this.adapter.createBooking(bookingData)
  }

  /**
   * Actualiza una reserva
   */
  async update(id, updates) {
    return await this.adapter.updateBooking(id, updates)
  }

  /**
   * Elimina una reserva
   */
  async delete(id) {
    return await this.adapter.deleteBooking(id)
  }

  /**
   * Actualiza el estado de una reserva
   */
  async updateStatus(id, status) {
    return await this.update(id, { status })
  }

  /**
   * Actualiza el estado de pago de una reserva
   */
  async updatePaymentStatus(id, paymentStatus) {
    return await this.update(id, { payment_status: paymentStatus })
  }

  // ============================================
  // VALIDATIONS
  // ============================================

  _validateBookingData(bookingData) {
    const required = ['property_id', 'check_in', 'check_out', 'guests']

    for (const field of required) {
      if (!bookingData[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Validar fechas
    const checkIn = new Date(bookingData.check_in)
    const checkOut = new Date(bookingData.check_out)

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new Error('Invalid dates')
    }

    if (checkOut <= checkIn) {
      throw new Error('Check-out must be after check-in')
    }

    // Validar huéspedes
    const guests = parseInt(bookingData.guests)
    if (isNaN(guests) || guests < 1) {
      throw new Error('Invalid number of guests')
    }
  }
}

// Exportar instancia singleton
export default new BookingsRepository()
