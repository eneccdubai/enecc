import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const Hero = () => {
  const { language } = useLanguage()

  return (
    <section id="home" className="relative overflow-hidden bg-white">
      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-20">
        {/* Grid Layout: Texto (izquierda) + Imagen (derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Columna Izquierda: Contenido */}
          <div className="space-y-6 md:space-y-8 text-left">
            {/* Badge - minimalista */}
            <div className="inline-flex items-center space-x-2 border-b border-stone-300 pb-2">
              <span className="text-stone-500 text-xs font-light tracking-widest uppercase">
                {language === 'es' ? 'Propiedades Premium en Dubai' : 'Premium Properties in Dubai'}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-stone-900 leading-[1.1] tracking-tight" style={{ fontWeight: 700 }}>
              {language === 'es' ? 'Propiedades' : 'Premium'}
              <br />
              {language === 'es' ? 'Premium en' : 'Properties in'}
              <br />
              <span className="text-stone-500">Dubai</span>
            </h1>

            {/* Subheading */}
            <p className="text-sm md:text-base text-stone-500 max-w-lg leading-relaxed font-light">
              {language === 'es'
                ? 'Descubre nuestra selección exclusiva de apartamentos y propiedades de lujo en las mejores ubicaciones de Dubai.'
                : 'Discover our exclusive selection of luxury apartments and properties in Dubai\'s finest locations.'
              }
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 pt-2">
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
            <div className="relative h-[500px] xl:h-[600px] w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]">
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
      <div className="relative bg-neutral-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-0">
            <div className="text-center space-y-2 py-4">
              <div className="text-5xl md:text-6xl font-display text-stone-900 tracking-tight" style={{ fontWeight: 700 }}>50+</div>
              <div className="text-stone-500 text-xs font-light tracking-widest uppercase px-4">
                {language === 'es' ? 'Propiedades Gestionadas' : 'Properties Managed'}
              </div>
            </div>
            <div className="text-center space-y-2 py-4 sm:border-l sm:border-r border-stone-200">
              <div className="text-5xl md:text-6xl font-display text-stone-900 tracking-tight" style={{ fontWeight: 700 }}>95%</div>
              <div className="text-stone-500 text-xs font-light tracking-widest uppercase px-4">
                {language === 'es' ? 'Tasa de Ocupación' : 'Occupancy Rate'}
              </div>
            </div>
            <div className="text-center space-y-2 py-4">
              <div className="text-5xl md:text-6xl font-display text-stone-900 tracking-tight" style={{ fontWeight: 700 }}>4.9★</div>
              <div className="text-stone-500 text-xs font-light tracking-widest uppercase px-4">
                {language === 'es' ? 'Valoración Media' : 'Average Rating'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="relative bg-stone-950 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-stone-500 text-[10px] font-light tracking-[0.25em] uppercase mb-8">
            {language === 'es' ? 'Nuestros Partners' : 'Our Partners'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16 lg:gap-x-20">
            {[
              'Booking.com',
              'Airbnb',
              'VRBO',
              'HomeAway',
              'Agoda',
              'Expedia'
            ].map((partner, i, arr) => (
              <div key={partner} className="flex items-center gap-x-10 md:gap-x-16 lg:gap-x-20">
                <span className="text-stone-400 text-base md:text-lg tracking-widest uppercase font-light select-none">
                  {partner}
                </span>
                {i < arr.length - 1 && (
                  <span className="hidden sm:block w-px h-4 bg-stone-700" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
