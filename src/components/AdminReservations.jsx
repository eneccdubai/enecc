import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Search, Filter, MapPin, Users, DollarSign, Trash2, Edit, X, Save } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../supabase/config'

const AdminReservations = () => {
  const { language } = useLanguage()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingBooking, setEditingBooking] = useState(null)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

      await loadBookings()
    } catch (error) {
      console.error('Error updating booking status:', error)
      alert(language === 'es'
        ? 'Error al actualizar el estado de la reserva'
        : 'Error updating booking status')
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm(language === 'es'
      ? '¿Estás seguro de eliminar esta reserva?'
      : 'Are you sure you want to delete this booking?')) {
      try {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', bookingId)

        if (error) throw error

        await loadBookings()
      } catch (error) {
        console.error('Error deleting booking:', error)
        alert(language === 'es'
          ? 'Error al eliminar la reserva'
          : 'Error deleting booking')
      }
    }
  }

  const handleEditBooking = (booking) => {
    setEditingBooking({
      ...booking,
      original: booking
    })
  }

  const handleSaveEdit = async () => {
    try {
      // Validar fechas
      const checkIn = new Date(editingBooking.check_in)
      const checkOut = new Date(editingBooking.check_out)

      if (checkOut <= checkIn) {
        alert(language === 'es'
          ? 'La fecha de salida debe ser posterior a la fecha de entrada'
          : 'Check-out date must be after check-in date')
        return
      }

      // Calcular noches
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))

      // Calcular nuevo precio total (usando el precio por noche original)
      const pricePerNight = editingBooking.original.total_price / editingBooking.original.nights
      const newTotalPrice = nights * pricePerNight

      const updates = {
        check_in: editingBooking.check_in,
        check_out: editingBooking.check_out,
        guests: parseInt(editingBooking.guests),
        nights,
        total_price: newTotalPrice
      }

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', editingBooking.id)

      if (error) throw error

      await loadBookings()
      setEditingBooking(null)
    } catch (error) {
      console.error('Error updating booking:', error)
      alert(language === 'es'
        ? 'Error al actualizar la reserva'
        : 'Error updating booking')
    }
  }

  const handleCancelEdit = () => {
    setEditingBooking(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getBookingStatus = (booking) => {
    if (booking.status === 'cancelled') {
      return {
        label: language === 'es' ? 'Cancelada' : 'Cancelled',
        color: 'text-red-600 bg-red-50 border-red-200'
      }
    }

    const today = new Date()
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)

    if (today < checkIn) {
      return {
        label: language === 'es' ? 'Próxima' : 'Upcoming',
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      }
    } else if (today >= checkIn && today <= checkOut) {
      return {
        label: language === 'es' ? 'Activa' : 'Active',
        color: 'text-green-600 bg-green-50 border-green-200'
      }
    } else {
      return {
        label: language === 'es' ? 'Completada' : 'Completed',
        color: 'text-stone-400 bg-stone-50 border-stone-200'
      }
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = (
      booking.property_name?.toLowerCase().includes(searchLower) ||
      booking.user_name?.toLowerCase().includes(searchLower) ||
      booking.user_email?.toLowerCase().includes(searchLower) ||
      booking.property_location?.toLowerCase().includes(searchLower)
    )

    if (statusFilter === 'all') return matchesSearch

    const status = getBookingStatus(booking)
    return matchesSearch && status.label.toLowerCase().includes(statusFilter.toLowerCase())
  })

  const getTotalRevenue = () => {
    // Excluir bloqueos de calendario (no son reservas reales)
    return filteredBookings
      .filter(booking => !booking.is_calendar_block)
      .reduce((sum, booking) => sum + (booking.total_price || 0), 0)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-display font-light text-stone-900 tracking-tight flex items-center mb-2">
          <CalendarIcon className="w-8 h-8 mr-3 text-stone-600" />
          {language === 'es' ? 'Gestión de Reservas' : 'Reservation Management'}
        </h2>
        <p className="text-stone-500 text-sm font-light tracking-wide">
          {language === 'es'
            ? 'Administra todas las reservas de tus propiedades'
            : 'Manage all property reservations'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'es'
              ? 'Buscar por propiedad, cliente o email...'
              : 'Search by property, client or email...'}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 focus:border-stone-900 transition-all outline-none bg-white text-stone-900 text-sm font-light"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 focus:border-stone-900 transition-all outline-none bg-white text-stone-900 text-sm font-light appearance-none cursor-pointer"
          >
            <option value="all">{language === 'es' ? 'Todas las reservas' : 'All bookings'}</option>
            <option value="upcoming">{language === 'es' ? 'Próximas' : 'Upcoming'}</option>
            <option value="active">{language === 'es' ? 'Activas' : 'Active'}</option>
            <option value="completed">{language === 'es' ? 'Completadas' : 'Completed'}</option>
            <option value="cancelled">{language === 'es' ? 'Canceladas' : 'Cancelled'}</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && filteredBookings.length > 0 && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-stone-50 border border-stone-200 p-4">
            <div className="text-2xl font-display text-stone-900 mb-1">
              {filteredBookings.length}
            </div>
            <div className="text-xs text-stone-500 font-light tracking-wide uppercase">
              {language === 'es' ? 'Total Reservas' : 'Total Bookings'}
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-4">
            <div className="text-2xl font-display text-stone-900 mb-1">
              ${getTotalRevenue().toLocaleString()}
            </div>
            <div className="text-xs text-stone-500 font-light tracking-wide uppercase">
              {language === 'es' ? 'Ingresos Totales' : 'Total Revenue'}
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-4">
            <div className="text-2xl font-display text-stone-900 mb-1">
              {filteredBookings.reduce((sum, b) => sum + (b.nights || 0), 0)}
            </div>
            <div className="text-xs text-stone-500 font-light tracking-wide uppercase">
              {language === 'es' ? 'Total Noches' : 'Total Nights'}
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-4">
            <div className="text-2xl font-display text-stone-900 mb-1">
              ${filteredBookings.length > 0
                ? Math.round(getTotalRevenue() / filteredBookings.length).toLocaleString()
                : 0}
            </div>
            <div className="text-xs text-stone-500 font-light tracking-wide uppercase">
              {language === 'es' ? 'Valor Promedio' : 'Avg. Value'}
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 border border-stone-200 bg-white/50">
          <CalendarIcon className="w-16 h-16 mx-auto mb-6 text-stone-300" />
          <h3 className="text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
            {searchTerm || statusFilter !== 'all'
              ? (language === 'es' ? 'No se encontraron reservas' : 'No bookings found')
              : (language === 'es' ? 'No hay reservas' : 'No bookings')}
          </h3>
          <p className="text-stone-500 text-sm font-light tracking-wide">
            {searchTerm || statusFilter !== 'all'
              ? (language === 'es' ? 'Intenta con otros filtros' : 'Try different filters')
              : (language === 'es' ? 'Las reservas aparecerán aquí' : 'Bookings will appear here')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const status = getBookingStatus(booking)

            return (
              <div
                key={booking.id}
                className="bg-white border border-stone-200 hover:border-stone-300 transition-all p-6"
              >
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    {editingBooking && editingBooking.id === booking.id ? (
                      /* Edit Form */
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-xl font-display text-stone-900 tracking-tight">
                            {language === 'es' ? 'Editar Reserva' : 'Edit Booking'}
                          </h3>
                          <span className={`text-xs px-2 py-1 border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-stone-500 font-light mb-1 tracking-wide uppercase">
                              {language === 'es' ? 'Check-in' : 'Check-in'}
                            </label>
                            <input
                              type="date"
                              value={editingBooking.check_in}
                              onChange={(e) => setEditingBooking({...editingBooking, check_in: e.target.value})}
                              className="w-full px-3 py-2 border border-stone-200 focus:border-stone-900 transition-all outline-none text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-stone-500 font-light mb-1 tracking-wide uppercase">
                              {language === 'es' ? 'Check-out' : 'Check-out'}
                            </label>
                            <input
                              type="date"
                              value={editingBooking.check_out}
                              onChange={(e) => setEditingBooking({...editingBooking, check_out: e.target.value})}
                              className="w-full px-3 py-2 border border-stone-200 focus:border-stone-900 transition-all outline-none text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-stone-500 font-light mb-1 tracking-wide uppercase">
                              {language === 'es' ? 'Huéspedes' : 'Guests'}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={editingBooking.guests}
                              onChange={(e) => setEditingBooking({...editingBooking, guests: e.target.value})}
                              className="w-full px-3 py-2 border border-stone-200 focus:border-stone-900 transition-all outline-none text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-stone-500 font-light">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            {booking.property_location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                            {booking.user_name} ({booking.user_email})
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Normal View */
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-display text-stone-900 tracking-tight">
                              {booking.property_name}
                            </h3>
                            <span className={`text-xs px-2 py-1 border ${status.color}`}>
                              {status.label}
                            </span>
                            {booking.is_calendar_block && (
                              <span className="text-xs px-2 py-1 border border-amber-400 text-amber-700 bg-amber-50">
                                {language === 'es' ? 'Bloqueo de Calendario' : 'Calendar Block'}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-stone-500 font-light">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                              {booking.property_location}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                              {booking.user_name} ({booking.user_email})
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                              {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                              {' '}({booking.nights} {language === 'es' ? 'noches' : 'nights'})
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                              {booking.guests} {language === 'es' ? 'huéspedes' : 'guests'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-display text-stone-900 tracking-tight">
                        ${booking.total_price}
                      </div>
                      <div className="text-xs text-stone-400 font-light tracking-wide uppercase">
                        {language === 'es' ? 'Total' : 'Total'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {editingBooking && editingBooking.id === booking.id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="btn-scale px-3 py-2 bg-green-600 hover:bg-green-700 text-white transition-all text-xs tracking-wide flex items-center justify-center gap-2"
                          >
                            <Save className="w-3 h-3" />
                            {language === 'es' ? 'Guardar' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="btn-scale px-3 py-2 border border-stone-300 hover:border-stone-600 text-stone-600 transition-all text-xs tracking-wide flex items-center justify-center gap-2"
                          >
                            <X className="w-3 h-3" />
                            {language === 'es' ? 'Cancelar' : 'Cancel'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditBooking(booking)}
                            className="btn-scale px-3 py-2 border border-blue-300 hover:border-blue-600 text-blue-600 transition-all text-xs tracking-wide flex items-center justify-center gap-2"
                          >
                            <Edit className="w-3 h-3" />
                            {language === 'es' ? 'Editar' : 'Edit'}
                          </button>

                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              className="btn-scale px-3 py-2 border border-orange-300 hover:border-orange-600 text-orange-600 transition-all text-xs tracking-wide"
                            >
                              {language === 'es' ? 'Cancelar' : 'Cancel'}
                            </button>
                          )}

                          {booking.status === 'cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              className="btn-scale px-3 py-2 border border-green-300 hover:border-green-600 text-green-600 transition-all text-xs tracking-wide"
                            >
                              {language === 'es' ? 'Reactivar' : 'Reactivate'}
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="btn-scale px-3 py-2 border border-red-300 hover:border-red-600 text-red-600 transition-all text-xs tracking-wide flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            {language === 'es' ? 'Eliminar' : 'Delete'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminReservations
