import React, { useState, useMemo, memo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, MapPin, Bed, Bath, LogOut, LayoutDashboard, Search, Plus, Minus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useProperties } from '../contexts/PropertiesContext'
import { supabase } from '../supabase/config'
import { getTodayDateString, hasDateOverlap, calculateNights } from '../utils/bookingUtils'
import CustomDatePicker from './CustomDatePicker'

const PropertiesSearch = () => {
  const { currentUser, logout, isAdmin } = useAuth()
  const { language } = useLanguage()
  const { properties, loading } = useProperties()
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  })

  const [hasSearched, setHasSearched] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  // Cargar reservas al montar el componente
  useEffect(() => {
    const loadBookings = async () => {
      setLoadingBookings(true)
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('property_id, check_in, check_out')
          .eq('status', 'confirmed')

        if (error) throw error
        setBookings(data || [])
      } catch (error) {
        console.error('Error loading bookings:', error)
        setBookings([])
      } finally {
        setLoadingBookings(false)
      }
    }
    loadBookings()
  }, [])

  // Verificar si una propiedad está disponible en las fechas seleccionadas
  const isPropertyAvailable = (propertyId) => {
    if (!searchParams.checkIn || !searchParams.checkOut) {
      return true // Si no hay fechas seleccionadas, mostrar todas
    }

    const propertyBookings = bookings.filter(b => b.property_id === propertyId)

    // Verificar si alguna reserva se solapa con las fechas seleccionadas
    return !propertyBookings.some(booking =>
      hasDateOverlap(
        searchParams.checkIn,
        searchParams.checkOut,
        booking.check_in,
        booking.check_out
      )
    )
  }

  // Usar useMemo para filtrar propiedades solo cuando cambian las dependencias
  const filteredProperties = useMemo(() => {
    const guests = parseInt(searchParams.guests) || 1
    return properties.filter(property => {
      // Filtrar por capacidad de huéspedes
      if (property.max_guests < guests) return false

      // Filtrar por disponibilidad de fechas
      if (!isPropertyAvailable(property.id)) return false

      return true
    })
  }, [properties, searchParams.guests, searchParams.checkIn, searchParams.checkOut, bookings])

  const handleBooking = (property) => {
    navigate(`/property/${property.id}`, {
      state: {
        searchParams
      }
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const nights = searchParams.checkIn && searchParams.checkOut
    ? calculateNights(searchParams.checkIn, searchParams.checkOut)
    : 0

  const handleSearch = () => {
    // Validar que las fechas estén seleccionadas
    if (!searchParams.checkIn || !searchParams.checkOut) {
      return
    }
    setHasSearched(true)
  }

  // Verificar si el botón de búsqueda debe estar habilitado
  const isSearchEnabled = searchParams.checkIn && searchParams.checkOut

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Search Form */}
        <div className="bg-white border-2 border-stone-200 p-8 sm:p-10 md:p-12 mb-8 sm:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Check-in */}
            <div>
              <label className="block text-xs font-light text-stone-500 mb-4 tracking-widest uppercase flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Check-in' : 'Check-in'}
              </label>
              <CustomDatePicker
                value={searchParams.checkIn}
                onChange={(date) => setSearchParams({ ...searchParams, checkIn: date })}
                minDate={getTodayDateString()}
                label={language === 'es' ? 'Entrada' : 'Check-in'}
                language={language}
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="block text-xs font-light text-stone-500 mb-4 tracking-widest uppercase flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Check-out' : 'Check-out'}
              </label>
              <CustomDatePicker
                value={searchParams.checkOut}
                onChange={(date) => setSearchParams({ ...searchParams, checkOut: date })}
                minDate={searchParams.checkIn || getTodayDateString()}
                label={language === 'es' ? 'Salida' : 'Check-out'}
                language={language}
              />
            </div>

            {/* Guests */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-light text-stone-500 mb-4 tracking-widest uppercase flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Huéspedes' : 'Guests'}
              </label>
              <div className="flex items-center space-x-4 py-4 sm:py-5 border-b-2 border-stone-200">
                <button
                  type="button"
                  onClick={() => setSearchParams({ ...searchParams, guests: Math.max(1, parseInt(searchParams.guests) - 1) })}
                  className="w-10 h-10 flex items-center justify-center border border-stone-300 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center text-base sm:text-lg font-light text-stone-900">
                  {searchParams.guests} {language === 'es' ? (searchParams.guests === 1 ? 'huésped' : 'huéspedes') : (searchParams.guests === 1 ? 'guest' : 'guests')}
                </div>
                <button
                  type="button"
                  onClick={() => setSearchParams({ ...searchParams, guests: parseInt(searchParams.guests) + 1 })}
                  className="w-10 h-10 flex items-center justify-center border border-stone-300 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {nights > 0 && (
            <div className="mt-6 text-center text-sm font-light text-stone-600">
              {language === 'es' ? 'Estás buscando por' : 'You are searching for'}{' '}
              <span className="font-semibold">{nights}</span>{' '}
              {language === 'es' ? (nights === 1 ? 'noche' : 'noches') : (nights === 1 ? 'night' : 'nights')}
            </div>
          )}

          {/* Search Buttons */}
          <div className="mt-8 space-y-4">
            <button
              onClick={handleSearch}
              disabled={!isSearchEnabled}
              className={`w-full font-light py-4 sm:py-5 transition-all text-sm tracking-widest uppercase flex items-center justify-center space-x-3 ${
                isSearchEnabled
                  ? 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>{language === 'es' ? 'Buscar Propiedades' : 'Search Properties'}</span>
            </button>
            {!isSearchEnabled && (
              <p className="text-xs text-stone-500 mt-2 text-center font-light">
                {language === 'es'
                  ? 'Selecciona las fechas de check-in y check-out para buscar'
                  : 'Select check-in and check-out dates to search'}
              </p>
            )}

            {/* Browse All Properties Button */}
            <button
              onClick={() => navigate('/all-properties')}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-light py-4 sm:py-5 transition-all text-sm tracking-widest uppercase flex items-center justify-center space-x-3"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>{language === 'es' ? 'Mostrar Todas las Propiedades' : 'Show All Properties'}</span>
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {!hasSearched ? (
          <div className="text-center py-12 sm:py-20 border border-stone-200 bg-white/50 px-4">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-stone-300" />
            <h3 className="text-xl sm:text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
              {language === 'es' ? 'Comienza tu búsqueda' : 'Start your search'}
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm font-light tracking-wide">
              {language === 'es'
                ? 'Presiona el botón "Buscar Propiedades" para ver los resultados'
                : 'Press the "Search Properties" button to see results'}
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12 sm:py-20 border border-stone-200 bg-white/50 px-4">
            <MapPin className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-stone-300" />
            <h3 className="text-xl sm:text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
              {language === 'es' ? 'No hay propiedades disponibles' : 'No properties available'}
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm font-light tracking-wide">
              {language === 'es'
                ? 'Intenta cambiar tus criterios de búsqueda'
                : 'Try changing your search criteria'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-6 text-xs sm:text-sm font-light text-stone-600">
              {language === 'es' ? 'Mostrando' : 'Showing'}{' '}
              <span className="font-semibold">{filteredProperties.length}</span>{' '}
              {language === 'es'
                ? (filteredProperties.length === 1 ? 'propiedad' : 'propiedades')
                : (filteredProperties.length === 1 ? 'property' : 'properties')
              }
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => handleBooking(property)}
                  className="bg-white border border-stone-200 hover:border-stone-300 transition-all overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-video bg-stone-200 overflow-hidden">
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-display text-stone-900 tracking-tight mb-2">
                      {property.name}
                    </h3>

                    <div className="flex items-center text-xs sm:text-sm text-stone-500 font-light mb-3 sm:mb-4">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-stone-400 flex-shrink-0" />
                      <span className="truncate">{property.location}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 font-light mb-3 sm:mb-4 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center text-xs sm:text-sm font-light text-stone-600 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-stone-100">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="flex items-center">
                          <Bed className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-stone-400" />
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-stone-400" />
                          <span>{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-stone-400" />
                          <span>{property.max_guests}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <div>
                        <div className="text-xl sm:text-2xl font-semibold text-stone-900">
                          ${property.price_per_night}
                        </div>
                        <div className="text-xs text-stone-400 font-light">
                          {language === 'es' ? 'por noche' : 'per night'}
                        </div>
                        {nights > 0 && (
                          <div className="text-xs sm:text-sm text-stone-600 font-semibold mt-1">
                            {language === 'es' ? 'Total:' : 'Total:'} ${(property.price_per_night * nights).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="w-full sm:w-auto bg-stone-900 group-hover:bg-stone-800 text-white px-6 py-3 sm:py-2 transition-all text-sm tracking-wide font-light text-center">
                        {language === 'es' ? 'Reservar' : 'Book'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default memo(PropertiesSearch)
