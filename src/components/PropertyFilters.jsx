import React from 'react'
import { DollarSign, Home, Users, SlidersHorizontal } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const PropertyFilters = ({ filters, onFilterChange, onClear }) => {
  const { language } = useLanguage()

  const handlePriceChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value === '' ? '' : parseFloat(value)
    })
  }

  const hasActiveFilters = () => {
    return filters.minPrice !== '' ||
           filters.maxPrice !== '' ||
           filters.bedrooms !== '' ||
           filters.maxGuests !== ''
  }

  return (
    <div className="bg-white border border-stone-200 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-light text-stone-900 tracking-tight flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5" />
          <span>{language === 'es' ? 'Filtros' : 'Filters'}</span>
        </h3>
        {hasActiveFilters() && (
          <button
            onClick={onClear}
            className="text-xs text-stone-500 hover:text-stone-900 font-light tracking-wide uppercase transition-colors"
          >
            {language === 'es' ? 'Limpiar' : 'Clear'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Min Price */}
        <div>
          <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            {language === 'es' ? 'Precio mínimo' : 'Min Price'}
          </label>
          <input
            type="number"
            min="0"
            step="50"
            value={filters.minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            placeholder="$0"
            className="w-full px-4 py-3 border-b-2 border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            {language === 'es' ? 'Precio máximo' : 'Max Price'}
          </label>
          <input
            type="number"
            min="0"
            step="50"
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            placeholder={language === 'es' ? 'Sin límite' : 'No limit'}
            className="w-full px-4 py-3 border-b-2 border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase flex items-center">
            <Home className="w-4 h-4 mr-1" />
            {language === 'es' ? 'Habitaciones' : 'Bedrooms'}
          </label>
          <select
            value={filters.bedrooms}
            onChange={(e) => onFilterChange({ ...filters, bedrooms: e.target.value })}
            className="w-full px-4 py-3 border-b-2 border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
          >
            <option value="">{language === 'es' ? 'Cualquiera' : 'Any'}</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        {/* Max Guests */}
        <div>
          <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {language === 'es' ? 'Huéspedes' : 'Guests'}
          </label>
          <select
            value={filters.maxGuests}
            onChange={(e) => onFilterChange({ ...filters, maxGuests: e.target.value })}
            className="w-full px-4 py-3 border-b-2 border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
          >
            <option value="">{language === 'es' ? 'Cualquiera' : 'Any'}</option>
            <option value="2">2+</option>
            <option value="4">4+</option>
            <option value="6">6+</option>
            <option value="8">8+</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="mt-6 pt-6 border-t border-stone-200">
          <p className="text-xs text-stone-500 font-light">
            {language === 'es' ? 'Filtros activos:' : 'Active filters:'}{' '}
            {filters.minPrice && `Min: $${filters.minPrice}`}
            {filters.minPrice && (filters.maxPrice || filters.bedrooms || filters.maxGuests) && ', '}
            {filters.maxPrice && `Max: $${filters.maxPrice}`}
            {filters.maxPrice && (filters.bedrooms || filters.maxGuests) && ', '}
            {filters.bedrooms && `${filters.bedrooms}+ ${language === 'es' ? 'hab' : 'bed'}`}
            {filters.bedrooms && filters.maxGuests && ', '}
            {filters.maxGuests && `${filters.maxGuests}+ ${language === 'es' ? 'huésp' : 'guests'}`}
          </p>
        </div>
      )}
    </div>
  )
}

export default PropertyFilters
