/**
 * PropertiesRepository
 *
 * Capa de lógica de negocio para propiedades.
 * Maneja cache, validaciones y transformaciones usando Supabase.
 */

import dataAdapter from '../adapters'

const CACHE_KEY = 'enecc_properties_cache'
const CACHE_TIMESTAMP_KEY = 'enecc_properties_timestamp'
const CACHE_DURATION = 30 * 1000 // 30 segundos - reducido para actualizar más frecuentemente

class PropertiesRepository {
  constructor() {
    this.adapter = dataAdapter
  }

  // ============================================
  // CACHE HELPERS
  // ============================================

  _getCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)

      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp)
        return {
          data: JSON.parse(cached),
          timestamp: parseInt(timestamp),
          isStale: age > CACHE_DURATION
        }
      }
    } catch (error) {
      console.error('[PropertiesRepository] Error reading cache:', error)
    }
    return null
  }

  _setCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (error) {
      console.error('[PropertiesRepository] Error saving cache:', error)
    }
  }

  _clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_TIMESTAMP_KEY)
    } catch (error) {
      console.error('[PropertiesRepository] Error clearing cache:', error)
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Obtiene todas las propiedades con cache stale-while-revalidate
   */
  async getAll(options = {}) {
    const { forceRefresh = false, available = null } = options

    const cached = this._getCache()

    // Si hay cache y no es refresh forzado
    if (cached && !forceRefresh) {
      // Si no es stale, retornar inmediatamente
      if (!cached.isStale) {
        return cached.data
      }
    }

    try {
      const filters = available !== null ? { available } : {}
      const freshData = await this.adapter.getProperties(filters)
      this._setCache(freshData)
      return freshData
    } catch (error) {
      console.error('[PropertiesRepository] Error fetching properties:', error)
      // Si hay error pero tenemos cache, retornar cache
      if (cached) {
        return cached.data
      }
      throw error
    }
  }

  /**
   * Obtiene una propiedad por ID
   */
  async getById(id) {
    return await this.adapter.getPropertyById(id)
  }

  /**
   * Crea una nueva propiedad
   */
  async create(propertyData) {
    const property = await this.adapter.createProperty(propertyData)
    this._clearCache() // Invalidar cache
    return property
  }

  /**
   * Actualiza una propiedad
   */
  async update(id, updates) {
    const property = await this.adapter.updateProperty(id, updates)
    this._clearCache() // Invalidar cache
    return property
  }

  /**
   * Elimina una propiedad
   */
  async delete(id) {
    const result = await this.adapter.deleteProperty(id)
    this._clearCache() // Invalidar cache
    return result
  }

  /**
   * Alterna disponibilidad de una propiedad
   */
  async toggleAvailability(id) {
    const property = await this.getById(id)
    if (!property) {
      throw new Error('Property not found')
    }

    return await this.update(id, {
      available: !property.available
    })
  }

  /**
   * Limpia cache manualmente
   */
  clearCache() {
    this._clearCache()
  }

  /**
   * Prefetch para mejorar UX
   */
  async prefetch() {
    const cached = this._getCache()
    if (!cached || cached.isStale) {
      try {
        const data = await this.adapter.getProperties({ available: true })
        this._setCache(data)
      } catch (error) {
        console.debug('[PropertiesRepository] Prefetch failed:', error)
      }
    }
  }
}

// Exportar instancia singleton
export default new PropertiesRepository()
