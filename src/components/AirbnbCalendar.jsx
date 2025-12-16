import React from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const AirbnbCalendar = () => {
  const { t } = useLanguage()

  return (
    <section id="calendar" className="py-24 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-5 py-2 mb-6">
            <Calendar className="w-4 h-4 text-gold-500" />
            <span className="text-gold-600 dark:text-gold-400 text-sm font-semibold">{t.calendar.badge}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-gray-900 dark:text-white mb-6">
            {t.calendar.title}
            <span className="text-gold-500"> {t.calendar.titleHighlight}</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t.calendar.subtitle}
          </p>
        </div>

        {/* Calendar and Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Embed */}
          <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="aspect-video w-full bg-white dark:bg-gray-700 rounded-xl shadow-inner flex items-center justify-center border border-gray-200 dark:border-gray-600">
              <div className="text-center p-8">
                <Calendar className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t.calendar.calendarTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t.calendar.calendarSubtitle}
                </p>
                <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-4 text-left text-sm text-gray-700 dark:text-gray-200 space-y-2">
                  <p className="font-semibold">{t.calendar.instructionsTitle}</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Obtén el link de embed de tu calendario</li>
                    <li>Edita AirbnbCalendar.jsx</li>
                    <li>Agrega el iframe con tu URL</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Quick Booking Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <Clock className="w-6 h-6 text-gold-500 mb-2" />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{t.calendar.duration}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t.calendar.durationLabel}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <MapPin className="w-6 h-6 text-gold-500 mb-2" />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{t.calendar.format}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t.calendar.formatLabel}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <Calendar className="w-6 h-6 text-gold-500 mb-2" />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{t.calendar.schedule}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t.calendar.scheduleTime}</div>
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-black to-gray-900 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-montserrat font-bold mb-6">
                {t.calendar.contactTitle}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-gold-400 text-sm font-semibold mb-1">{t.calendar.phone}</div>
                  <a href="tel:+971523730416" className="text-white hover:text-gold-400 transition-colors">
                    +971 52 373 0416
                  </a>
                </div>
                <div>
                  <div className="text-gold-400 text-sm font-semibold mb-1">{t.calendar.email}</div>
                  <a href="mailto:enecc.team@gmail.com" className="text-white hover:text-gold-400 transition-colors break-all">
                    enecc.team@gmail.com
                  </a>
                </div>
                <div>
                  <div className="text-gold-400 text-sm font-semibold mb-1">{t.calendar.location}</div>
                  <p className="text-white text-sm whitespace-pre-line">
                    {t.calendar.locationAddress}
                  </p>
                </div>
                <div>
                  <div className="text-gold-400 text-sm font-semibold mb-1">{t.calendar.hours}</div>
                  <p className="text-white text-sm whitespace-pre-line">
                    {t.calendar.hoursText}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gold-500 rounded-2xl p-6 text-black">
              <h4 className="font-bold text-lg mb-2">{t.calendar.freeConsultTitle}</h4>
              <p className="text-sm">
                {t.calendar.freeConsultText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AirbnbCalendar
