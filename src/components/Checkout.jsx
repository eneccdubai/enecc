import React, { useState, useEffect, memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Calendar, Users as UsersIcon, MapPin, Home, CheckCircle, AlertCircle, ArrowLeft, CreditCard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useBookings } from '../contexts/BookingsContext'
import { supabase } from '../supabase/config'
import { sanitizeString } from '../utils/security'
import { isPaymentsEnabled } from '../utils/paymentSettings'
import { createCheckoutSession } from '../utils/stripeApi'
import { DATA_SOURCE } from '../config/dataSource'
import { addLocalBooking } from '../utils/localDB'

const Checkout = () => {
  const { currentUser } = useAuth()
  const { language } = useLanguage()
  const { refreshBookings } = useBookings()
  const navigate = useNavigate()
  const location = useLocation()

  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)
  const [paymentsEnabled, setPaymentsEnabled] = useState(false)
  const [redirectingToPayment, setRedirectingToPayment] = useState(false)

  // Obtener propiedad y searchParams del state
  const property = location.state?.property
  const searchParams = location.state?.searchParams || {
    checkIn: '',
    checkOut: '',
    guests: 1
  }

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

  // Redirigir si no hay propiedad
  useEffect(() => {
    if (!property) {
      navigate('/dashboard')
    }
  }, [property, navigate])

  const calculateNights = () => {
    if (!searchParams.checkIn || !searchParams.checkOut) return 0
    const checkIn = new Date(searchParams.checkIn)
    const checkOut = new Date(searchParams.checkOut)
    const diffTime = Math.abs(checkOut - checkIn)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotalPrice = () => {
    if (!property) return 0
    const nights = calculateNights()
    return nights * property.price_per_night
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleConfirmBooking = async () => {
    setSubmitting(true)
    setStatus(null)

    if (!property) {
      navigate('/dashboard')
      return
    }

    // Validación de huéspedes
    const guestsNum = parseInt(searchParams.guests)
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

    if (guestsNum > property.max_guests) {
      setStatus({
        type: 'error',
        message: language === 'es'
          ? `Esta propiedad solo permite hasta ${property.max_guests} huéspedes`
          : `This property only allows up to ${property.max_guests} guests`
      })
      setSubmitting(false)
      return
    }

    // Validación de fechas
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkIn = new Date(searchParams.checkIn)
    const checkOut = new Date(searchParams.checkOut)

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

    const totalPrice = calculateTotalPrice()

    // Sanitizar datos antes de guardar
    const sanitizedUserName = sanitizeString(currentUser.displayName || currentUser.email || 'Guest')
    const sanitizedPropertyName = sanitizeString(property.name)
    const sanitizedPropertyLocation = sanitizeString(property.location)

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
          property_id: property.id,
          property_name: sanitizedPropertyName,
          property_location: sanitizedPropertyLocation,
          check_in: searchParams.checkIn,
          check_out: searchParams.checkOut,
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
            property_id: property.id,
            property_name: sanitizedPropertyName,
            property_location: sanitizedPropertyLocation,
            check_in: searchParams.checkIn,
            check_out: searchParams.checkOut,
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
            check_in: searchParams.checkIn,
            check_out: searchParams.checkOut
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
          if (DATA_SOURCE === 'supabase') {
            await supabase
              .from('bookings')
              .update({ status: 'error', payment_status: 'failed' })
              .eq('id', bookingId)
          }
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

        // Navegar a la página de reservas
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

  if (!currentUser || !property) {
    return null
  }

  const nights = calculateNights()
  const totalPrice = calculateTotalPrice()

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors mb-6 text-sm font-light"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'es' ? 'Volver' : 'Back'}</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-light text-stone-900 mb-3 tracking-tight">
            {language === 'es' ? 'Confirmar Reserva' : 'Confirm Booking'}
          </h1>
          <p className="text-stone-500 text-sm font-light tracking-wide">
            {language === 'es'
              ? 'Revisa los detalles antes de confirmar'
              : 'Review the details before confirming'}
          </p>
        </div>

        {/* Checkout Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Property Summary */}
          <div className="bg-white border border-stone-200 p-6">
            <h2 className="text-xl font-display font-light text-stone-900 mb-4 tracking-tight">
              {language === 'es' ? 'Propiedad' : 'Property'}
            </h2>

            {/* Property Image */}
            <div className="aspect-video bg-stone-200 overflow-hidden mb-4">
              <img
                src={property.images[0]}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Property Details */}
            <h3 className="text-lg font-display text-stone-900 mb-2">
              {property.name}
            </h3>
            <div className="flex items-center text-sm text-stone-500 mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{property.location}</span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-stone-600 pt-3 border-t border-stone-200">
              <div className="flex items-center">
                <Home className="w-4 h-4 mr-1" />
                <span>{property.bedrooms} {language === 'es' ? 'hab' : 'bed'}</span>
              </div>
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-1" />
                <span>{property.max_guests} {language === 'es' ? 'huésp' : 'guests'}</span>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-white border border-stone-200 p-6">
            <h2 className="text-xl font-display font-light text-stone-900 mb-6 tracking-tight">
              {language === 'es' ? 'Resumen de Reserva' : 'Booking Summary'}
            </h2>

            <div className="space-y-4 mb-6">
              {/* Check-in */}
              <div className="flex items-start">
                <div className="flex items-start space-x-3 w-full">
                  <Calendar className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-stone-500 font-light uppercase mb-1">
                      {language === 'es' ? 'Check-in' : 'Check-in'}
                    </p>
                    <p className="text-sm text-stone-900 font-light">
                      {formatDate(searchParams.checkIn)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Check-out */}
              <div className="flex items-start">
                <div className="flex items-start space-x-3 w-full">
                  <Calendar className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-stone-500 font-light uppercase mb-1">
                      {language === 'es' ? 'Check-out' : 'Check-out'}
                    </p>
                    <p className="text-sm text-stone-900 font-light">
                      {formatDate(searchParams.checkOut)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div className="flex items-start">
                <div className="flex items-start space-x-3 w-full">
                  <UsersIcon className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-stone-500 font-light uppercase mb-1">
                      {language === 'es' ? 'Huéspedes' : 'Guests'}
                    </p>
                    <p className="text-sm text-stone-900 font-light">
                      {searchParams.guests} {language === 'es' ? (searchParams.guests === 1 ? 'huésped' : 'huéspedes') : (searchParams.guests === 1 ? 'guest' : 'guests')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-stone-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm font-light text-stone-600">
                <span>${property.price_per_night} x {nights} {language === 'es' ? (nights === 1 ? 'noche' : 'noches') : (nights === 1 ? 'night' : 'nights')}</span>
                <span>${(property.price_per_night * nights).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-lg font-display text-stone-900 pt-3 border-t border-stone-200">
                <span>{language === 'es' ? 'Total' : 'Total'}</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Status Message */}
            {status && (
              <div className={`mt-6 p-4 border-l-2 flex items-start space-x-2 ${
                status.type === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : status.type === 'error'
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-blue-300 bg-blue-50 text-blue-700'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-light">{status.message}</p>
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={submitting || redirectingToPayment}
              className="w-full mt-6 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-light py-4 transition-all disabled:cursor-not-allowed text-sm tracking-widest uppercase flex items-center justify-center space-x-2"
            >
              {submitting || redirectingToPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>
                    {redirectingToPayment
                      ? (language === 'es' ? 'Redirigiendo...' : 'Redirecting...')
                      : (language === 'es' ? 'Procesando...' : 'Processing...')}
                  </span>
                </>
              ) : (
                <>
                  {paymentsEnabled && DATA_SOURCE === 'supabase' ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>{language === 'es' ? 'Proceder al Pago' : 'Proceed to Payment'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{language === 'es' ? 'Confirmar Reserva' : 'Confirm Booking'}</span>
                    </>
                  )}
                </>
              )}
            </button>

            {paymentsEnabled && DATA_SOURCE === 'supabase' && (
              <p className="text-xs text-stone-500 mt-3 text-center font-light">
                {language === 'es'
                  ? 'Serás redirigido a Stripe para completar el pago'
                  : 'You will be redirected to Stripe to complete the payment'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Checkout)
