import React from 'react'
import { TrendingUp, Shield, Users, Award, CheckCircle2, Key } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const Benefits = () => {
  const { t } = useLanguage()
  const [headerRef, headerVisible] = useScrollAnimation({ once: true, threshold: 0.2 })
  const [cardsRef, cardsVisible] = useScrollAnimation({ once: true, threshold: 0.1 })

  // Íconos específicos del sector inmobiliario de lujo:
  // TrendingUp = Maximize Income (gráfico ascendente)
  // Key = Complete Management (gestión completa con llaves)
  // CheckCircle2 = Servicios premium/calidad
  // Shield = Seguridad/protección
  // Users = Comunidad/huéspedes
  // Award = Reconocimiento/excelencia
  const icons = [TrendingUp, Key, CheckCircle2, Shield, Users, Award]

  return (
    <section id="benefits" className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-900 text-gray-900 dark:text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-gold-500/5 rounded-full blur-3xl top-20 left-20"></div>
        <div className="absolute w-96 h-96 bg-gold-500/5 rounded-full blur-3xl bottom-20 right-20"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className={`text-center mb-16 ${headerVisible ? 'opacity-100' : 'opacity-0-initial'}`}>
          <div className={`inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-5 py-2 mb-6 ${headerVisible ? 'animate-fade-in-down' : ''}`}>
            <Award className="w-4 h-4 text-gold-500" />
            <span className="text-gold-600 dark:text-gold-400 text-sm font-semibold">{t.benefits.badge}</span>
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-display mb-6 ${headerVisible ? 'animate-fade-in-up delay-100' : ''}`} style={{ fontWeight: 500 }}>
            {t.benefits.title}
            <span className="text-gold-500"> {t.benefits.titleHighlight}</span>
          </h2>
          <p className={`text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto ${headerVisible ? 'animate-fade-in-up delay-200' : ''}`}>
            {t.benefits.subtitle}
          </p>
        </div>

        {/* Benefits Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.benefits.items.map((benefit, index) => {
            const Icon = icons[index]
            const delayClass = `delay-${(index + 1) * 100}`
            return (
              <div
                key={index}
                className={`group relative bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-white/10 hover:border-gold-500/50 transition-all duration-300 shadow-lg hover:shadow-xl dark:hover:bg-white/10 transform hover:-translate-y-2 hover:scale-105 ${cardsVisible ? `animate-scale-in ${delayClass}` : 'opacity-0-initial'}`}
              >
                {/* Stat Badge */}
                <div className="absolute top-6 right-6 bg-gold-500/20 text-gold-600 dark:text-gold-400 px-3 py-1 rounded-full text-sm font-bold border border-gold-500/30">
                  {benefit.stat}
                </div>

                <div className="text-gold-500 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-montserrat font-bold mb-4 text-gray-900 dark:text-white group-hover:text-gold-500 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-gradient-to-r from-gold-500 to-gold-600 rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-montserrat font-bold text-black mb-4">
            {t.benefits.extraTitle}
          </h3>
          <p className="text-black/80 text-lg mb-6 max-w-3xl mx-auto">
            {t.benefits.extraSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-black">
            <div>
              <div className="text-5xl font-bold font-montserrat">0%</div>
              <div className="text-sm font-semibold mt-1">{t.benefits.extraStat1}</div>
            </div>
            <div>
              <div className="text-5xl font-bold font-montserrat">0%</div>
              <div className="text-sm font-semibold mt-1">{t.benefits.extraStat2}</div>
            </div>
            <div>
              <div className="text-5xl font-bold font-montserrat">0%</div>
              <div className="text-sm font-semibold mt-1">{t.benefits.extraStat3}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Benefits
