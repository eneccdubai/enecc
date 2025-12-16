import React, { useState, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users as UsersIcon, MapPin, Home, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useProperties } from '../contexts/PropertiesContext'
import { useBookings } from '../contexts/BookingsContext'
import { supabase } from '../supabase/config'
import { sanitizeString } from '../utils/security'
import { isPaymentsEnabled } from '../utils/paymentSettings'
import { createCheckoutSession } from '../utils/stripeApi'
import { DATA_SOURCE } from '../config/dataSource'
import { addLocalBooking, updateLocalBooking } from '../utils/localDB'

const BookingForm = () => {
  const { currentUser } = useAuth()
  const { language } = useLanguage()
  const { properties, loading } = useProperties()
  const { refreshBookings } = useBookings()
  const navigate = useNavigate()

  const [submitting, setSubmitting] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [status, setStatus] = useState(null)
  const [paymentsEnabled, setPaymentsEnabled] = useState(false)
  const [redirectingToPayment, setRedirectingToPayment] = useState(false)

  const [formData, setFormData] = useState({
    propertyId: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  })

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  // Verificar si los pagos están habilitados
  useEffect(() => {
    const checkPaymentsEnabled = async () => {
      try {
        const enabled = await isPaymentsEnabled()
        setPaymentsEnabled(enabled)
      } catch (error) {
        console.error('Error checking payment settings:', error)
        setPaymentsEnabled(false)
      }
    }
    checkPaymentsEnabled()
  }, [])

  const handlePropertyChange = (propertyId) => {
    const property = properties.find(p => p.id === propertyId)
    setSelectedProperty(property)
    setFormData({ ...formData, propertyId, guests: 1 })
  }

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0
    const checkIn = new Date(formData.checkIn)
    const checkOut = new Date(formData.checkOut)
    const diffTime = Math.abs(checkOut - checkIn)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotalPrice = () => {
    if (!selectedProperty) return 0
    const nights = calculateNights()
    return nights * selectedProperty.price_per_night
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)

    // Validación de propiedad seleccionada
    if (!selectedProperty) {
      setStatus({
        type: 'error',
        message: language === 'es'
          ? 'Debe seleccionar una propiedad'
          : 'You must select a property'
      })
      setSubmitting(false)
      return
    }

    // Validación de huéspedes
    const guestsNum = parseInt(formData.guests)
    if (isNaN(guestsNum) || guestsNum < 1 || guestsNum > 100) {
      setStatus({
        type: 'error',
        message: language === 'es'
          ? 'Número de huéspedes inválido'
          : 'Invalid number of guests'
      })
      setSubmitting(false)
      return
    }

    if (guestsNum > selectedProperty.max_guests) {
      setStatus({
        type: 'error',
        message: language === 'es'
          ? `Esta propiedad solo permite hasta ${selectedProperty.max_guests} huéspedes`
          : `This property only allows up to ${selectedProperty.max_guests} guests`
      })
      setSubmitting(false)
      return
    }

    // Validación de fechas
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkIn = new Date(formData.checkIn)
    const checkOut = new Date(formData.checkOut)

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      setStatus({
        type: 'error',
        message: language === 'es'
          ? 'Fechas inválidas'
          : 'Invalid dates'
      })
      setSubmitting(false)
      return
    }

    if (checkIn < today) {
      setStatus({
        type: 'error',
        message: language === 'es'
          ? 'La fecha de entrada no puede ser en el pasado'
          : 'Check-in date cannot be in the past'
      })
      setSubmitting(false)
      return
    }

    if (checkOut <= checkIn) {
      setStatus({
        type: 'error',
        message: language === 'es'
          ? 'La fecha de salida debe ser posterior a la fecha de entrada'
          : 'Check-out date must be after check-in date'
      })
      setSubmitting(false)
      return
    }

    const nights = calculateNights()

    // Validar que la estadía no sea excesivamente larga (máximo 90 días)
    if (nights > 90) {
      setStatus({
        type: 'error',
        message: language === 'es'
          ? 'La estadía máxima es de 90 días'
          : 'Maximum stay is 90 days'
      })
      setSubmitting(false)
      return
    }

    // ✅ VALIDAR DISPONIBILIDAD: Verificar que las fechas no estén ocupadas
    try {
      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('check_in, check_out, user_name, user_email')
        .eq('property_id', formData.propertyId)
        .eq('status', 'confirmed')

      if (checkError) {
        console.error('Error verificando disponibilidad:', checkError)
      } else if (existingBookings && existingBookings.length > 0) {
        // Verificar solapamiento con reservas existentes
        const hasConflict = existingBookings.some(booking => {
          const existingCheckIn = new Date(booking.check_in)
          const existingCheckOut = new Date(booking.check_out)

          // Verificar si hay solapamiento: start1 < end2 && start2 < end1
          return checkIn < existingCheckOut && existingCheckIn < checkOut
        })

        if (hasConflict) {
          const conflictingBooking = existingBookings.find(booking => {
            const existingCheckIn = new Date(booking.check_in)
            const existingCheckOut = new Date(booking.check_out)
            return checkIn < existingCheckOut && existingCheckIn < checkOut
          })

          const isExternalBooking = conflictingBooking?.user_email?.includes('external-') ||
                                   conflictingBooking?.user_name?.includes('Reserva ')

          setStatus({
            type: 'error',
            message: language === 'es'
              ? `Las fechas seleccionadas no están disponibles. ${isExternalBooking ? 'Esta propiedad tiene una reserva de Airbnb/Booking.com en esas fechas.' : 'Hay una reserva existente en esas fechas.'} Por favor, elige otras fechas.`
              : `Selected dates are not available. ${isExternalBooking ? 'This property has an Airbnb/Booking.com reservation on those dates.' : 'There is an existing booking on those dates.'} Please choose different dates.`
          })
          setSubmitting(false)
          return
        }
      }
    } catch (availabilityError) {
      console.error('Error al verificar disponibilidad:', availabilityError)
      // Continuar con la reserva si no se puede verificar (para no bloquear el flujo)
    }

    const totalPrice = calculateTotalPrice()

    // Sanitizar datos antes de guardar
    const sanitizedUserName = sanitizeString(currentUser.displayName || currentUser.email || 'Guest')
    const sanitizedPropertyName = sanitizeString(selectedProperty.name)
    const sanitizedPropertyLocation = sanitizeString(selectedProperty.location)

    try {
      let bookingId
      let bookingData

      // Crear la reserva según el modo (local o Supabase)
      if (DATA_SOURCE === 'local') {
        // Modo local: guardar en localStorage
        bookingData = addLocalBooking({
          user_id: currentUser.uid,
          user_email: currentUser.email,
          user_name: sanitizedUserName,
          property_id: formData.propertyId,
          property_name: sanitizedPropertyName,
          property_location: sanitizedPropertyLocation,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          guests: guestsNum,
          nights,
          total_price: totalPrice,
          status: paymentsEnabled ? 'pending_payment' : 'confirmed',
          payment_status: paymentsEnabled ? 'pending' : null
        })
        bookingId = bookingData.id
      } else {
        // Modo Supabase: guardar en la base de datos
        const { data, error: bookingError } = await supabase
          .from('bookings')
          .insert({
            user_id: currentUser.uid,
            user_email: currentUser.email,
            user_name: sanitizedUserName,
            property_id: formData.propertyId,
            property_name: sanitizedPropertyName,
            property_location: sanitizedPropertyLocation,
            check_in: formData.checkIn,
            check_out: formData.checkOut,
            guests: guestsNum,
            nights,
            total_price: totalPrice,
            status: paymentsEnabled ? 'pending_payment' : 'confirmed',
            payment_status: paymentsEnabled ? 'pending' : null
          })
          .select()
          .single()

        if (bookingError) throw bookingError
        bookingData = data
        bookingId = bookingData.id
      }

      // Si los pagos están habilitados, crear sesión de Stripe y redirigir
      // Nota: Stripe solo funciona en modo Supabase
      if (paymentsEnabled && DATA_SOURCE === 'supabase') {
        setRedirectingToPayment(true)
        setStatus({
          type: 'info',
          message: language === 'es'
            ? 'Redirigiendo a la pasarela de pago...'
            : 'Redirecting to payment gateway...'
        })

        try {
          const session = await createCheckoutSession({
            booking_id: bookingId,
            total_price: totalPrice,
            property_name: sanitizedPropertyName,
            check_in: formData.checkIn,
            check_out: formData.checkOut
          })

          // Redirigir a Stripe Checkout
          if (session.url) {
            window.location.href = session.url
          } else {
            throw new Error('No se recibió URL de pago')
          }
        } catch (stripeError) {
          console.error('Error creating Stripe session:', stripeError)
          setRedirectingToPayment(false)
          setStatus({
            type: 'error',
            message: language === 'es'
              ? `Error al procesar el pago: ${stripeError.message || 'Intenta de nuevo más tarde'}`
              : `Error processing payment: ${stripeError.message || 'Please try again later'}`
          })
          setSubmitting(false)
          
          // Actualizar el estado de la reserva a error
          await supabase
            .from('bookings')
            .update({ status: 'error', payment_status: 'failed' })
            .eq('id', bookingId)
        }
      } else {
        // Flujo sin Stripe (comportamiento original)
        setStatus({
          type: 'success',
          message: language === 'es'
            ? '¡Reservación creada exitosamente!'
            : 'Booking created successfully!'
        })

        // Actualizar el listado de reservas en el contexto
        await refreshBookings()

        // Navegar a la página de reservas para que el usuario vea su nueva reserva
        setTimeout(() => {
          navigate('/my-bookings')
        }, 1500)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      setStatus({
        type: 'error',
        message: language === 'es'
          ? 'Error al crear la reservación. Intenta de nuevo.'
          : 'Error creating booking. Please try again.'
      })
      setSubmitting(false)
      setRedirectingToPayment(false)
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-light text-stone-900 mb-3 sm:mb-4 tracking-tight">
            {language === 'es' ? 'Nueva Reservación' : 'New Booking'}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm font-light tracking-wide px-4">
            {language === 'es'
              ? 'Completa la información para reservar tu estadía'
              : 'Complete the information to book your stay'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
          {/* Property Selection */}
          <div>
            <label className="block text-xs font-light text-stone-500 mb-4 tracking-widest uppercase">
              {language === 'es' ? 'Selecciona una propiedad' : 'Select a property'}
            </label>

            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8 sm:py-12 border border-stone-200 bg-stone-50 px-4">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-stone-300" />
                <h3 className="text-base sm:text-lg font-display font-light text-stone-900 mb-2 tracking-tight">
                  {language === 'es' ? 'No hay propiedades disponibles' : 'No properties available'}
                </h3>
                <p className="text-stone-500 text-xs sm:text-sm font-light tracking-wide mb-4">
                  {language === 'es'
                    ? 'Por favor, contacta al administrador para agregar propiedades'
                    : 'Please contact the administrator to add properties'}
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-stone-600 hover:text-stone-900 text-xs sm:text-sm font-light tracking-wide transition-colors touch-manipulation"
                >
                  {language === 'es' ? 'Volver al inicio' : 'Back to home'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => handlePropertyChange(property.id)}
                    className={`border-2 p-4 sm:p-6 cursor-pointer transition-all touch-manipulation ${
                      formData.propertyId === property.id
                        ? 'border-stone-900 bg-stone-50'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                      <div className="flex-1 w-full sm:w-auto">
                        <h3 className="text-lg sm:text-xl font-display text-stone-900 mb-2 tracking-tight">
                          {property.name}
                        </h3>
                        <div className="flex items-center text-xs sm:text-sm text-stone-500 font-light mb-2 sm:mb-3">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{property.location}</span>
                        </div>
                        <div className="text-xs sm:text-sm font-light text-stone-600">
                          {property.bedrooms} {language === 'es' ? 'hab' : 'bed'} •{' '}
                          {property.bathrooms} {language === 'es' ? 'baños' : 'bath'} •{' '}
                          {language === 'es' ? 'hasta' : 'up to'} {property.max_guests} {language === 'es' ? 'huésp' : 'guests'}
                        </div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <div className="text-2xl sm:text-3xl font-semibold text-stone-900">
                          ${property.price_per_night}
                        </div>
                        <div className="text-xs text-stone-400 font-light tracking-wide uppercase mt-1">
                          {language === 'es' ? 'por noche' : 'per night'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dates and Guests */}
          {formData.propertyId && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Check-in */}
                <div>
                  <label className="block text-xs font-light text-stone-500 mb-4 tracking-widest uppercase flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Fecha de entrada' : 'Check-in date'}
                  </label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    min={getTodayDate()}
                    required
                    className="w-full px-0 py-3 sm:py-4 border-0 border-b-2 border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-base sm:text-lg font-light"
                  />
                </div>

                {/* Check-out */}
                <div>
                  <label className="block text-xs font-light text-stone-500 mb-4 tracking-widest uppercase flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Fecha de salida' : 'Check-out date'}
                  </label>
                  <input
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    min={formData.checkIn || getTomorrowDate()}
                    required
                    className="w-full px-0 py-3 sm:py-4 border-0 border-b-2 border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-base sm:text-lg font-light"
                  />
                </div>
              </div>

              {/* Number of Guests */}
              <div>
                <label className="block text-xs font-light text-stone-500 mb-4 tracking-widest uppercase flex items-center">
                  <UsersIcon className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Número de huéspedes' : 'Number of guests'}
                </label>
                <input
                  type="number"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                  min="1"
                  max={selectedProperty?.max_guests || 10}
                  required
                  className="w-full px-0 py-3 sm:py-4 border-0 border-b-2 border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-base sm:text-lg font-light"
                />
                <p className="text-xs text-stone-400 mt-2 font-light">
                  {language === 'es' ? 'Máximo' : 'Maximum'}: {selectedProperty?.max_guests} {language === 'es' ? 'huéspedes' : 'guests'}
                </p>
              </div>

              {/* Price Summary */}
              {formData.checkIn && formData.checkOut && calculateNights() > 0 && (
                <div className="border-t border-stone-200 pt-6 sm:pt-8">
                  <div className="bg-stone-50 p-4 sm:p-6 md:p-8">
                    <h3 className="text-xl sm:text-2xl font-display font-light text-stone-900 mb-4 sm:mb-6 tracking-tight">
                      {language === 'es' ? 'Resumen de Precio' : 'Price Summary'}
                    </h3>

                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex justify-between text-xs sm:text-sm font-light text-stone-600">
                        <span>
                          ${selectedProperty.price_per_night} × {calculateNights()} {language === 'es' ? 'noches' : 'nights'}
                        </span>
                        <span>${calculateTotalPrice()}</span>
                      </div>
                    </div>

                    <div className="border-t border-stone-200 pt-3 sm:pt-4 flex justify-between items-center">
                      <span className="text-base sm:text-lg font-medium text-stone-900">
                        {language === 'es' ? 'Total' : 'Total'}
                      </span>
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900">
                        ${calculateTotalPrice()}
                      </span>
                    </div>

                    <div className="mt-4 sm:mt-6 text-xs text-stone-500 font-light space-y-1">
                      <p>
                        {language === 'es' ? 'Check-in:' : 'Check-in:'} {formatDate(formData.checkIn)}
                      </p>
                      <p>
                        {language === 'es' ? 'Check-out:' : 'Check-out:'} {formatDate(formData.checkOut)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {status && (
                <div className={`flex items-start space-x-2 py-4 border-l-2 pl-4 ${
                  status.type === 'success'
                    ? 'border-emerald-300 text-emerald-700'
                    : status.type === 'info'
                    ? 'border-blue-300 text-blue-700'
                    : 'border-red-300 text-red-700'
                }`}>
                  {status.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : status.type === 'info' ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5"></div>
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-light leading-relaxed">{status.message}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || redirectingToPayment || !formData.checkIn || !formData.checkOut}
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-light py-4 sm:py-5 md:py-6 transition-all disabled:cursor-not-allowed text-sm tracking-widest uppercase touch-manipulation"
              >
                {submitting || redirectingToPayment ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>
                      {redirectingToPayment
                        ? (language === 'es' ? 'Redirigiendo a pago...' : 'Redirecting to payment...')
                        : (language === 'es' ? 'Procesando...' : 'Processing...')
                      }
                    </span>
                  </div>
                ) : (
                  paymentsEnabled
                    ? (language === 'es' ? 'Continuar al Pago' : 'Continue to Payment')
                    : (language === 'es' ? 'Confirmar Reservación' : 'Confirm Booking')
                )}
              </button>
            </>
          )}
        </form>

        {/* Back to Dashboard */}
        <div className="text-center mt-12 pt-12 border-t border-stone-200">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-stone-400 hover:text-stone-700 text-xs font-light tracking-wider transition-colors uppercase flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>{language === 'es' ? 'Volver al Dashboard' : 'Back to Dashboard'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(BookingForm)
