import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Bed, Bath, Users, ArrowLeft, Home } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useProperties } from '../contexts/PropertiesContext'

const AllProperties = () => {
  const { language } = useLanguage()
  const { properties, loading } = useProperties()
  const navigate = useNavigate()

  const availableProperties = useMemo(() => {
    return properties.filter(property => property.available)
  }, [properties])

  const handlePropertyClick = (property) => {
    navigate(`/property/${property.id}`)
  }

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors mb-6 text-sm font-light"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'es' ? 'Volver' : 'Back'}</span>
          </button>

          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-light text-stone-900 mb-3 tracking-tight">
              {language === 'es' ? 'Todas las Propiedades' : 'All Properties'}
            </h1>
            <p className="text-stone-500 text-sm font-light tracking-wide">
              {language === 'es'
                ? 'Explora nuestro catálogo completo de propiedades disponibles'
                : 'Explore our complete catalog of available properties'}
            </p>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6 text-sm text-stone-600 font-light">
            {language === 'es'
              ? `${availableProperties.length} ${availableProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}`
              : `${availableProperties.length} ${availableProperties.length === 1 ? 'property found' : 'properties found'}`}
          </div>
        )}

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : availableProperties.length === 0 ? (
          <div className="text-center py-20 border border-stone-200 bg-white/50">
            <Home className="w-16 h-16 mx-auto mb-6 text-stone-300" />
            <h3 className="text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
              {language === 'es' ? 'No hay propiedades' : 'No properties found'}
            </h3>
            <p className="text-stone-500 text-sm font-light tracking-wide mb-6">
              {language === 'es'
                ? 'No hay propiedades disponibles en este momento'
                : 'No properties available at this time'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => handlePropertyClick(property)}
                className="bg-white border border-stone-200 hover:border-stone-400 transition-all cursor-pointer group"
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-stone-200 overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-display font-light text-stone-900 mb-2 tracking-tight">
                    {property.name}
                  </h3>

                  <div className="flex items-center text-sm text-stone-500 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="font-light">{property.location}</span>
                  </div>

                  {/* Features */}
                  <div className="flex items-center space-x-4 text-sm text-stone-600 mb-4 pb-4 border-b border-stone-200">
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      <span className="font-light">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      <span className="font-light">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="font-light">{property.max_guests}</span>
                    </div>
                  </div>

                  {/* View Details */}
                  <div className="text-right">
                    <span className="text-xs text-stone-400 uppercase tracking-wide font-light">
                      {language === 'es' ? 'Ver detalles' : 'View details'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AllProperties
