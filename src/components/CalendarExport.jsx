/**
 * Componente para servir archivos iCalendar (.ics) públicamente
 * Se accede mediante: /calendar/{token}.ics
 *
 * Este componente busca la propiedad por su token único y genera
 * el archivo .ics con todas sus reservas
 */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase/config'
import { generateICalendar } from '../utils/icalendar'

const CalendarExport = () => {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const generateAndServeCalendar = async () => {
      try {
        // Extraer el token (remover .ics si está presente)
        const cleanToken = token.replace('.ics', '')

        // 1. Buscar la propiedad por su token de exportación
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('ical_export_token', cleanToken)
          .single()

        if (propertyError || !property) {
          setStatus('not-found')
          return
        }

        // 2. Obtener todas las reservas confirmadas de esta propiedad
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('property_id', property.id)
          .eq('status', 'confirmed')
          .gte('check_out', new Date().toISOString().split('T')[0]) // Solo reservas futuras y actuales

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError)
          setStatus('error')
          return
        }

        // 3. Generar el contenido del archivo iCalendar
        const icsContent = generateICalendar(bookings || [], property)

        // 4. Crear el archivo y forzar descarga
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
        const url = URL.createObjectURL(blob)

        // Crear un link temporal y simular click para descargar
        const link = document.createElement('a')
        link.href = url
        link.download = `${property.name.replace(/\s+/g, '-')}-calendar.ics`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setStatus('success')
      } catch (error) {
        console.error('Error generating calendar:', error)
        setStatus('error')
      }
    }

    if (token) {
      generateAndServeCalendar()
    }
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-stone-200 p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
              Generating Calendar
            </h2>
            <p className="text-stone-500 text-sm font-light">
              Please wait while we generate your iCalendar file...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
              Calendar Downloaded
            </h2>
            <p className="text-stone-500 text-sm font-light mb-6">
              Your calendar file has been downloaded successfully. You can now import it into Airbnb, Booking.com, or any other calendar application.
            </p>
            <button
              onClick={() => window.close()}
              className="bg-stone-900 hover:bg-stone-800 text-white font-light py-3 px-6 transition-all text-sm tracking-wide"
            >
              Close
            </button>
          </>
        )}

        {status === 'not-found' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
              Calendar Not Found
            </h2>
            <p className="text-stone-500 text-sm font-light">
              The calendar you're looking for doesn't exist or the link has expired.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
              Error
            </h2>
            <p className="text-stone-500 text-sm font-light">
              There was an error generating your calendar. Please try again later.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default CalendarExport
