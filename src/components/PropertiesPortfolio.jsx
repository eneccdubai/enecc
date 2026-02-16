import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Users, Bed, Bath, ChevronLeft, ChevronRight, Star, MessageCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useProperties } from '../contexts/PropertiesContext'
import { supabase } from '../supabase/config'

const PropertiesPortfolio = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [headerRef, headerVisible] = useScrollAnimation({ once: true, threshold: 0.2 })
  const { properties: contextProperties, loading: propertiesLoading } = useProperties()
  const [currentImageIndex, setCurrentImageIndex] = useState({})
  const [reviewsByProperty, setReviewsByProperty] = useState({})

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('property_id, rating')
        if (error) throw error
        const grouped = {}
        ;(data || []).forEach(r => {
          if (!r.property_id) return
          if (!grouped[r.property_id]) grouped[r.property_id] = { sum: 0, count: 0 }
          grouped[r.property_id].sum += r.rating
          grouped[r.property_id].count += 1
        })
        setReviewsByProperty(grouped)
      } catch (err) {
        console.error('Error fetching reviews:', err)
      }
    }
    fetchReviews()
  }, [])

  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '971585768012').replace(/[+\s\-()]/g, '')

  // Propiedades de fallback si no hay ninguna en la BD
  const fallbackProperties = useMemo(() => [
    {
      id: 'fallback-1',
      name: language === 'es' ? 'Apartamento de Lujo en Dubai Marina' : 'Luxury Apartment in Dubai Marina',
      location: 'Dubai Marina, UAE',
      rating: 4.9,
      reviews: 127,
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Kitchen', 'AC'],
      description: language === 'es'
        ? 'Hermoso apartamento con vistas al mar, completamente amueblado y equipado con todas las comodidades modernas.'
        : 'Beautiful apartment with sea views, fully furnished and equipped with all modern amenities.',
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
      rating: 4.8,
      reviews: 89,
      max_guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['WiFi', 'Pool', 'Gym', 'Kitchen', 'AC'],
      description: language === 'es'
        ? 'Estudio elegante cerca de Burj Khalifa, perfecto para parejas o viajeros de negocios.'
        : 'Elegant studio near Burj Khalifa, perfect for couples or business travelers.',
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
      rating: 5.0,
      reviews: 203,
      max_guests: 6,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Kitchen', 'AC', 'Beach Access'],
      description: language === 'es'
        ? 'Penthouse de lujo con terraza privada y acceso directo a la playa. Vistas espectaculares.'
        : 'Luxury penthouse with private terrace and direct beach access. Spectacular views.',
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

    // Mostrar hasta 10 propiedades
    filtered = filtered.slice(0, 10)

    return filtered
  }, [contextProperties])

  const displayProperties = useMemo(() => {
    if (landingProperties.length > 0) {
      return landingProperties
    }
    return fallbackProperties
  }, [landingProperties, fallbackProperties])

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

  return (
    <section id="properties" className="pt-32 bg-neutral-50 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className={`text-center mb-20 ${headerVisible ? 'opacity-100' : 'opacity-0-initial'}`}>
          <div className={`inline-flex items-center space-x-2 border-b border-stone-300 pb-2 mb-8 ${headerVisible ? 'animate-fade-in-down' : ''}`}>
            <span className="text-stone-500 text-xs font-light tracking-widest uppercase">
              {t.properties.badge}
            </span>
          </div>
          <h2 className={`text-5xl md:text-7xl font-display text-stone-900 mb-6 tracking-tight ${headerVisible ? 'animate-fade-in-up delay-100' : ''}`} style={{ fontWeight: 700 }}>
            {t.properties.title}{' '}
            <span className="text-stone-500">{t.properties.titleHighlight}</span>
          </h2>
          <p className={`text-base text-stone-500 max-w-2xl mx-auto font-light ${headerVisible ? 'animate-fade-in-up delay-200' : ''}`}>
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

            const reviewData = reviewsByProperty[property.id]
            const displayProperty = {
              id: property.id,
              title: property.name || property.title,
              location: property.location,
              rating: reviewData ? (reviewData.sum / reviewData.count).toFixed(1) : null,
              reviews: reviewData ? reviewData.count : 0,
              guests: property.max_guests || property.guests,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              amenities: property.amenities || [],
              description: property.description,
              images: property.images || []
            }

            return (
              <div
                key={displayProperty.id}
                className={`group bg-white p-6 rounded-xl border border-stone-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 ${headerVisible ? `animate-fade-in-up ${delayClass}` : 'opacity-0-initial'}`}
              >
                {/* Image Gallery */}
                <div className="relative h-80 bg-stone-100 overflow-hidden mb-6">
                  {displayProperty.images.length > 0 ? (
                    <img
                      src={displayProperty.images[currentImg]}
                      alt={displayProperty.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Bed className="w-12 h-12 text-stone-300 mx-auto mb-2 opacity-50" />
                        <p className="text-stone-400 text-xs font-light">
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
                        className="absolute left-3 top-1/2 -translate-y-1/2 border border-stone-300 hover:border-stone-900 bg-white/80 hover:bg-white text-stone-700 p-2 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => nextImage(displayProperty.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 border border-stone-300 hover:border-stone-900 bg-white/80 hover:bg-white text-stone-700 p-2 transition-all"
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

                  {/* CTA Buttons */}
                  <div className="flex items-center space-x-2 pt-4">
                    <button
                      onClick={() => navigate(`/property/${displayProperty.id}`)}
                      className="flex-1 bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 text-xs font-light tracking-wide uppercase transition-all shadow-sm hover:shadow-md"
                    >
                      {language === 'es' ? 'Ver Detalles' : 'View Details'}
                    </button>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        language === 'es'
                          ? `Hola, me interesa la propiedad: ${displayProperty.title}`
                          : `Hi, I'm interested in the property: ${displayProperty.title}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-scale border border-stone-300 hover:border-stone-900 text-stone-700 hover:text-stone-900 p-2.5 transition-all"
                      title={language === 'es' ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
          </div>
        )}

        {/* CTA for property owners */}
        <div className="mt-16 border-t border-stone-200 pt-8 text-center">
          <h3 className="text-3xl md:text-4xl font-display font-light text-stone-900 mb-3">
            {t.properties.ownerCta}
          </h3>
          <p className="text-stone-500 text-base font-light mb-4 max-w-2xl mx-auto">
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
