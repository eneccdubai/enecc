import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const PropertySearchBar = ({ onSearch, className = '' }) => {
  const { language } = useLanguage()
  const [activeField, setActiveField] = useState(null)
  const searchRef = useRef(null)

  // Estados de búsqueda simplificados
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0
  })

  // Estado para el calendario
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarType, setCalendarType] = useState(null) // 'checkIn' or 'checkOut'

  // Traducciones
  const t = {
    location: language === 'es' ? 'Ubicación' : 'Location',
    locationPlaceholder: language === 'es' ? 'Dubai Marina, Downtown...' : 'Dubai Marina, Downtown...',
    checkIn: language === 'es' ? 'Check-in' : 'Check-in',
    checkOut: language === 'es' ? 'Check-out' : 'Check-out',
    guests: language === 'es' ? 'Huéspedes' : 'Guests',
    adults: language === 'es' ? 'Adultos' : 'Adults',
    children: language === 'es' ? 'Niños' : 'Children',
    search: language === 'es' ? 'Buscar' : 'Search',
    selectDate: language === 'es' ? 'Seleccionar' : 'Select'
  }

  const monthNames = language === 'es'
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const dayNames = language === 'es'
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setActiveField(null)
        setCalendarType(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchData)
    }
    setActiveField(null)
    setCalendarType(null)
  }

  const incrementGuests = (type) => {
    setSearchData(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }))
  }

  const decrementGuests = (type) => {
    setSearchData(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1)
    }))
  }

  const getTotalGuests = () => {
    return searchData.adults + searchData.children
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const dayNum = date.getDate()
    const monthName = monthNames[date.getMonth()]
    return `${dayNum} ${monthName}`
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []

    // Días vacíos antes del primer día
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const handleDayClick = (date, type) => {
    if (!date) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    if (date < today) return

    // Crear fecha string
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    if (type === 'checkIn') {
      setSearchData(prev => ({ ...prev, checkIn: dateString }))
      // Si hay un checkout y es anterior al nuevo checkin, limpiarlo
      if (searchData.checkOut && dateString >= searchData.checkOut) {
        setSearchData(prev => ({ ...prev, checkOut: '' }))
      }
    } else {
      setSearchData(prev => ({ ...prev, checkOut: dateString }))
    }

    setCalendarType(null)
    setActiveField(null)
  }

  const isDateDisabled = (date, type) => {
    if (!date) return true

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    if (date < today) return true

    // Para checkout, no permitir fechas anteriores o iguales al checkin
    if (type === 'checkOut' && searchData.checkIn) {
      const checkInDate = new Date(searchData.checkIn)
      checkInDate.setHours(0, 0, 0, 0)
      if (date <= checkInDate) return true
    }

    return false
  }

  const isSelectedDate = (date, type) => {
    if (!date) return false
    const value = type === 'checkIn' ? searchData.checkIn : searchData.checkOut
    if (!value) return false

    const [year, month, day] = value.split('-').map(Number)
    const selected = new Date(year, month - 1, day)
    return date.toDateString() === selected.toDateString()
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const prevMonth = () => {
    const now = new Date()
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    if (newMonth >= new Date(now.getFullYear(), now.getMonth())) {
      setCurrentMonth(newMonth)
    }
  }

  const openCalendar = (type) => {
    setCalendarType(type)
    setActiveField(type)
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Main Search Bar */}
      <div className="bg-white shadow-lg rounded-2xl border border-[#E6DDD5] hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="flex flex-col">
          {/* Top row: Check-in, Check-out, Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
            {/* Check-in */}
            <div
              className={`relative px-5 md:px-7 py-4 cursor-pointer transition-all ${
                calendarType === 'checkIn' ? 'bg-stone-50' : ''
              }`}
              onClick={() => openCalendar('checkIn')}
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-[#C5A086] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-[#C5A086] mb-1.5 tracking-wide uppercase">
                    {t.checkIn}
                  </label>
                  <div className="text-sm font-medium text-stone-900 whitespace-nowrap">
                    {searchData.checkIn ? formatDate(searchData.checkIn) : (
                      <span className="text-stone-400">{t.selectDate}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Check-out */}
            <div
              className={`relative px-5 md:px-7 py-4 cursor-pointer transition-all ${
                calendarType === 'checkOut' ? 'bg-stone-50' : ''
              }`}
              onClick={() => openCalendar('checkOut')}
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-[#C5A086] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-[#C5A086] mb-1.5 tracking-wide uppercase">
                    {t.checkOut}
                  </label>
                  <div className="text-sm font-medium text-stone-900 whitespace-nowrap">
                    {searchData.checkOut ? formatDate(searchData.checkOut) : (
                      <span className="text-stone-400">{t.selectDate}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div
              className={`relative px-5 md:px-7 py-4 cursor-pointer transition-all ${
                activeField === 'guests' ? 'bg-stone-50' : ''
              }`}
              onClick={() => {
                setActiveField(activeField === 'guests' ? null : 'guests')
                setCalendarType(null)
              }}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-[#C5A086] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-[#C5A086] mb-1.5 tracking-wide uppercase">
                    {t.guests}
                  </label>
                  <p className="text-sm font-medium text-stone-900 whitespace-nowrap">
                    {getTotalGuests()} {language === 'es' ? (getTotalGuests() === 1 ? 'Huésped' : 'Huéspedes') : (getTotalGuests() === 1 ? 'Guest' : 'Guests')}
                  </p>
                </div>
              </div>

              {/* Guests Dropdown */}
              {activeField === 'guests' && (
                <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-72 bg-white border border-stone-200 rounded-xl shadow-xl p-5 z-50">
                <div className="space-y-5">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{t.adults}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{language === 'es' ? '13+ años' : '13+ years'}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => decrementGuests('adults')}
                        className="w-8 h-8 border-2 border-stone-300 hover:border-[#4A3B32] text-stone-700 hover:text-[#4A3B32] rounded-full transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={searchData.adults === 0}
                      >
                        <span className="text-lg leading-none">-</span>
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{searchData.adults}</span>
                      <button
                        onClick={() => incrementGuests('adults')}
                        className="w-8 h-8 border-2 border-stone-300 hover:border-[#4A3B32] text-stone-700 hover:text-[#4A3B32] rounded-full transition-all flex items-center justify-center"
                      >
                        <span className="text-lg leading-none">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{t.children}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{language === 'es' ? '0-12 años' : '0-12 years'}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => decrementGuests('children')}
                        className="w-8 h-8 border-2 border-stone-300 hover:border-[#4A3B32] text-stone-700 hover:text-[#4A3B32] rounded-full transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={searchData.children === 0}
                      >
                        <span className="text-lg leading-none">-</span>
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{searchData.children}</span>
                      <button
                        onClick={() => incrementGuests('children')}
                        className="w-8 h-8 border-2 border-stone-300 hover:border-[#4A3B32] text-stone-700 hover:text-[#4A3B32] rounded-full transition-all flex items-center justify-center"
                      >
                        <span className="text-lg leading-none">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Bottom row: Search Button */}
          <button
            onClick={handleSearch}
            className="w-full px-8 py-4 bg-[#2C2420] hover:bg-[#1a1410] text-white transition-all flex items-center justify-center gap-3 font-semibold text-base tracking-wide uppercase border-t border-stone-200"
            aria-label={t.search}
          >
            <Search className="w-5 h-5" />
            <span>{t.search}</span>
          </button>
        </div>
      </div>

      {/* Calendar Dropdown - Compact */}
      {calendarType && (
        <div className="absolute left-0 right-0 md:left-auto md:right-auto mt-2 bg-white border border-stone-200 shadow-xl p-4 w-full md:w-80 z-50 rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 hover:bg-stone-100 transition-colors rounded"
            >
              <ChevronLeft className="w-4 h-4 text-stone-600" />
            </button>
            <div className="text-sm font-display font-medium text-stone-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 hover:bg-stone-100 transition-colors rounded"
            >
              <ChevronRight className="w-4 h-4 text-stone-600" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-stone-500 uppercase py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="p-1.5" />
              }

              const disabled = isDateDisabled(date, calendarType)
              const selected = isSelectedDate(date, calendarType)

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDayClick(date, calendarType)}
                  disabled={disabled}
                  className={`
                    p-1.5 text-xs font-light transition-all rounded
                    ${disabled
                      ? 'text-stone-300 cursor-not-allowed'
                      : 'text-stone-900 hover:bg-stone-900 hover:text-white cursor-pointer'
                    }
                    ${selected
                      ? 'bg-stone-900 text-white font-medium'
                      : ''
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertySearchBar
