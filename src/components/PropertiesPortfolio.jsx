import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Users, Bed, Bath, ChevronLeft, ChevronRight, ExternalLink, Star } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useProperties } from '../contexts/PropertiesContext'

const PropertiesPortfolio = ({ filters = null }) => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [headerRef, headerVisible] = useScrollAnimation({ once: true, threshold: 0.2 })
  const { properties: contextProperties, loading: propertiesLoading } = useProperties()
  const [currentImageIndex, setCurrentImageIndex] = useState({})

  // Función para filtrar propiedades
  const filterProperties = (properties) => {
    if (!filters) return properties

    return properties.filter(property => {
      // Filtro de ubicación
      if (filters.location && !property.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }

      // Filtro de huéspedes
      const totalGuests = filters.adults + filters.children
      if (totalGuests > 0 && property.max_guests < totalGuests) {
        return false
      }

      // Filtro de precio
      if (filters.priceMin > 0 && property.price_per_night < filters.priceMin) {
        return false
      }
      if (filters.priceMax < 2000 && property.price_per_night > filters.priceMax) {
        return false
      }

      // Filtro de habitaciones
      if (filters.bedrooms > 0 && property.bedrooms < filters.bedrooms) {
        return false
      }

      // Filtro de baños
      if (filters.bathrooms > 0 && property.bathrooms < filters.bathrooms) {
        return false
      }

      // Filtro de tipo de propiedad
      if (filters.propertyType && property.property_type?.toLowerCase() !== filters.propertyType.toLowerCase()) {
        return false
      }

      // Filtro de amenities
      if (filters.amenities && filters.amenities.length > 0) {
        const propertyAmenities = (property.amenities || []).map(a => a.toLowerCase())
        const hasAllAmenities = filters.amenities.every(amenity =>
          propertyAmenities.some(pa => pa.includes(amenity.toLowerCase()))
        )
        if (!hasAllAmenities) {
          return false
        }
      }

      return true
    })
  }

  // Propiedades de fallback si no hay ninguna en la BD (actualizadas con el idioma)
  const fallbackProperties = useMemo(() => [
    {
      id: 'fallback-1',
      name: language === 'es' ? 'Apartamento de Lujo en Dubai Marina' : 'Luxury Apartment in Dubai Marina',
      location: 'Dubai Marina, UAE',
      price_per_night: 250,
      currency: 'AED',
      rating: 4.9,
      reviews: 127,
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Kitchen', 'AC'],
      description: language === 'es'
        ? 'Hermoso apartamento con vistas al mar, completamente amueblado y equipado con todas las comodidades modernas.'
        : 'Beautiful apartment with sea views, fully furnished and equipped with all modern amenities.',
      airbnbLink: '#',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop'
      ],
      available: true
    },
    {
      id: 'fallback-2',
      name: language === 'es' ? 'Estudio Moderno en Downtown' : 'Modern Studio in Downtown',
      location: 'Downtown Dubai, UAE',
      price_per_night: 180,
      currency: 'AED',
      rating: 4.8,
      reviews: 89,
      max_guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['WiFi', 'Pool', 'Gym', 'Kitchen', 'AC'],
      description: language === 'es'
        ? 'Estudio elegante cerca de Burj Khalifa, perfecto para parejas o viajeros de negocios.'
        : 'Elegant studio near Burj Khalifa, perfect for couples or business travelers.',
      airbnbLink: '#',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop'
      ],
      available: true
    },
    {
      id: 'fallback-3',
      name: language === 'es' ? 'Penthouse en Palm Jumeirah' : 'Penthouse in Palm Jumeirah',
      location: 'Palm Jumeirah, UAE',
      price_per_night: 450,
      currency: 'AED',
      rating: 5.0,
      reviews: 203,
      max_guests: 6,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Kitchen', 'AC', 'Beach Access'],
      description: language === 'es'
        ? 'Penthouse de lujo con terraza privada y acceso directo a la playa. Vistas espectaculares.'
        : 'Luxury penthouse with private terrace and direct beach access. Spectacular views.',
      airbnbLink: '#',
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop'
      ],
      available: true
    }
  ], [language])

  const landingProperties = useMemo(() => {
    let filtered = (contextProperties || [])
      .filter(property => property.available && (property.show_in_landing ?? true))

    console.log('[PropertiesPortfolio] Total properties from context:', contextProperties?.length || 0)
    console.log('[PropertiesPortfolio] Properties after filtering:', filtered.length)
    console.log('[PropertiesPortfolio] Properties:', filtered.map(p => ({ id: p.id, name: p.name, created_at: p.created_at })))

    // Aplicar filtros si existen
    if (filters) {
      filtered = filterProperties(filtered)
    } else {
      // Si no hay filtros, mostrar solo las primeras 3
      filtered = filtered.slice(0, 3)
    }

    return filtered
  }, [contextProperties, filters])

  // Si no hay propiedades del contexto, usar fallback; si hay filtros, no aplicar slice
  const displayProperties = useMemo(() => {
    if (landingProperties.length > 0) {
      return landingProperties
    }
    // Aplicar filtros también a las propiedades de fallback
    return filters ? filterProperties(fallbackProperties) : fallbackProperties
  }, [landingProperties, fallbackProperties, filters])

  const nextImage = (propertyId) => {
    const property = displayProperties.find(p => p.id === propertyId)
    if (property && property.images) {
      setCurrentImageIndex(prev => ({
        ...prev,
        [propertyId]: ((prev[propertyId] || 0) + 1) % property.images.length
      }))
    }
  }

  const prevImage = (propertyId) => {
    const property = displayProperties.find(p => p.id === propertyId)
    if (property && property.images) {
      setCurrentImageIndex(prev => ({
        ...prev,
        [propertyId]: ((prev[propertyId] || 0) - 1 + property.images.length) % property.images.length
      }))
    }
  }

  const handlePropertyClick = () => {
    // Redirigir a login cuando se hace clic en una propiedad
    navigate('/login')
  }

  return (
    <section id="properties" className="py-32 bg-gradient-to-b from-[#F2EBE5] to-[#FFFFFF] relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className={`text-center mb-20 ${headerVisible ? 'opacity-100' : 'opacity-0-initial'}`}>
          <div className={`inline-flex items-center space-x-2 border-b border-[#C5A086] pb-2 mb-8 ${headerVisible ? 'animate-fade-in-down' : ''}`}>
            <span className="text-[#C5A086] text-xs font-light tracking-widest uppercase">
              {t.properties.badge}
            </span>
          </div>
          <h2 className={`text-5xl md:text-7xl font-display text-[#333333] mb-6 tracking-tight ${headerVisible ? 'animate-fade-in-up delay-100' : ''}`} style={{ fontWeight: 500 }}>
            {t.properties.title}{' '}
            <span className="text-[#4A3B32]">{t.properties.titleHighlight}</span>
          </h2>
          <p className={`text-base text-[#333333]/80 max-w-2xl mx-auto font-light ${headerVisible ? 'animate-fade-in-up delay-200' : ''}`}>
            {t.properties.subtitle}
          </p>
        </div>

        {/* Properties Grid */}
        {propertiesLoading && landingProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12">
          {displayProperties.map((property, index) => {
            const currentImg = currentImageIndex[property.id] || 0
            const delayClass = `delay-${(index % 3 + 1) * 100}`

            // Adaptar campos de propiedades de BD a estructura esperada
            const displayProperty = {
              id: property.id,
              title: property.name || property.title,
              location: property.location,
              price: property.price_per_night || property.price,
              currency: property.currency || 'AED',
              rating: property.rating || 4.8,
              reviews: property.reviews || 0,
              guests: property.max_guests || property.guests,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              amenities: property.amenities || [],
              description: property.description,
              airbnbLink: property.airbnbLink || '#',
              images: property.images || []
            }

            return (
              <div
                key={displayProperty.id}
                className={`group bg-[#F8F6F4] p-6 rounded-xl border border-[rgba(74,59,50,0.08)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-1.5 transition-all duration-300 ${headerVisible ? `animate-fade-in-up ${delayClass}` : 'opacity-0-initial'}`}
              >
                {/* Image Gallery */}
                <div className="relative h-80 bg-gradient-to-br from-stone-200 to-stone-300 overflow-hidden mb-6">
                  {displayProperty.images.length > 0 ? (
                    <img
                      src={displayProperty.images[currentImg]}
                      alt={displayProperty.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Bed className="w-12 h-12 text-stone-400 mx-auto mb-2 opacity-50" />
                        <p className="text-stone-500 text-xs font-light">
                          {t.properties.image} {currentImg + 1}/{displayProperty.images.length || 1}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation arrows */}
                  {displayProperty.images.length > 1 && (
                    <>
                      <button
                        onClick={() => prevImage(displayProperty.id)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 border border-stone-400 hover:border-stone-900 bg-white/80 hover:bg-white text-stone-700 p-2 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => nextImage(displayProperty.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 border border-stone-400 hover:border-stone-900 bg-white/80 hover:bg-white text-stone-700 p-2 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Image indicators */}
                  {displayProperty.images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                      {displayProperty.images.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-px transition-all ${
                            idx === currentImg ? 'w-8 bg-stone-900' : 'w-4 bg-stone-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Rating badge */}
                  {displayProperty.rating && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-stone-900 fill-current" />
                      <span className="text-xs font-light text-stone-900">{displayProperty.rating}</span>
                      {displayProperty.reviews > 0 && (
                        <span className="text-xs text-stone-500">({displayProperty.reviews})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div className="space-y-4">
                  {/* Location */}
                  <div className="flex items-center space-x-2 text-stone-500 text-xs uppercase tracking-wider">
                    <MapPin className="w-3 h-3" />
                    <span className="font-light">{displayProperty.location}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-display font-light text-stone-900 group-hover:text-stone-600 transition-colors">
                    {displayProperty.title}
                  </h3>

                  {/* Description */}
                  <p className="text-stone-500 text-sm font-light leading-relaxed line-clamp-2">
                    {displayProperty.description}
                  </p>

                  {/* Details */}
                  <div className="flex items-center space-x-6 text-xs text-stone-500 pt-2 border-t border-stone-200">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span className="font-light">{displayProperty.guests}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bed className="w-3 h-3" />
                      <span className="font-light">{displayProperty.bedrooms}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bath className="w-3 h-3" />
                      <span className="font-light">{displayProperty.bathrooms}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {displayProperty.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-stone-500 font-light">
                      {displayProperty.amenities.slice(0, 4).map((amenity, idx) => (
                        <span key={idx}>{amenity}</span>
                      ))}
                      {displayProperty.amenities.length > 4 && (
                        <span>+{displayProperty.amenities.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-2xl font-display font-light text-stone-900">{displayProperty.price}</span>
                      <span className="text-stone-500 text-xs ml-1 font-light">
                        {displayProperty.currency}/{t.properties.night}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePropertyClick}
                        className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 text-xs font-light tracking-wide uppercase transition-all shadow-sm hover:shadow-md"
                      >
                        {t.properties.book}
                      </button>
                      {displayProperty.airbnbLink && displayProperty.airbnbLink !== '#' && (
                        <a
                          href={displayProperty.airbnbLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-scale border border-stone-300 hover:border-stone-900 text-stone-700 hover:text-stone-900 p-2 transition-all"
                          title="Ver en Airbnb"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          </div>
        )}

        {/* CTA for property owners */}
        <div className="mt-24 border-t border-stone-200 pt-16 text-center">
          <h3 className="text-3xl md:text-4xl font-display font-light text-stone-900 mb-4">
            {t.properties.ownerCta}
          </h3>
          <p className="text-stone-500 text-base font-light mb-8 max-w-2xl mx-auto">
            {t.properties.ownerSubtitle}
          </p>
          <button
            onClick={() => document.getElementById('owner-contact').scrollIntoView({ behavior: 'smooth' })}
            className="btn-animate bg-stone-900 hover:bg-stone-800 text-white px-10 py-4 font-light text-sm tracking-widest transition-all uppercase"
          >
            {t.properties.ownerButton}
          </button>
        </div>
      </div>

    </section>
  )
}

export default PropertiesPortfolio
