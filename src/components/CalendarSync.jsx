import React, { useState, useEffect } from 'react'
import { Calendar, RefreshCw, Download, Link2, Check, X, AlertCircle, Copy } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { syncExternalCalendars, updateCalendarURLs, exportPropertyCalendar, getExportCalendarURL } from '../utils/calendarSync'
import { downloadICS } from '../utils/icalendar'

const CalendarSync = ({ property, onUpdate }) => {
  const { language } = useLanguage()
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [exportUrl, setExportUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    airbnb: property.airbnb_ical_url || '',
    booking: property.booking_ical_url || '',
    vrbo: property.vrbo_ical_url || '',
    syncEnabled: property.ical_sync_enabled || false
  })

  // Cargar URL de exportación
  useEffect(() => {
    const loadExportUrl = async () => {
      try {
        const url = await getExportCalendarURL(property.id)
        setExportUrl(url)
      } catch (error) {
        console.error('Error cargando URL de exportación:', error)
      }
    }
    loadExportUrl()
  }, [property.id])

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)

    try {
      const result = await syncExternalCalendars(property.id)
      setSyncResult(result)

      if (result.success && onUpdate) {
        onUpdate()
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: error.message
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleSaveUrls = async () => {
    setSaving(true)

    try {
      const result = await updateCalendarURLs(property.id, {
        airbnb: formData.airbnb.trim(),
        booking: formData.booking.trim(),
        vrbo: formData.vrbo.trim(),
        syncEnabled: formData.syncEnabled
      })

      if (result.success) {
        setSyncResult({
          success: true,
          message: language === 'es' ? 'URLs guardadas correctamente' : 'URLs saved successfully'
        })

        if (onUpdate) {
          onUpdate()
        }
      } else {
        setSyncResult({
          success: false,
          message: result.message
        })
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: error.message
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const icsContent = await exportPropertyCalendar(property.id)
      downloadICS(icsContent, `${property.name.replace(/\s+/g, '-')}-calendar.ics`)

      setSyncResult({
        success: true,
        message: language === 'es' ? 'Calendario exportado correctamente' : 'Calendar exported successfully'
      })
    } catch (error) {
      setSyncResult({
        success: false,
        message: error.message
      })
    }
  }

  const copyExportUrl = () => {
    if (exportUrl) {
      navigator.clipboard.writeText(exportUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const lastSyncText = property.ical_last_sync
    ? new Date(property.ical_last_sync).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')
    : language === 'es' ? 'Nunca' : 'Never'

  return (
    <div className="bg-white border border-stone-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-stone-900" />
          <h3 className="text-xl font-display font-light text-stone-900 tracking-tight">
            {language === 'es' ? 'Sincronización de Calendarios' : 'Calendar Synchronization'}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`sync-enabled-${property.id}`}
            checked={formData.syncEnabled}
            onChange={(e) => setFormData({ ...formData, syncEnabled: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor={`sync-enabled-${property.id}`} className="text-sm font-light text-stone-600">
            {language === 'es' ? 'Activar sincronización' : 'Enable sync'}
          </label>
        </div>
      </div>

      <div className="text-xs text-stone-500 font-light">
        {language === 'es' ? 'Última sincronización:' : 'Last sync:'} {lastSyncText}
      </div>

      {/* Import URLs */}
      <div className="space-y-4">
        <h4 className="text-sm font-light text-stone-500 tracking-widest uppercase">
          {language === 'es' ? 'Importar desde:' : 'Import from:'}
        </h4>

        <div>
          <label className="block text-xs font-light text-stone-500 mb-2">
            Airbnb iCal URL
          </label>
          <input
            type="url"
            value={formData.airbnb}
            onChange={(e) => setFormData({ ...formData, airbnb: e.target.value })}
            placeholder="https://www.airbnb.com/calendar/ical/..."
            className="w-full px-3 py-2 border border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
          />
        </div>

        <div>
          <label className="block text-xs font-light text-stone-500 mb-2">
            Booking.com iCal URL
          </label>
          <input
            type="url"
            value={formData.booking}
            onChange={(e) => setFormData({ ...formData, booking: e.target.value })}
            placeholder="https://admin.booking.com/hotel/..."
            className="w-full px-3 py-2 border border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
          />
        </div>

        <div>
          <label className="block text-xs font-light text-stone-500 mb-2">
            VRBO iCal URL
          </label>
          <input
            type="url"
            value={formData.vrbo}
            onChange={(e) => setFormData({ ...formData, vrbo: e.target.value })}
            placeholder="https://www.vrbo.com/..."
            className="w-full px-3 py-2 border border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
          />
        </div>
      </div>

      {/* Export URL */}
      <div className="space-y-2 pt-4 border-t border-stone-200">
        <h4 className="text-sm font-light text-stone-500 tracking-widest uppercase">
          {language === 'es' ? 'Exportar a otras plataformas:' : 'Export to other platforms:'}
        </h4>

        {exportUrl && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={exportUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-stone-200 bg-stone-50 text-stone-600 text-sm font-light"
            />
            <button
              onClick={copyExportUrl}
              className="flex items-center space-x-2 px-4 py-2 border border-stone-300 hover:border-stone-900 text-stone-900 transition-all text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (language === 'es' ? 'Copiado' : 'Copied') : (language === 'es' ? 'Copiar' : 'Copy')}</span>
            </button>
          </div>
        )}

        <p className="text-xs text-stone-400 font-light">
          {language === 'es'
            ? 'Usa esta URL para importar tu calendario en Airbnb, Booking.com u otras plataformas'
            : 'Use this URL to import your calendar in Airbnb, Booking.com or other platforms'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          onClick={handleSaveUrls}
          disabled={saving}
          className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-light py-3 transition-all text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{language === 'es' ? 'Guardando...' : 'Saving...'}</span>
            </span>
          ) : (
            language === 'es' ? 'Guardar URLs' : 'Save URLs'
          )}
        </button>

        <button
          onClick={handleSync}
          disabled={syncing || !formData.syncEnabled}
          className="flex items-center justify-center space-x-2 px-6 py-3 border border-stone-300 hover:border-stone-900 text-stone-900 transition-all text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? (language === 'es' ? 'Sincronizando...' : 'Syncing...') : (language === 'es' ? 'Sincronizar Ahora' : 'Sync Now')}</span>
        </button>

        <button
          onClick={handleExport}
          className="flex items-center justify-center space-x-2 px-6 py-3 border border-stone-300 hover:border-stone-900 text-stone-900 transition-all text-sm tracking-wide"
        >
          <Download className="w-4 h-4" />
          <span>{language === 'es' ? 'Exportar .ics' : 'Export .ics'}</span>
        </button>
      </div>

      {/* Result Message */}
      {syncResult && (
        <div className={`flex items-start space-x-3 p-4 border ${
          syncResult.success
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          {syncResult.success ? (
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="text-sm font-light">{syncResult.message}</p>
            {syncResult.imported !== undefined && (
              <p className="text-xs mt-1 opacity-75">
                {language === 'es'
                  ? `${syncResult.imported} importadas, ${syncResult.skipped} omitidas de ${syncResult.total} total`
                  : `${syncResult.imported} imported, ${syncResult.skipped} skipped of ${syncResult.total} total`}
              </p>
            )}
          </div>
          <button
            onClick={() => setSyncResult(null)}
            className="text-current opacity-50 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-stone-50 border border-stone-200 p-4 text-xs text-stone-600 font-light space-y-2">
        <p className="font-medium text-stone-900">
          {language === 'es' ? '¿Cómo obtener las URLs de iCalendar?' : 'How to get iCalendar URLs?'}
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            <strong>Airbnb:</strong> {language === 'es'
              ? 'Ve a tu anuncio → Calendario → Disponibilidad → Sincronizar calendarios → Exportar calendario'
              : 'Go to your listing → Calendar → Availability → Sync calendars → Export calendar'}
          </li>
          <li>
            <strong>Booking.com:</strong> {language === 'es'
              ? 'Extranet → Calendario → Sincronización de calendarios → Exportar'
              : 'Extranet → Calendar → Calendar sync → Export'}
          </li>
          <li>
            <strong>VRBO:</strong> {language === 'es'
              ? 'Dashboard → Calendario → Sincronizar calendarios → Exportar'
              : 'Dashboard → Calendar → Sync calendars → Export'}
          </li>
        </ul>
        <p className="pt-2 text-stone-500">
          {language === 'es'
            ? '⏰ La sincronización automática ocurre cada 3 horas cuando está activada.'
            : '⏰ Automatic sync occurs every 3 hours when enabled.'}
        </p>
      </div>
    </div>
  )
}

export default CalendarSync
