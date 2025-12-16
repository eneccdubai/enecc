import React from 'react'
import { Building2, Briefcase, Home, CreditCard, FileText, Globe2, Sparkles } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const Services = () => {
  const { t } = useLanguage()
  const [headerRef, headerVisible] = useScrollAnimation({ once: true, threshold: 0.2 })
  const [cardsRef, cardsVisible] = useScrollAnimation({ once: true, threshold: 0.1 })

  const icons = [Building2, Briefcase, Home, Globe2, CreditCard, FileText, Sparkles]

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className={`text-center mb-16 ${headerVisible ? 'opacity-100' : 'opacity-0-initial'}`}>
          <div className={`inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-5 py-2 mb-6 ${headerVisible ? 'animate-fade-in-down' : ''}`}>
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span className="text-gold-600 dark:text-gold-400 text-sm font-semibold">{t.services.badge}</span>
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-gray-900 dark:text-white mb-6 ${headerVisible ? 'animate-fade-in-up delay-100' : ''}`}>
            {t.services.title}
            <span className="text-gold-500"> {t.services.titleHighlight}</span>
          </h2>
          <p className={`text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto ${headerVisible ? 'animate-fade-in-up delay-200' : ''}`}>
            {t.services.subtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.services.items.map((service, index) => {
            const Icon = icons[index]
            const delayClass = `delay-${(index + 1) * 100}`
            return (
              <div
                key={index}
                className={`group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-gold-500/50 transform hover:-translate-y-2 hover:scale-105 ${cardsVisible ? `animate-fade-in-up ${delayClass}` : 'opacity-0-initial'}`}
              >
                <div className="bg-gradient-to-br from-gold-500 to-gold-600 text-white rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-montserrat font-bold text-gray-900 dark:text-white mb-3 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <button
            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            className="bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl inline-flex items-center space-x-2"
          >
            <span>{t.services.cta}</span>
            <Briefcase className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default Services
