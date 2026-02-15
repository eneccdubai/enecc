import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Users, Bed, Bath, ChevronLeft, ChevronRight, ArrowLeft, X, MessageCircle, Mail } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useProperties } from '../contexts/PropertiesContext'
import { getAmenityConfig } from '../utils/amenities'

const PropertyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const { properties, loading } = useProperties()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [property, setProperty] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)

  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '971585768012').replace(/[+\s\-()]/g, '')

  useEffect(() => {
    if (!loading && properties.length > 0) {
      const foundProperty = properties.find(p => p.id === id)
      if (foundProperty) {
        setProperty(foundProperty)
      } else {
        navigate('/')
      }
    }
  }, [id, properties, loading, navigate])

  const nextImage = () => {
    if (property) {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (property) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      )
    }
  }

  const openLightbox = (index) => {
    setLightboxImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextLightboxImage = () => {
    if (property) {
      setLightboxImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevLightboxImage = () => {
    if (property) {
      setLightboxImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      )
    }
  }

  // Cerrar lightbox con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return

      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowRight') {
        nextLightboxImage()
      } else if (e.key === 'ArrowLeft') {
        prevLightboxImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, property])

  if (loading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    )
  }

  const whatsappMessage = encodeURIComponent(
    language === 'es'
      ? `Hola, me interesa la propiedad: ${property.name} (${property.location})`
      : `Hi, I'm interested in the property: ${property.name} (${property.location})`
  )

  return (
    <div className="min-h-screen bg-white pt-20 sm:pt-24 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors mb-6 sm:mb-8 text-sm font-light"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'es' ? 'Volver' : 'Back'}</span>
        </button>

        {/* Image Gallery */}
        <div className="mb-8 sm:mb-12">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-stone-900 overflow-hidden group cursor-pointer" onClick={() => openLightbox(currentImageIndex)}>
            <img
              src={property.images[currentImageIndex]}
              alt={property.name}
              className="w-full h-full object-cover"
            />

            {/* Image Navigation */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 text-xs sm:text-sm font-light">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Grid */}
          {property.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-4">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => openLightbox(index)}
                  className={`aspect-square overflow-hidden border-2 transition-all cursor-pointer ${
                    currentImageIndex === index
                      ? 'border-stone-900'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${property.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Location */}
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-light text-stone-900 mb-4 tracking-tight">
                {property.name}
              </h1>
              <div className="flex items-center text-base sm:text-lg text-stone-600 font-light">
                <MapPin className="w-5 h-5 mr-2 text-stone-400" />
                <span>{property.location}</span>
              </div>
            </div>

            {/* Property Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 py-6 border-t border-b border-stone-200">
              <div className="flex items-center space-x-2">
                <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
                <span className="text-sm sm:text-base font-light text-stone-900">
                  {property.bedrooms} {language === 'es' ? 'Habitaciones' : 'Bedrooms'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
                <span className="text-sm sm:text-base font-light text-stone-900">
                  {property.bathrooms} {language === 'es' ? 'Baños' : 'Bathrooms'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
                <span className="text-sm sm:text-base font-light text-stone-900">
                  {language === 'es' ? 'Hasta' : 'Up to'} {property.max_guests} {language === 'es' ? 'huéspedes' : 'guests'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-light text-stone-900 mb-4 tracking-tight">
                {language === 'es' ? 'Descripción' : 'Description'}
              </h2>
              <p className="text-base sm:text-lg font-light text-stone-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-light text-stone-900 mb-6 tracking-tight">
                {language === 'es' ? 'Servicios' : 'Amenities'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => {
                  const config = getAmenityConfig(amenity)
                  const Icon = config?.icon
                  const displayLabel = config
                    ? (language === 'es' ? config.label.es : config.label.en)
                    : amenity
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 text-base font-light text-stone-700"
                    >
                      {Icon ? (
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-stone-900">
                          <Icon className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border border-stone-300 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-stone-900"></div>
                        </div>
                      )}
                      <span>{displayLabel}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Contact CTA Sidebar - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border-2 border-stone-200 bg-white p-6 sm:p-8">
              {/* Title */}
              <div className="mb-6 pb-6 border-b border-stone-200">
                <h3 className="text-2xl font-display text-stone-900 tracking-tight mb-2">
                  {language === 'es' ? 'Contactar sobre esta propiedad' : 'Contact About This Property'}
                </h3>
                <p className="text-sm text-stone-500 font-light">
                  {language === 'es'
                    ? 'Escríbenos para más información o para agendar una visita.'
                    : 'Write to us for more information or to schedule a visit.'}
                </p>
              </div>

              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-animate w-full bg-stone-900 hover:bg-stone-800 text-white font-light py-4 transition-all text-sm tracking-widest uppercase flex items-center justify-center space-x-2 mb-4"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              {/* Contact Page Link */}
              <button
                onClick={() => navigate('/contact')}
                className="btn-scale w-full border border-stone-300 hover:border-stone-900 text-stone-900 font-light py-4 transition-all text-sm tracking-widest uppercase flex items-center justify-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>{language === 'es' ? 'Enviar Mensaje' : 'Send Message'}</span>
              </button>

              <p className="text-xs text-stone-400 text-center mt-4 font-light">
                {language === 'es'
                  ? 'Respuesta en menos de 24 horas'
                  : 'Response within 24 hours'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 bg-white/10 text-white px-4 py-2 text-sm sm:text-base font-light z-10">
            {lightboxImageIndex + 1} / {property.images.length}
          </div>

          {/* Main Image */}
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={property.images[lightboxImageIndex]}
              alt={`${property.name} ${lightboxImageIndex + 1}`}
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />

            {/* Navigation Buttons */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevLightboxImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextLightboxImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyDetail
