import React, { useEffect, memo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Calendar, MapPin, Users as UsersIcon, LogOut, Plus, Home, RefreshCcw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useBookings } from '../contexts/BookingsContext'
import { supabase } from '../supabase/config'

const ClientDashboard = () => {
  const { currentUser, logout } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { bookings, loading, refreshBookings } = useBookings()
  const [paymentMessage, setPaymentMessage] = useState(null)

  // Verificar pago exitoso cuando se regresa de Stripe
  useEffect(() => {
    const verifyPayment = async () => {
      const searchParams = new URLSearchParams(location.search)
      const payment = searchParams.get('payment')
      const bookingId = searchParams.get('booking_id')
      const sessionId = searchParams.get('session_id')

      if (payment === 'success' && bookingId && sessionId) {
        try {
          // Llamar a la edge function para verificar el pago
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

          const response = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({
              session_id: sessionId,
              booking_id: bookingId
            })
          })

          const result = await response.json()

          if (result.success && result.payment_status === 'paid') {
            setPaymentMessage({
              type: 'success',
              text: language === 'es'
                ? '¡Pago confirmado! Tu reserva ha sido procesada exitosamente.'
                : 'Payment confirmed! Your booking has been processed successfully.'
            })
          } else {
            setPaymentMessage({
              type: 'warning',
              text: language === 'es'
                ? 'El pago está siendo procesado. Actualiza la página en unos momentos.'
                : 'Payment is being processed. Please refresh the page in a few moments.'
            })
          }

          // Limpiar URL sin recargar la página
          window.history.replaceState({}, '', '/my-bookings')

          // Refrescar reservas para mostrar el estado actualizado
          await refreshBookings()
        } catch (error) {
          console.error('Error verifying payment:', error)
          setPaymentMessage({
            type: 'error',
            text: language === 'es'
              ? 'Error al verificar el pago. Por favor contacta con soporte.'
              : 'Error verifying payment. Please contact support.'
          })
        }
      }
    }

    if (currentUser) {
      verifyPayment()
    }
  }, [currentUser, location.search, language, refreshBookings])

  // Recargar reservas cuando se navega a esta página (por si viene de crear una reserva)
  useEffect(() => {
    if (currentUser && location.pathname === '/my-bookings') {
      refreshBookings()
    }
  }, [currentUser, location.pathname, refreshBookings])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getBookingStatus = (booking) => {
    // Si hay un estado de pago pendiente, mostrarlo primero
    if (booking.payment_status === 'pending' || booking.status === 'pending_payment') {
      return { text: language === 'es' ? 'Pago Pendiente' : 'Payment Pending', color: 'text-yellow-600 bg-yellow-50' }
    }
    if (booking.payment_status === 'failed' || booking.status === 'error') {
      return { text: language === 'es' ? 'Error de Pago' : 'Payment Error', color: 'text-red-600 bg-red-50' }
    }

    // Si no hay estado de pago, calcular según fechas
    const now = new Date()
    const checkInDate = new Date(booking.check_in)
    const checkOutDate = new Date(booking.check_out)

    if (now < checkInDate) {
      return { text: language === 'es' ? 'Próxima' : 'Upcoming', color: 'text-blue-600 bg-blue-50' }
    } else if (now >= checkInDate && now <= checkOutDate) {
      return { text: language === 'es' ? 'Activa' : 'Active', color: 'text-green-600 bg-green-50' }
    } else {
      return { text: language === 'es' ? 'Finalizada' : 'Completed', color: 'text-stone-400 bg-stone-50' }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-light text-stone-900 mb-2 tracking-tight">
              {language === 'es' ? 'Mis Reservaciones' : 'My Bookings'}
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm font-light tracking-wide">
              {language === 'es' ? 'Bienvenido,' : 'Welcome,'} {currentUser?.displayName || currentUser?.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors text-xs sm:text-sm font-light tracking-wide"
            >
              <Home className="w-4 h-4" />
              <span>{language === 'es' ? 'Buscar Propiedades' : 'Search Properties'}</span>
            </button>
            <button
              onClick={refreshBookings}
              disabled={loading}
              className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors text-xs sm:text-sm font-light tracking-wide disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{language === 'es' ? 'Actualizar' : 'Refresh'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors text-xs sm:text-sm font-light tracking-wide"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'es' ? 'Salir' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* Payment Message */}
        {paymentMessage && (
          <div className={`mb-6 p-4 border-l-4 ${
            paymentMessage.type === 'success'
              ? 'border-green-500 bg-green-50 text-green-800'
              : paymentMessage.type === 'error'
              ? 'border-red-500 bg-red-50 text-red-800'
              : 'border-yellow-500 bg-yellow-50 text-yellow-800'
          }`}>
            <p className="text-sm font-light">{paymentMessage.text}</p>
          </div>
        )}

        {/* New Booking Button */}
        <div className="mb-8 sm:mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-light py-4 sm:py-5 md:py-6 transition-all text-sm tracking-widest uppercase flex items-center justify-center space-x-3 touch-manipulation"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{language === 'es' ? 'Nueva Reservación' : 'New Booking'}</span>
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 sm:py-20 border border-stone-200 bg-white/50 px-4">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-stone-300" />
            <h3 className="text-xl sm:text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
              {language === 'es' ? 'No tienes reservaciones' : 'No bookings yet'}
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm font-light tracking-wide">
              {language === 'es'
                ? 'Comienza haciendo tu primera reservación'
                : 'Start by making your first booking'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {bookings.map((booking) => {
              const status = getBookingStatus(booking)
              return (
                <div
                  key={booking.id}
                  className="bg-white border border-stone-200 p-4 sm:p-6 hover:border-stone-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 mb-3 sm:mb-4 md:mb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center mb-2 sm:mb-3 gap-2">
                        <h3 className="text-lg sm:text-xl font-display text-stone-900 tracking-tight">
                          {booking.property_name}
                        </h3>
                        <span className={`text-xs tracking-widest uppercase px-2 sm:px-3 py-1 inline-block ${status.color}`}>
                          {status.text}
                        </span>
                      </div>

                      <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm font-light text-stone-600">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-stone-400 flex-shrink-0" />
                          <span className="truncate">{booking.property_location}</span>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-stone-400 flex-shrink-0 mt-0.5" />
                          <span className="break-words">
                            {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-stone-400 flex-shrink-0" />
                          <span>
                            {booking.guests} {language === 'es' ? 'huéspedes' : 'guests'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <p className="text-2xl sm:text-3xl font-display font-light text-stone-900 tracking-tight">
                        ${booking.total_price}
                      </p>
                      <p className="text-xs text-stone-400 font-light tracking-wide uppercase mt-1">
                        {booking.nights} {language === 'es' ? 'noches' : 'nights'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(ClientDashboard)
