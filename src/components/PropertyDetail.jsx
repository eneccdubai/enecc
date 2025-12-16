import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Users, Bed, Bath, ChevronLeft, ChevronRight, ArrowLeft, Calendar, Plus, Minus, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useProperties } from '../contexts/PropertiesContext'
import { supabase } from '../supabase/config'
import { getTodayDateString, hasDateOverlap, generateDateRange } from '../utils/bookingUtils'
import CustomDatePicker from './CustomDatePicker'

const PropertyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { language } = useLanguage()
  const { properties, loading } = useProperties()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [property, setProperty] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)
  const [blockedDates, setBlockedDates] = useState([])

  // State para manejo local de fechas y huéspedes
  const [searchParams, setSearchParams] = useState(location.state?.searchParams || {
    checkIn: '',
    checkOut: '',
    guests: 1
  })

  useEffect(() => {
    if (!loading && properties.length > 0) {
      const foundProperty = properties.find(p => p.id === id)
      if (foundProperty) {
        setProperty(foundProperty)
      } else {
        navigate('/check-in')
      }
    }
  }, [id, properties, loading, navigate])

  // Cargar fechas bloqueadas (reservas confirmadas)
  useEffect(() => {
    const loadBlockedDates = async () => {
      if (!id) return

      try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('check_in, check_out')
          .eq('property_id', id)
          .eq('status', 'confirmed')

        if (error) {
          console.error('Error cargando reservas:', error)
          return
        }

        // Generar array de todas las fechas bloqueadas usando la utilidad
        const blocked = []
        bookings?.forEach(booking => {
          const dates = generateDateRange(booking.check_in, booking.check_out)
          blocked.push(...dates)
        })

        setBlockedDates(blocked)

        // Validar si las fechas pre-seleccionadas están bloqueadas
        if (searchParams.checkIn && searchParams.checkOut) {
          const conflictDetected = bookings?.some(booking =>
            hasDateOverlap(
              searchParams.checkIn,
              searchParams.checkOut,
              booking.check_in,
              booking.check_out
            )
          )

          // Si hay solapamiento, limpiar las fechas
          if (conflictDetected) {
            setSearchParams({
              ...searchParams,
              checkIn: '',
              checkOut: ''
            })
          }
        }
      } catch (error) {
        console.error('Error procesando fechas bloqueadas:', error)
      }
    }

    loadBlockedDates()
  }, [id])

  const nextImage = () => {
    if (property) {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (property) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      )
    }
  }

  const openLightbox = (index) => {
    setLightboxImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextLightboxImage = () => {
    if (property) {
      setLightboxImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevLightboxImage = () => {
    if (property) {
      setLightboxImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      )
    }
  }

  // Cerrar lightbox con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return

      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowRight') {
        nextLightboxImage()
      } else if (e.key === 'ArrowLeft') {
        prevLightboxImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, property])

  const handleBooking = () => {
    // Validar que las fechas estén seleccionadas
    if (!searchParams.checkIn || !searchParams.checkOut) {
      alert(language === 'es'
        ? 'Por favor selecciona las fechas de check-in y check-out'
        : 'Please select check-in and check-out dates')
      return
    }

    navigate('/checkout', {
      state: {
        property,
        searchParams
      }
    })
  }

  const calculateNights = () => {
    if (searchParams.checkIn && searchParams.checkOut) {
      const start = new Date(searchParams.checkIn)
      const end = new Date(searchParams.checkOut)
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      return nights > 0 ? nights : 0
    }
    return 0
  }

  if (loading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream-50 to-white">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    )
  }

  const nights = calculateNights()

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pt-20 sm:pt-24 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors mb-6 sm:mb-8 text-sm font-light"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'es' ? 'Volver' : 'Back'}</span>
        </button>

        {/* Image Gallery */}
        <div className="mb-8 sm:mb-12">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-stone-900 overflow-hidden group cursor-pointer" onClick={() => openLightbox(currentImageIndex)}>
            <img
              src={property.images[currentImageIndex]}
              alt={property.name}
              className="w-full h-full object-cover"
            />

            {/* Image Navigation */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 text-xs sm:text-sm font-light">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Grid */}
          {property.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-4">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => openLightbox(index)}
                  className={`aspect-square overflow-hidden border-2 transition-all cursor-pointer ${
                    currentImageIndex === index
                      ? 'border-stone-900'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${property.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Location */}
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-light text-stone-900 mb-4 tracking-tight">
                {property.name}
              </h1>
              <div className="flex items-center text-base sm:text-lg text-stone-600 font-light">
                <MapPin className="w-5 h-5 mr-2 text-stone-400" />
                <span>{property.location}</span>
              </div>
            </div>

            {/* Property Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 py-6 border-t border-b border-stone-200">
              <div className="flex items-center space-x-2">
                <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
                <span className="text-sm sm:text-base font-light text-stone-900">
                  {property.bedrooms} {language === 'es' ? 'Habitaciones' : 'Bedrooms'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
                <span className="text-sm sm:text-base font-light text-stone-900">
                  {property.bathrooms} {language === 'es' ? 'Baños' : 'Bathrooms'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
                <span className="text-sm sm:text-base font-light text-stone-900">
                  {language === 'es' ? 'Hasta' : 'Up to'} {property.max_guests} {language === 'es' ? 'huéspedes' : 'guests'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-light text-stone-900 mb-4 tracking-tight">
                {language === 'es' ? 'Descripción' : 'Description'}
              </h2>
              <p className="text-base sm:text-lg font-light text-stone-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-light text-stone-900 mb-6 tracking-tight">
                {language === 'es' ? 'Servicios' : 'Amenities'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-base font-light text-stone-700"
                  >
                    <div className="w-6 h-6 border border-stone-300 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-stone-900"></div>
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border-2 border-stone-200 bg-white p-6 sm:p-8">
              {/* Price */}
              <div className="mb-6 pb-6 border-b border-stone-200">
                <div className="text-4xl sm:text-5xl font-display text-stone-900 tracking-tight">
                  ${property.price_per_night}
                </div>
                <div className="text-sm text-stone-500 font-light tracking-wide uppercase mt-1">
                  {language === 'es' ? 'por noche' : 'per night'}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Check-in' : 'Check-in'}
                  </label>
                  <CustomDatePicker
                    value={searchParams.checkIn}
                    onChange={(date) => setSearchParams({ ...searchParams, checkIn: date })}
                    minDate={getTodayDateString()}
                    label={language === 'es' ? 'Entrada' : 'Check-in'}
                    language={language}
                    disabledDates={blockedDates}
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Check-out' : 'Check-out'}
                  </label>
                  <CustomDatePicker
                    value={searchParams.checkOut}
                    onChange={(date) => setSearchParams({ ...searchParams, checkOut: date })}
                    minDate={searchParams.checkIn || getTodayDateString()}
                    label={language === 'es' ? 'Salida' : 'Check-out'}
                    language={language}
                    disabledDates={blockedDates}
                  />
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Huéspedes' : 'Guests'}
                  </label>
                  <div className="flex items-center space-x-4 py-3 border-b-2 border-stone-200">
                    <button
                      type="button"
                      onClick={() => setSearchParams({ ...searchParams, guests: Math.max(1, parseInt(searchParams.guests) - 1) })}
                      className="w-10 h-10 flex items-center justify-center border border-stone-300 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 text-center text-base font-light text-stone-900">
                      {searchParams.guests} {language === 'es' ? (searchParams.guests === 1 ? 'huésped' : 'huéspedes') : (searchParams.guests === 1 ? 'guest' : 'guests')}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSearchParams({ ...searchParams, guests: Math.min(property.max_guests, parseInt(searchParams.guests) + 1) })}
                      disabled={searchParams.guests >= property.max_guests}
                      className="w-10 h-10 flex items-center justify-center border border-stone-300 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {searchParams.guests >= property.max_guests && (
                    <p className="text-xs text-stone-500 mt-2 font-light">
                      {language === 'es' ? 'Máximo de huéspedes alcanzado' : 'Maximum guests reached'}
                    </p>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="mb-6 pb-6 border-t border-stone-200 pt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm font-light">
                    <span className="text-stone-600">
                      ${property.price_per_night} × {nights} {language === 'es' ? (nights === 1 ? 'noche' : 'noches') : (nights === 1 ? 'night' : 'nights')}
                    </span>
                    <span className="text-stone-900 font-medium">
                      ${(property.price_per_night * nights).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                    <span className="text-lg font-display text-stone-900">
                      {language === 'es' ? 'Total' : 'Total'}
                    </span>
                    <span className="text-2xl font-display text-stone-900">
                      ${(property.price_per_night * nights).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBooking}
                className="btn-animate w-full bg-stone-900 hover:bg-stone-800 text-white font-light py-4 transition-all text-sm tracking-widest uppercase"
              >
                {language === 'es' ? 'Reservar Ahora' : 'Book Now'}
              </button>

              <p className="text-xs text-stone-500 text-center mt-4 font-light">
                {language === 'es'
                  ? 'Selecciona las fechas para ver el precio total'
                  : 'Select dates to see total price'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 bg-white/10 text-white px-4 py-2 text-sm sm:text-base font-light z-10">
            {lightboxImageIndex + 1} / {property.images.length}
          </div>

          {/* Main Image */}
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={property.images[lightboxImageIndex]}
              alt={`${property.name} ${lightboxImageIndex + 1}`}
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />

            {/* Navigation Buttons */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevLightboxImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextLightboxImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyDetail
