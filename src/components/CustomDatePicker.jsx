import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CustomDatePicker = ({ value, onChange, minDate, label, language, disabledDates = [] }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const monthNames = language === 'es'
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const dayNames = language === 'es'
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const formatDate = (dateString) => {
    if (!dateString) return ''
    // Parsear la fecha en formato YYYY-MM-DD sin problemas de zona horaria
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

  const handleDayClick = (date) => {
    if (!date) return

    const min = minDate ? new Date(minDate) : new Date()
    min.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    if (date < min) return

    // Crear fecha string manualmente para evitar problemas de zona horaria
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    onChange(dateString)
    setIsOpen(false)
  }

  const isDateDisabled = (date) => {
    if (!date) return true

    // Verificar si es anterior a minDate
    const min = minDate ? new Date(minDate) : new Date()
    min.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    if (date < min) return true

    // Verificar si la fecha está en las fechas bloqueadas
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return disabledDates.includes(dateString)
  }

  const isSelectedDate = (date) => {
    if (!date || !value) return false
    // Parsear la fecha seleccionada sin problemas de zona horaria
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

  const days = getDaysInMonth(currentMonth)

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer w-full px-0 py-4 sm:py-5 border-0 border-b-2 border-stone-200 hover:border-stone-400 transition-all outline-none bg-transparent"
      >
        <div className="text-stone-900 text-base sm:text-lg font-light">
          {value ? formatDate(value) : (
            <span className="text-stone-300">
              {language === 'es' ? 'Seleccionar' : 'Select'}
            </span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-stone-200 shadow-2xl p-6 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-stone-100 transition-colors rounded"
            >
              <ChevronLeft className="w-5 h-5 text-stone-600" />
            </button>
            <div className="text-base font-display font-light text-stone-900 tracking-tight">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-stone-100 transition-colors rounded"
            >
              <ChevronRight className="w-5 h-5 text-stone-600" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-light text-stone-400 tracking-wide uppercase p-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="p-2" />
              }

              const disabled = isDateDisabled(date)
              const selected = isSelectedDate(date)

              // Verificar si la fecha está bloqueada (reservada)
              const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
              const isBlocked = disabledDates.includes(dateString)

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDayClick(date)}
                  disabled={disabled}
                  className={`
                    p-2 text-sm font-light transition-all relative
                    ${disabled
                      ? 'text-stone-300 cursor-not-allowed'
                      : 'text-stone-900 hover:bg-stone-900 hover:text-white cursor-pointer'
                    }
                    ${selected
                      ? 'bg-stone-900 text-white'
                      : ''
                    }
                    ${isBlocked && !disabled
                      ? 'bg-red-100 text-red-600 line-through'
                      : ''
                    }
                  `}
                  title={isBlocked ? (language === 'es' ? 'Fecha no disponible (reservada)' : 'Date unavailable (booked)') : ''}
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

export default CustomDatePicker
