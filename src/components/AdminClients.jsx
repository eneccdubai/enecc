import React, { useState, useEffect } from 'react'
import { Users, Search, Calendar, Mail, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../supabase/config'

const AdminClients = () => {
  const { language } = useLanguage()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedClient, setExpandedClient] = useState(null)
  const [bookingsByClient, setBookingsByClient] = useState({})

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const loadClientBookings = async (clientId) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setBookingsByClient(prev => ({
        ...prev,
        [clientId]: data || []
      }))
    } catch (error) {
      console.error('Error loading client bookings:', error)
      setBookingsByClient(prev => ({
        ...prev,
        [clientId]: []
      }))
    }
  }

  const handleDeleteClient = async (clientId) => {
    if (window.confirm(language === 'es'
      ? '¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.'
      : 'Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', clientId)

        if (error) throw error

        await loadClients()
      } catch (error) {
        console.error('Error deleting client:', error)
        alert(language === 'es'
          ? 'Error al eliminar el cliente'
          : 'Error deleting client')
      }
    }
  }

  const toggleClientExpanded = (clientId) => {
    if (expandedClient === clientId) {
      setExpandedClient(null)
    } else {
      setExpandedClient(clientId)
      if (!bookingsByClient[clientId]) {
        loadClientBookings(clientId)
      }
    }
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
    const today = new Date()
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)

    if (today < checkIn) {
      return {
        label: language === 'es' ? 'Próxima' : 'Upcoming',
        color: 'text-blue-600 bg-blue-50'
      }
    } else if (today >= checkIn && today <= checkOut) {
      return {
        label: language === 'es' ? 'Activa' : 'Active',
        color: 'text-green-600 bg-green-50'
      }
    } else {
      return {
        label: language === 'es' ? 'Completada' : 'Completed',
        color: 'text-stone-400 bg-stone-50'
      }
    }
  }

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase()
    return (
      client.email?.toLowerCase().includes(searchLower) ||
      client.name?.toLowerCase().includes(searchLower) ||
      client.displayName?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-display font-light text-stone-900 tracking-tight flex items-center">
            <Users className="w-8 h-8 mr-3 text-stone-600" />
            {language === 'es' ? 'Gestión de Clientes' : 'Client Management'}
          </h2>
          <p className="text-stone-500 text-sm font-light tracking-wide mt-2">
            {language === 'es'
              ? 'Administra clientes y visualiza sus reservas'
              : 'Manage clients and view their bookings'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'es' ? 'Buscar clientes...' : 'Search clients...'}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 focus:border-stone-900 transition-all outline-none bg-white text-stone-900 text-sm font-light"
          />
        </div>
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-20 border border-stone-200 bg-white/50">
          <Users className="w-16 h-16 mx-auto mb-6 text-stone-300" />
          <h3 className="text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
            {searchTerm
              ? (language === 'es' ? 'No se encontraron clientes' : 'No clients found')
              : (language === 'es' ? 'No hay clientes registrados' : 'No registered clients')}
          </h3>
          <p className="text-stone-500 text-sm font-light tracking-wide">
            {searchTerm
              ? (language === 'es' ? 'Intenta con otro término de búsqueda' : 'Try a different search term')
              : (language === 'es' ? 'Los clientes aparecerán aquí cuando se registren' : 'Clients will appear here when they register')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <div
              key={client.uid}
              className="bg-white border border-stone-200 hover:border-stone-300 transition-all"
            >
              {/* Client Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-display text-stone-900 tracking-tight mb-2">
                      {client.name || client.displayName || 'Sin nombre'}
                    </h3>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone-500 font-light mb-3">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {client.email}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {language === 'es' ? 'Registrado: ' : 'Registered: '}
                        {formatDate(client.created_at)}
                      </div>
                    </div>

                    {/* Booking Count */}
                    <div className="text-sm font-light text-stone-600">
                      {bookingsByClient[client.uid] ? (
                        <>
                          {bookingsByClient[client.uid].length} {' '}
                          {language === 'es'
                            ? (bookingsByClient[client.uid].length === 1 ? 'reserva' : 'reservas')
                            : (bookingsByClient[client.uid].length === 1 ? 'booking' : 'bookings')}
                        </>
                      ) : (
                        <span className="text-stone-400">
                          {language === 'es' ? 'Cargando reservas...' : 'Loading bookings...'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start space-x-2 ml-4">
                    <button
                      onClick={() => toggleClientExpanded(client.uid)}
                      className="btn-scale p-2 border border-stone-300 hover:border-stone-900 text-stone-900 transition-all"
                      title={language === 'es' ? 'Ver reservas' : 'View bookings'}
                    >
                      {expandedClient === client.uid ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteClient(client.uid)}
                      className="btn-scale p-2 border border-red-300 hover:border-red-600 text-red-600 transition-all"
                      title={language === 'es' ? 'Eliminar cliente' : 'Delete client'}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Bookings */}
              {expandedClient === client.uid && (
                <div className="border-t border-stone-200 bg-stone-50 p-6">
                  <h4 className="text-lg font-display text-stone-900 mb-4 tracking-tight">
                    {language === 'es' ? 'Reservas del Cliente' : 'Client Bookings'}
                  </h4>

                  {!bookingsByClient[client.uid] ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : bookingsByClient[client.uid].length === 0 ? (
                    <p className="text-stone-500 text-sm font-light text-center py-8">
                      {language === 'es' ? 'Este cliente no tiene reservas' : 'This client has no bookings'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {bookingsByClient[client.uid].map((booking) => {
                        const status = getBookingStatus(booking)
                        return (
                          <div
                            key={booking.id}
                            className="bg-white border border-stone-200 p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-display text-stone-900 tracking-tight">
                                    {booking.property_name}
                                  </h5>
                                  <span className={`text-xs px-2 py-1 ${status.color}`}>
                                    {status.label}
                                  </span>
                                </div>

                                <div className="text-sm text-stone-500 font-light space-y-1">
                                  <p>{booking.property_location}</p>
                                  <p>
                                    {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                                    {' '}({booking.nights} {language === 'es' ? 'noches' : 'nights'})
                                  </p>
                                  <p>
                                    {booking.guests} {language === 'es' ? 'huéspedes' : 'guests'}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right ml-4">
                                <div className="text-2xl font-display text-stone-900">
                                  ${booking.total_price}
                                </div>
                                <div className="text-xs text-stone-400 font-light uppercase">
                                  {language === 'es' ? 'Total' : 'Total'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {!loading && filteredClients.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-stone-50 border border-stone-200 p-6">
            <div className="text-3xl font-display text-stone-900 mb-2">
              {filteredClients.length}
            </div>
            <div className="text-sm text-stone-500 font-light tracking-wide uppercase">
              {language === 'es' ? 'Total Clientes' : 'Total Clients'}
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-6">
            <div className="text-3xl font-display text-stone-900 mb-2">
              {Object.values(bookingsByClient).reduce((sum, bookings) => sum + bookings.length, 0)}
            </div>
            <div className="text-sm text-stone-500 font-light tracking-wide uppercase">
              {language === 'es' ? 'Total Reservas' : 'Total Bookings'}
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-6">
            <div className="text-3xl font-display text-stone-900 mb-2">
              $
              {Object.values(bookingsByClient)
                .flat()
                .reduce((sum, booking) => sum + (booking.total_price || 0), 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-stone-500 font-light tracking-wide uppercase">
              {language === 'es' ? 'Ingresos Totales' : 'Total Revenue'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminClients
