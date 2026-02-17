import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const Hero = () => {
  const { language } = useLanguage()
  const [statsRef, statsVisible] = useScrollAnimation({ once: true, threshold: 0.2 })
  const [partnersRef, partnersVisible] = useScrollAnimation({ once: true, threshold: 0.2 })

  const storageBase = 'https://grmsqbcyzgonwvbmoeex.supabase.co/storage/v1/object/public/property-images/partners'
  const partners = [
    { name: 'Booking.com', src: `${storageBase}/booking.png`, h: 'h-8 md:h-11' },
    { name: 'Airbnb', src: `${storageBase}/airbnb.png`, h: 'h-10 md:h-14' },
    { name: 'VRBO', src: `${storageBase}/vrbo.png`, h: 'h-10 md:h-14' },
    { name: 'Agoda', src: `${storageBase}/agoda.png`, h: 'h-10 md:h-14' },
    { name: 'Expedia', src: `${storageBase}/expedia.png`, h: 'h-10 md:h-14' },
    { name: 'Dubai Economy & Tourism', src: `${storageBase}/dubai-economy-tourism.png`, h: 'h-10 md:h-14' },
    { name: 'Government of Dubai', src: `${storageBase}/government-of-dubai.png`, h: 'h-8 md:h-12' },
  ]

  return (
    <section id="home" className="relative overflow-hidden bg-white">
      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-32 md:pb-20">
        {/* Grid Layout: Texto (izquierda) + Imagen (derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Columna Izquierda: Contenido */}
          <div className="space-y-6 md:space-y-8 text-left">
            {/* Badge - minimalista */}
            <div className="opacity-0-initial animate-fade-in-up inline-flex items-center space-x-2 border-b border-stone-300 pb-2">
              <span className="text-stone-500 text-xs font-light tracking-widest uppercase">
                {language === 'es' ? 'Propiedades Premium en Dubai' : 'Premium Properties in Dubai'}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="opacity-0-initial animate-fade-in-up delay-200 font-display text-5xl sm:text-5xl md:text-6xl lg:text-7xl text-stone-900 leading-[1.1] tracking-tight" style={{ fontWeight: 700 }}>
              {language === 'es' ? 'Propiedades' : 'Premium'}
              <br />
              {language === 'es' ? 'Premium en' : 'Properties in'}
              <br />
              <span className="text-stone-500">Dubai</span>
            </h1>

            {/* Subheading */}
            <p className="opacity-0-initial animate-fade-in-up delay-300 text-sm md:text-base text-stone-500 max-w-lg leading-relaxed font-light">
              {language === 'es'
                ? 'Descubre nuestra selección exclusiva de apartamentos y propiedades de lujo en las mejores ubicaciones de Dubai.'
                : 'Discover our exclusive selection of luxury apartments and properties in Dubai\'s finest locations.'
              }
            </p>

            {/* CTA Buttons */}
            <div className="opacity-0-initial animate-fade-in-up delay-400 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => document.getElementById('properties').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto btn-animate bg-stone-900 hover:bg-stone-800 text-white px-8 py-3.5 font-light text-sm tracking-widest transition-all uppercase shadow-md hover:shadow-lg rounded-lg"
              >
                {language === 'es' ? 'Explorar Propiedades' : 'Explore Properties'}
              </button>
              <button
                onClick={() => document.getElementById('owner-contact').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto btn-scale bg-neutral-100 hover:bg-neutral-200 text-stone-900 px-8 py-3.5 font-light text-sm tracking-widest transition-all uppercase shadow-md hover:shadow-lg rounded-lg"
              >
                {language === 'es' ? 'Contactar' : 'Contact Us'}
              </button>
            </div>
          </div>

          {/* Columna Derecha: Imagen Vertical */}
          <div className="hidden lg:flex lg:items-center lg:justify-center mt-8 lg:mt-0">
            <div className="opacity-0-initial animate-clip-reveal delay-500 relative h-[500px] xl:h-[600px] w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80"
                alt="Luxury Dubai Interior"
                className="w-full h-full object-cover"
              />
              {/* Overlay sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="relative bg-neutral-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-0">
            {[
              { value: '50+', labelEs: 'Propiedades Gestionadas', labelEn: 'Properties Managed' },
              { value: '95%', labelEs: 'Tasa de Ocupación', labelEn: 'Occupancy Rate', border: true },
              { value: '4.9★', labelEs: 'Valoración Media', labelEn: 'Average Rating' }
            ].map((stat, i) => (
              <div
                key={stat.value}
                className={`${statsVisible ? `animate-fade-in-up delay-${i * 200}` : 'opacity-0-initial'} text-center space-y-2 py-4${stat.border ? ' sm:border-l sm:border-r border-stone-200' : ''}`}
              >
                <div className="text-5xl md:text-6xl font-display text-stone-900 tracking-tight" style={{ fontWeight: 700 }}>{stat.value}</div>
                <div className="text-stone-500 text-xs font-light tracking-widest uppercase px-4">
                  {language === 'es' ? stat.labelEs : stat.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div ref={partnersRef} className="relative bg-white border-t border-stone-200 py-8 md:py-12">
        <p className={`${partnersVisible ? 'animate-fade-in-down' : 'opacity-0-initial'} text-center text-stone-400 text-sm font-light tracking-[0.25em] uppercase mb-8`}>
          {language === 'es' ? 'Nuestros Partners' : 'Our Partners'}
        </p>
        <div className={`${partnersVisible ? 'animate-fade-in-up delay-100' : 'opacity-0-initial'} max-w-4xl mx-auto px-4 sm:px-6 lg:px-8`}>
          <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
            {partners.map((partner) => (
              <div key={partner.name} className="flex-shrink-0">
                <img src={partner.src} alt={partner.name} className={`${partner.h} w-auto object-contain grayscale contrast-200 mix-blend-multiply opacity-80 hover:opacity-100 transition-opacity`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
