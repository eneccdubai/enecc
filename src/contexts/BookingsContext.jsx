import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { BookingsRepository } from '../repositories'
import { useAuth } from './AuthContext'

const BookingsContext = createContext()

export const useBookings = () => {
  const context = useContext(BookingsContext)
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider')
  }
  return context
}

export const BookingsProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const loadBookings = useCallback(async () => {
    if (!currentUser) {
      setBookings([])
      setLoading(false)
      return []
    }

    try {
      setLoading(true)
      const data = await BookingsRepository.getByUserId(currentUser.uid)
      setBookings(data)
      return data
    } catch (error) {
      console.error('[BookingsContext] Error loading bookings:', error)
      setBookings([])
      return []
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  const refreshBookings = useCallback(async () => {
    return loadBookings()
  }, [loadBookings])

  // Cargar reservas cuando cambia el usuario
  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const value = {
    bookings,
    loading,
    loadBookings,
    refreshBookings
  }

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  )
}
