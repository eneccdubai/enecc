/**
 * SupabaseAdapter
 *
 * Adaptador para persistencia en Supabase.
 * Implementa todas las operaciones CRUD para properties y bookings.
 */

import { supabase } from '../supabase/config'

const TIMEOUT_MS = 60000 // 60 segundos
const TIMEOUT_WRITE_MS = 30000 // 30 segundos para escrituras

class SupabaseAdapter {
  // ============================================
  // HELPERS
  // ============================================

  _withTimeout(promise, timeoutMs = TIMEOUT_MS) {
    // Si no hay timeout especificado (null), solo retorna la promesa sin timeout
    if (timeoutMs === null) {
      return promise
    }

    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ])
  }

  _normalizeProperty(property) {
    return {
      ...property,
      show_in_landing: property.show_in_landing ?? true
    }
  }

  // ============================================
  // PROPERTIES
  // ============================================

  async getProperties(filters = {}) {
    try {
      console.log('[Supabase] Fetching properties...')
      const startTime = Date.now()

      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters.available !== undefined) {
        query = query.eq('available', filters.available)
      }

      // Sin timeout para consultas GET - esperamos lo que sea necesario
      const { data, error } = await this._withTimeout(query, null)

      if (error) {
        console.error('[Supabase] Query error:', error)
        throw error
      }

      const duration = Date.now() - startTime
      console.log(`[Supabase] Properties loaded: ${data?.length || 0} (took ${duration}ms)`)
      return (data || []).map(this._normalizeProperty)
    } catch (error) {
      console.error('[Supabase] Error fetching properties:', error.message || error)
      throw error
    }
  }

  async getPropertyById(id) {
    try {
      // Sin timeout para consultas GET
      const { data, error } = await this._withTimeout(
        supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single(),
        null
      )

      if (error) throw error

      return data ? this._normalizeProperty(data) : null
    } catch (error) {
      console.error('[Supabase] Error fetching property:', error)
      throw error
    }
  }

  async createProperty(propertyData) {
    try {
      const { data, error } = await this._withTimeout(
        supabase
          .from('properties')
          .insert([propertyData])
          .select()
          .single()
      )

      if (error) throw error

      return this._normalizeProperty(data)
    } catch (error) {
      console.error('[Supabase] Error creating property:', error)
      throw error
    }
  }

  async updateProperty(id, updates) {
    try {
      const { data, error } = await this._withTimeout(
        supabase
          .from('properties')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
      )

      if (error) throw error

      return this._normalizeProperty(data)
    } catch (error) {
      console.error('[Supabase] Error updating property:', error)
      throw error
    }
  }

  async deleteProperty(id) {
    try {
      const { error } = await this._withTimeout(
        supabase
          .from('properties')
          .delete()
          .eq('id', id)
      )

      if (error) throw error

      return true
    } catch (error) {
      console.error('[Supabase] Error deleting property:', error)
      throw error
    }
  }

  // ============================================
  // BOOKINGS
  // ============================================

  async getBookings(filters = {}) {
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters.property_id) {
        query = query.eq('property_id', filters.property_id)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await this._withTimeout(query)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('[Supabase] Error fetching bookings:', error)
      throw error
    }
  }

  async getBookingById(id) {
    try {
      const { data, error } = await this._withTimeout(
        supabase
          .from('bookings')
          .select('*')
          .eq('id', id)
          .single()
      )

      if (error) throw error

      return data
    } catch (error) {
      console.error('[Supabase] Error fetching booking:', error)
      throw error
    }
  }

  async createBooking(bookingData) {
    try {
      const { data, error } = await this._withTimeout(
        supabase
          .from('bookings')
          .insert([bookingData])
          .select()
          .single()
      )

      if (error) throw error

      return data
    } catch (error) {
      console.error('[Supabase] Error creating booking:', error)
      throw error
    }
  }

  async updateBooking(id, updates) {
    try {
      const { data, error } = await this._withTimeout(
        supabase
          .from('bookings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
      )

      if (error) throw error

      return data
    } catch (error) {
      console.error('[Supabase] Error updating booking:', error)
      throw error
    }
  }

  async deleteBooking(id) {
    try {
      const { error } = await this._withTimeout(
        supabase
          .from('bookings')
          .delete()
          .eq('id', id)
      )

      if (error) throw error

      return true
    } catch (error) {
      console.error('[Supabase] Error deleting booking:', error)
      throw error
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  async clear() {
    // En Supabase no queremos eliminar toda la data
    // Esta función existe solo para compatibilidad con la API
    console.warn('[Supabase] clear() called but not implemented for safety')
  }

  async getStats() {
    try {
      const [
        { count: propertiesCount },
        { count: bookingsCount }
      ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true })
      ])

      return {
        properties: propertiesCount || 0,
        bookings: bookingsCount || 0,
        storageSizeKB: null, // No aplicable en Supabase
        storageSizeMB: null
      }
    } catch (error) {
      console.error('[Supabase] Error getting stats:', error)
      return {
        properties: 0,
        bookings: 0,
        storageSizeKB: null,
        storageSizeMB: null
      }
    }
  }
}

// Exportar instancia singleton
export default new SupabaseAdapter()
