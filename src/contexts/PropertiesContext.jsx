import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { PropertiesRepository } from '../repositories'

const PropertiesContext = createContext()

export const useProperties = () => {
  const context = useContext(PropertiesContext)
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider')
  }
  return context
}

// Función standalone para prefetch (puede usarse fuera del Provider)
export const prefetchProperties = () => {
  PropertiesRepository.prefetch()
}

export const PropertiesProvider = ({ children }) => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState(null)

  const loadProperties = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      const data = await PropertiesRepository.getAll({ forceRefresh })
      setProperties(data)
      setLastFetch(Date.now())
      return data
    } catch (error) {
      console.error('[PropertiesContext] Error loading properties:', error)
      setProperties([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshProperties = useCallback(async () => {
    return loadProperties(true)
  }, [loadProperties])

  // Cargar propiedades al montar - forzar refresh para obtener datos frescos
  useEffect(() => {
    loadProperties(true) // Forzar refresh al montar para obtener datos actualizados
  }, [loadProperties])

  const value = {
    properties,
    loading,
    lastFetch,
    loadProperties,
    refreshProperties
  }

  return (
    <PropertiesContext.Provider value={value}>
      {children}
    </PropertiesContext.Provider>
  )
}
