import React, { useState } from 'react'
import { Building2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const DubaiShowcase = () => {
  const { t } = useLanguage()
  const [headerRef, headerVisible] = useScrollAnimation({ once: true, threshold: 0.2 })
  const [galleryRef, galleryVisible] = useScrollAnimation({ once: true, threshold: 0.1 })
  const [currentSlide, setCurrentSlide] = useState(0)

  const dubaiImages = [
    {
      id: 1,
      title: 'Burj Khalifa',
      description: 'El edificio más alto del mundo',
      location: 'Downtown Dubai',
      placeholder: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80'
    },
    {
      id: 2,
      title: 'Burj Al Arab',
      description: 'Icónico hotel de lujo',
      location: 'Jumeirah',
      placeholder: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800&q=80'
    },
    {
      id: 3,
      title: 'Dubai Marina',
      description: 'Skyline moderno y vibrante',
      location: 'Dubai Marina',
      placeholder: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80'
    },
    {
      id: 4,
      title: 'Palm Jumeirah',
      description: 'Isla artificial icónica',
      location: 'Palm Jumeirah',
      placeholder: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % dubaiImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + dubaiImages.length) % dubaiImages.length)
  }

  return (
    <section id="dubai-showcase" className="py-32 bg-white relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className={`text-center mb-20 ${headerVisible ? 'opacity-100' : 'opacity-0-initial'}`}>
          <div className={`inline-flex items-center space-x-2 border-b border-stone-200 pb-2 mb-8 ${headerVisible ? 'animate-fade-in-down' : ''}`}>
            <span className="text-stone-500 text-xs font-light tracking-widest uppercase">
              {t.language === 'es' ? 'Descubre Dubai' : 'Discover Dubai'}
            </span>
          </div>
          <h2 className={`text-5xl md:text-7xl font-display font-light text-stone-900 mb-6 tracking-tight ${headerVisible ? 'animate-fade-in-up delay-100' : ''}`}>
            {t.language === 'es' ? 'Tu Futuro en ' : 'Your Future in '}
            <span className="text-stone-600">Dubai</span>
          </h2>
          <p className={`text-base text-stone-500 max-w-2xl mx-auto font-light ${headerVisible ? 'animate-fade-in-up delay-200' : ''}`}>
            {t.language === 'es'
              ? 'Una ciudad de oportunidades ilimitadas, donde la innovación se encuentra con el lujo'
              : 'A city of unlimited opportunities, where innovation meets luxury'
            }
          </p>
        </div>

        {/* Slider principal */}
        <div ref={galleryRef} className={`relative mb-24 ${galleryVisible ? 'animate-scale-in' : 'opacity-0-initial'}`}>
          <div className="relative h-[500px] overflow-hidden">
            {dubaiImages.map((image, index) => (
              <div
                key={image.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
                    <Building2 className="w-16 h-16 text-stone-400 mx-auto mb-4 opacity-50" />
                    <p className="text-white text-sm font-light opacity-80">Espacio para imagen</p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-10 z-20">
                    <div className="flex items-center space-x-2 mb-3">
                      <MapPin className="w-4 h-4 text-white/70" />
                      <span className="text-white/70 text-xs font-light tracking-wider uppercase">{image.location}</span>
                    </div>
                    <h3 className="text-4xl font-display font-light text-white mb-2 tracking-tight">
                      {image.title}
                    </h3>
                    <p className="text-white/80 text-sm font-light">{image.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Botones de navegación - minimalistas */}
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 border border-white/30 hover:border-white bg-transparent hover:bg-white/10 text-white p-3 transition-all z-30 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 border border-white/30 hover:border-white bg-transparent hover:bg-white/10 text-white p-3 transition-all z-30 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Indicadores de slide - minimalistas */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
              {dubaiImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-px transition-all ${
                    index === currentSlide
                      ? 'bg-white w-12'
                      : 'bg-white/40 w-8 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Grid de características - sin boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-stone-200 pt-16">
          {[
            {
              title: t.language === 'es' ? 'Arquitectura Moderna' : 'Modern Architecture',
              description: t.language === 'es'
                ? 'Edificios icónicos que definen el skyline'
                : 'Iconic buildings that define the skyline',
              icon: Building2
            },
            {
              title: t.language === 'es' ? 'Ubicación Estratégica' : 'Strategic Location',
              description: t.language === 'es'
                ? 'Centro de negocios del Medio Oriente'
                : 'Business hub of the Middle East',
              icon: MapPin
            },
            {
              title: t.language === 'es' ? 'Estilo de Vida Premium' : 'Premium Lifestyle',
              description: t.language === 'es'
                ? 'Lujo y comodidad en cada detalle'
                : 'Luxury and comfort in every detail',
              icon: Building2
            }
          ].map((feature, index) => {
            const Icon = feature.icon
            const delayClass = `delay-${(index + 1) * 100}`
            return (
              <div
                key={index}
                className={`space-y-4 ${galleryVisible ? `animate-fade-in-up ${delayClass}` : 'opacity-0-initial'}`}
              >
                <Icon className="w-6 h-6 text-stone-400" />
                <h3 className="text-xl font-display font-light text-stone-900">
                  {feature.title}
                </h3>
                <p className="text-stone-500 text-sm font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default DubaiShowcase
