import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import PropertySearchBar from './PropertySearchBar'

const Hero = ({ onFilterChange }) => {
  const { language } = useLanguage()

  const handleSearch = (searchData) => {
    console.log('Search data:', searchData)
    // Pasar los filtros al componente padre
    if (onFilterChange) {
      onFilterChange(searchData)
    }

    // Scroll suave a la sección de propiedades
    const propertiesSection = document.getElementById('properties')
    if (propertiesSection) {
      propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-[#FFFEFC] to-[#F2EBE5]">
      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-20">
        {/* Grid Layout: Texto (izquierda) + Imagen (derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Columna Izquierda: Contenido */}
          <div className="space-y-6 md:space-y-8 text-left">
            {/* Badge - minimalista */}
            <div className="inline-flex items-center space-x-2 border-b border-[#D4C4B6] pb-2">
              <span className="text-[#333333] text-xs font-light tracking-widest uppercase">
                {language === 'es' ? 'Gestión de Propiedades en Dubai' : 'Property Management in Dubai'}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#333333] leading-[1.1] tracking-tight" style={{ fontWeight: 500 }}>
              {language === 'es' ? 'Alquila tu' : 'Rent Your'}
              <br />
              {language === 'es' ? 'Propiedad en' : 'Property in'}
              <br />
              <span className="text-[#4A3B32]">Dubai</span>
            </h1>

            {/* Subheading */}
            <p className="text-sm md:text-base text-[#333333]/80 max-w-lg leading-relaxed font-light">
              {language === 'es'
                ? 'Encuentra el apartamento perfecto o publica tu propiedad. Gestión profesional garantizada.'
                : 'Find the perfect apartment or list your property. Professional management guaranteed.'
              }
            </p>

            {/* Search Bar */}
            <div className="pt-2 pb-4">
              <PropertySearchBar onSearch={handleSearch} />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => document.getElementById('properties').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto btn-animate bg-[#4A3B32] hover:bg-[#3a2e26] text-white px-8 py-3.5 font-light text-sm tracking-widest transition-all uppercase shadow-md hover:shadow-lg rounded-lg"
              >
                {language === 'es' ? 'Ver Propiedades' : 'View Properties'}
              </button>
              <button
                onClick={() => document.getElementById('owner-contact').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto btn-scale bg-[#D4C4B6] hover:bg-[#c4b4a6] text-[#333333] px-8 py-3.5 font-light text-sm tracking-widest transition-all uppercase shadow-md hover:shadow-lg rounded-lg"
              >
                {language === 'es' ? 'Publicar Propiedad' : 'List Property'}
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#4A3B32]/30 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Parte del flujo normal */}
      <div className="relative bg-gradient-to-b from-transparent to-[#F2EBE5] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-0">
            <div className="text-center space-y-2 py-4">
              <div className="text-5xl md:text-6xl font-display text-[#333333] tracking-tight" style={{ fontWeight: 500 }}>50+</div>
              <div className="text-[#333333]/60 text-xs font-sans font-light tracking-widest uppercase px-4">
                {language === 'es' ? 'Propiedades Gestionadas' : 'Properties Managed'}
              </div>
            </div>
            <div className="text-center space-y-2 py-4 sm:border-l sm:border-r border-[rgba(74,59,50,0.1)]">
              <div className="text-5xl md:text-6xl font-display text-[#333333] tracking-tight" style={{ fontWeight: 500 }}>95%</div>
              <div className="text-[#333333]/60 text-xs font-sans font-light tracking-widest uppercase px-4">
                {language === 'es' ? 'Tasa de Ocupación' : 'Occupancy Rate'}
              </div>
            </div>
            <div className="text-center space-y-2 py-4">
              <div className="text-5xl md:text-6xl font-display text-[#333333] tracking-tight" style={{ fontWeight: 500 }}>4.9★</div>
              <div className="text-[#333333]/60 text-xs font-sans font-light tracking-widest uppercase px-4">
                {language === 'es' ? 'Valoración Media' : 'Average Rating'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
