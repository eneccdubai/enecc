import React, { useState, useEffect, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus, Edit, Trash2, LogOut, Home, Eye, EyeOff, Upload, X, Image as ImageIcon, ChevronDown, ChevronUp, Users, RefreshCcw, AlertCircle, Star, MessageSquare, ArrowLeft, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useProperties } from '../contexts/PropertiesContext'
import { uploadImagesToStorage, deleteImageFromStorage, isStorageUrl } from '../utils/storageHelper'
import { validatePropertyData, sanitizeString, generateCSRFToken } from '../utils/security'
import { AMENITIES, getAmenityConfig } from '../utils/amenities'
import { updateLocalProperty, addLocalProperty } from '../utils/localDB'
import Pagination from './Pagination'
import { supabase } from '../supabase/config'
import { isLandingColumnMissing } from '../utils/propertiesApi'
import { CheckCircle } from 'lucide-react'

const AdminDashboard = () => {
  const { currentUser, logout, isAdmin } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const { properties: contextProperties, loading: contextLoading, refreshProperties } = useProperties()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [csrfToken, setCsrfToken] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    maxGuests: '',
    pricePerNight: '',
    images: [],
    amenities: [],
    customAmenity: '',
    available: true,
    showInLanding: true
  })
  const [uploadingImages, setUploadingImages] = useState(false)
  const [landingUpdates, setLandingUpdates] = useState({})
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState(null)
  const [usersPagination, setUsersPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    itemsPerPage: 25
  })
  const [activeTab, setActiveTab] = useState('properties') // 'properties', 'users', 'reviews'
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [reviewFormData, setReviewFormData] = useState({
    reviewer_name: '',
    rating: 5,
    comment: '',
    property_id: ''
  })

  // Usar propiedades del contexto (incluye modo local)
  useEffect(() => {
    setProperties(contextProperties)
    setLoading(contextLoading)
  }, [contextProperties, contextLoading])

  const fetchUsers = useCallback(async (page = 1, limit = 25) => {
    if (!isAdmin) return

    setUsersLoading(true)
    setUsersError(null)

    try {
      // Calcular offset para paginación
      const offset = (page - 1) * limit

      // Primera consulta: obtener datos paginados
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Segunda consulta: obtener total de registros para paginación
      const { count, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })

      if (countError) throw countError

      setUsers(data || [])
      setUsersPagination({
        currentPage: page,
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        itemsPerPage: limit
      })
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
      setUsersError(error.message)
      setUsersPagination({
        currentPage: 1,
        totalItems: 0,
        totalPages: 0,
        itemsPerPage: limit
      })
    } finally {
      setUsersLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const formatUserDate = (dateString) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    } catch {
      return dateString
    }
  }

  const handleUsersPageChange = (page, newItemsPerPage = usersPagination.itemsPerPage) => {
    fetchUsers(page, newItemsPerPage)
  }


  // Cargar usuarios cuando se activa el tab
  useEffect(() => {
    if (activeTab === 'users' && isAdmin && users.length === 0 && !usersLoading) {
      fetchUsers()
    }
  }, [activeTab, isAdmin, users.length, usersLoading, fetchUsers])

  // Reviews CRUD
  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'reviews' && isAdmin && reviews.length === 0 && !reviewsLoading) {
      fetchReviews()
    }
  }, [activeTab, isAdmin, reviews.length, reviewsLoading, fetchReviews])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    const { reviewer_name, rating, comment, property_id } = reviewFormData
    if (!reviewer_name.trim() || !comment.trim()) return

    const reviewData = {
      reviewer_name: reviewer_name.trim(),
      rating: parseInt(rating),
      comment: comment.trim(),
      property_id: property_id || null
    }

    try {
      if (editingReview) {
        const { error } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', editingReview.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert([reviewData])
        if (error) throw error
      }
      setShowReviewForm(false)
      setEditingReview(null)
      setReviewFormData({ reviewer_name: '', rating: 5, comment: '', property_id: '' })
      await fetchReviews()
    } catch (error) {
      console.error('Error saving review:', error)
      alert(language === 'es' ? 'Error al guardar review' : 'Error saving review')
    }
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
    setReviewFormData({
      reviewer_name: review.reviewer_name,
      rating: review.rating,
      comment: review.comment,
      property_id: review.property_id || ''
    })
    setShowReviewForm(true)
  }

  const handleDeleteReview = async (id) => {
    if (!window.confirm(language === 'es' ? '¿Eliminar esta review?' : 'Delete this review?')) return
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id)
      if (error) throw error
      await fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
      alert(language === 'es' ? 'Error al eliminar review' : 'Error deleting review')
    }
  }

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingImages(true)

      // Subir imágenes a Supabase Storage
      const imageUrls = await uploadImagesToStorage(files, editingProperty?.id)
      console.log(`${imageUrls.length} images uploaded to Storage`)

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }))

      setUploadingImages(false)
    } catch (error) {
      console.error('Error uploading images:', error)
      alert(language === 'es'
        ? `Error al subir imágenes: ${error.message}`
        : `Error uploading images: ${error.message}`)
      setUploadingImages(false)
    }
  }

  const moveImage = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= formData.images.length) return
    setFormData(prev => {
      const imgs = [...prev.images]
      ;[imgs[index], imgs[newIndex]] = [imgs[newIndex], imgs[index]]
      return { ...prev, images: imgs }
    })
  }

  const removeImage = async (index) => {
    const imageToRemove = formData.images[index]

    // Eliminar la imagen del Storage
    if (isStorageUrl(imageToRemove)) {
      try {
        await deleteImageFromStorage(imageToRemove)
      } catch (error) {
        console.error('Error deleting image from storage:', error)
      }
    }

    // Eliminar de la lista local
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Abrir formulario con nuevo CSRF token
  const openForm = () => {
    const token = generateCSRFToken()
    setCsrfToken(token)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar CSRF token
    if (!csrfToken || csrfToken.length < 32) {
      alert(language === 'es'
        ? 'Token de seguridad inválido. Por favor, recarga el formulario.'
        : 'Invalid security token. Please reload the form.'
      )
      return
    }

    // Validar que haya al menos una imagen
    if (formData.images.length === 0) {
      alert(language === 'es'
        ? 'Debes agregar al menos una imagen'
        : 'You must add at least one image'
      )
      return
    }

    // Validar límite de 10 propiedades en landing
    if (formData.showInLanding) {
      const currentlyVisible = properties.filter(p => {
        if (editingProperty && p.id === editingProperty.id) {
          return false
        }
        return (p.show_in_landing ?? true) === true
      }).length

      if (currentlyVisible >= 10) {
        alert(language === 'es'
          ? 'Solo se pueden mostrar 10 propiedades en la landing. Desactiva una propiedad existente primero.'
          : 'Only 10 properties can be shown on the landing. Please deactivate an existing property first.')
        return
      }
    }

    // Sanitizar y preparar datos
    const propertyData = {
      name: sanitizeString(formData.name.trim()),
      description: sanitizeString(formData.description.trim()),
      location: sanitizeString(formData.location.trim()),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      max_guests: parseInt(formData.maxGuests),
      price_per_night: parseFloat(formData.pricePerNight),
      images: formData.images,
      amenities: formData.amenities.map(am => sanitizeString(am.trim())).filter(Boolean),
      available: formData.available,
      show_in_landing: formData.showInLanding
    }

    // Validar datos
    const validation = validatePropertyData(propertyData)
    if (!validation.valid) {
      alert((language === 'es' ? 'Errores de validación:\n' : 'Validation errors:\n') + validation.errors.join('\n'))
      return
    }

    try {
      if (editingProperty) {
        await updateLocalProperty(editingProperty.id, propertyData)

        alert(language === 'es'
          ? 'Propiedad actualizada correctamente'
          : 'Property updated successfully'
        )
      } else {
        await addLocalProperty(propertyData)

        alert(language === 'es'
          ? 'Propiedad creada correctamente'
          : 'Property created successfully'
        )
      }

      // Resetear formulario
      setShowForm(false)
      setEditingProperty(null)
      setCsrfToken('')
      setFormData({
        name: '',
        description: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        maxGuests: '',
        pricePerNight: '',
        images: [],
        amenities: '',
        available: true,
        showInLanding: true
      })

      // Refrescar propiedades
      await refreshProperties()

      // Recargar página si se creó una nueva propiedad
      if (!editingProperty) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error saving property:', error)
      alert(language === 'es'
        ? 'Error al guardar la propiedad: ' + (error.message || 'Error desconocido')
        : 'Error saving property: ' + (error.message || 'Unknown error')
      )
    }
  }

  const handleEdit = (property) => {
    const token = generateCSRFToken()
    setCsrfToken(token)

    setEditingProperty(property)
    setFormData({
      name: property.name,
      description: property.description,
      location: property.location,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      maxGuests: property.max_guests.toString(),
      pricePerNight: property.price_per_night.toString(),
      images: property.images || [],
      amenities: property.amenities || [],
      available: property.available,
      showInLanding: property.show_in_landing ?? true
    })
    setShowForm(true)

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const handleDelete = async (propertyId) => {
    if (window.confirm(language === 'es' ? '¿Estás seguro de eliminar esta propiedad?' : 'Are you sure you want to delete this property?')) {
      try {
        const property = properties.find(p => p.id === propertyId)

        if (property && property.images && property.images.length > 0) {
          const storageUrls = property.images.filter(isStorageUrl)
          if (storageUrls.length > 0) {
            for (const url of storageUrls) {
              try {
                await deleteImageFromStorage(url)
              } catch (error) {
                console.error('Error deleting image:', error)
              }
            }
          }
        }

        const { error: deleteError } = await supabase
          .from('properties')
          .delete()
          .eq('id', propertyId)

        if (deleteError) throw deleteError

        await refreshProperties()

        alert(language === 'es'
          ? 'Propiedad eliminada exitosamente'
          : 'Property deleted successfully')
      } catch (error) {
        console.error('Error deleting property:', error)
        alert(language === 'es'
          ? `Error al eliminar propiedad: ${error.message}`
          : `Error deleting property: ${error.message}`)
      }
    }
  }

  const toggleAvailability = async (property) => {
    const newAvailability = !property.available

    try {
      setProperties(prevProps =>
        prevProps.map(p =>
          p.id === property.id
            ? { ...p, available: newAvailability }
            : p
        )
      )

      const { error } = await supabase
        .from('properties')
        .update({ available: newAvailability })
        .eq('id', property.id)

      if (error) throw error

      await refreshProperties()
    } catch (error) {
      console.error('Error updating availability:', error)
      alert(language === 'es'
        ? `Error al actualizar disponibilidad: ${error.message}`
        : `Error updating availability: ${error.message}`)
      await refreshProperties()
    }
  }

  const handleLandingToggle = async (property) => {
    const propertyId = property.id
    const currentValue = property.show_in_landing ?? true
    const nextValue = !currentValue

    // Si intenta activar, verificar que no haya ya 10 propiedades visibles
    if (nextValue === true) {
      const currentlyVisible = properties.filter(p => {
        if (p.id === propertyId) {
          return false
        }
        return (p.show_in_landing ?? true) === true
      }).length

      if (currentlyVisible >= 10) {
        alert(language === 'es'
          ? 'Solo se pueden mostrar 10 propiedades en la landing. Desactiva una propiedad existente primero.'
          : 'Only 10 properties can be shown on the landing. Please deactivate an existing property first.')
        return
      }
    }

    setLandingUpdates(prev => ({ ...prev, [propertyId]: true }))
    setProperties(prevProps =>
      prevProps.map(p =>
        p.id === propertyId
          ? { ...p, show_in_landing: nextValue }
          : p
      )
    )

    try {
      const { error } = await supabase
        .from('properties')
        .update({ show_in_landing: nextValue })
        .eq('id', propertyId)

      if (error) throw error

      await refreshProperties()
    } catch (error) {
      console.error('Error updating landing visibility:', error)
      const missingColumn = isLandingColumnMissing(error)
      const message = missingColumn
        ? (language === 'es'
          ? 'No existe la columna show_in_landing en Supabase. Añádela como boolean con valor por defecto TRUE.'
          : 'The column show_in_landing does not exist in Supabase. Please add it as a boolean with default TRUE.')
        : (language === 'es'
          ? 'No se pudo actualizar la visibilidad en la landing.'
          : 'Could not update landing visibility.')
      alert(message)
      setProperties(prevProps =>
        prevProps.map(p =>
          p.id === propertyId
            ? { ...p, show_in_landing: currentValue }
            : p
      )
      )
    } finally {
      setLandingUpdates(prev => {
        const copy = { ...prev }
        delete copy[propertyId]
        return copy
      })
    }
  }

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-light text-stone-900 mb-2 tracking-tight">
              {language === 'es' ? 'Panel de Administración' : 'Admin Dashboard'}
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm font-light tracking-wide">
              {language === 'es' ? 'Gestiona tu plataforma' : 'Manage your platform'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors text-xs sm:text-sm font-light tracking-wide"
            >
              <Home className="w-4 h-4" />
              <span>{language === 'es' ? 'Inicio' : 'Home'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors text-xs sm:text-sm font-light tracking-wide"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'es' ? 'Salir' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-stone-200 overflow-x-auto">
          <nav className="flex space-x-1 -mb-px min-w-max">
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-light tracking-wide transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'properties'
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{language === 'es' ? 'Propiedades' : 'Properties'}</span>
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-light tracking-wide transition-all border-b-2 whitespace-nowrap ${
                    activeTab === 'reviews'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Reviews</span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-light tracking-wide transition-all border-b-2 whitespace-nowrap ${
                    activeTab === 'users'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{language === 'es' ? 'Usuarios' : 'Users'}</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Properties Tab Content */}
        {activeTab === 'properties' && (
          <>
            {/* Add New Property Button */}
            {!showForm && (
              <div className="mb-12">
                <button
                  onClick={openForm}
                  className="btn-animate w-full bg-stone-900 hover:bg-stone-800 text-white font-light py-6 transition-all text-sm tracking-widest uppercase flex items-center justify-center space-x-3"
                >
                  <Plus className="w-5 h-5" />
                  <span>{language === 'es' ? 'Agregar Nueva Propiedad' : 'Add New Property'}</span>
                </button>
              </div>
            )}

        {/* Property Form */}
        {showForm && (
          <div className="mb-12 bg-white border border-stone-200 p-8">
            <h2 className="text-3xl font-display font-light text-stone-900 mb-8 tracking-tight">
              {editingProperty
                ? (language === 'es' ? 'Editar Propiedad' : 'Edit Property')
                : (language === 'es' ? 'Nueva Propiedad' : 'New Property')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                    {language === 'es' ? 'Nombre' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                    {language === 'es' ? 'Ubicación' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                    {language === 'es' ? 'Habitaciones' : 'Bedrooms'}
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    required
                    min="1"
                    className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                    {language === 'es' ? 'Baños' : 'Bathrooms'}
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    required
                    min="1"
                    className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                    {language === 'es' ? 'Huéspedes máx.' : 'Max Guests'}
                  </label>
                  <input
                    type="number"
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                    required
                    min="1"
                    className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                    {language === 'es' ? 'Precio por noche ($)' : 'Price per night ($)'}
                  </label>
                  <input
                    type="number"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                  {language === 'es' ? 'Descripción' : 'Description'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light resize-none"
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-xs font-light text-stone-500 mb-4 tracking-widest uppercase">
                  {language === 'es' ? 'Fotos de la propiedad' : 'Property Photos'}
                </label>

                {/* Upload Button */}
                <div className="mb-4">
                  <label className="cursor-pointer inline-flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 transition-all text-sm tracking-wide font-light">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                    {uploadingImages ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{language === 'es' ? 'Optimizando...' : 'Optimizing...'}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{language === 'es' ? 'Subir Fotos' : 'Upload Photos'}</span>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-stone-400 mt-2 font-light">
                    {language === 'es'
                      ? 'Las imágenes se optimizan automáticamente a 1920px en formato WebP'
                      : 'Images are automatically optimized to 1920px in WebP format'}
                  </p>
                </div>

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group aspect-video bg-stone-100 overflow-hidden">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 flex items-center justify-between px-2">
                          <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="disabled:opacity-30 hover:scale-110 transition-transform">
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <span>{index + 1}</span>
                          <button type="button" onClick={() => moveImage(index, 1)} disabled={index === formData.images.length - 1} className="disabled:opacity-30 hover:scale-110 transition-transform">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.images.length === 0 && (
                  <div className="border-2 border-dashed border-stone-300 rounded p-8 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                    <p className="text-sm text-stone-400 font-light">
                      {language === 'es' ? 'No hay imágenes' : 'No images'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-light text-stone-500 mb-4 tracking-widest uppercase">
                  {language === 'es' ? 'Servicios' : 'Amenities'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {AMENITIES.map(({ key, label, icon: Icon }) => {
                    const selected = formData.amenities.includes(key)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            amenities: selected
                              ? prev.amenities.filter(a => a !== key)
                              : [...prev.amenities, key]
                          }))
                        }}
                        className={`flex items-center space-x-2 px-3 py-2.5 border text-xs font-light tracking-wide transition-all text-left ${
                          selected
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{language === 'es' ? label.es : label.en}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Custom amenity input */}
                <div className="mt-4 flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs font-light text-stone-400 mb-1 tracking-wide">
                      {language === 'es' ? 'Agregar servicio personalizado' : 'Add custom amenity'}
                    </label>
                    <input
                      type="text"
                      value={formData.customAmenity}
                      onChange={(e) => setFormData({ ...formData, customAmenity: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const val = formData.customAmenity.trim()
                          if (val && !formData.amenities.includes(val)) {
                            setFormData(prev => ({
                              ...prev,
                              amenities: [...prev.amenities, val],
                              customAmenity: ''
                            }))
                          }
                        }
                      }}
                      className="w-full px-0 py-2 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                      placeholder={language === 'es' ? 'Ej: Sauna' : 'E.g. Sauna'}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = formData.customAmenity.trim()
                      if (val && !formData.amenities.includes(val)) {
                        setFormData(prev => ({
                          ...prev,
                          amenities: [...prev.amenities, val],
                          customAmenity: ''
                        }))
                      }
                    }}
                    className="px-4 py-2 border border-stone-300 hover:border-stone-900 text-stone-900 text-xs tracking-wide transition-all"
                  >
                    {language === 'es' ? 'Agregar' : 'Add'}
                  </button>
                </div>

                {/* Show custom (non-predefined) amenities as removable chips */}
                {formData.amenities.filter(a => !getAmenityConfig(a)).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.amenities.filter(a => !getAmenityConfig(a)).map(a => (
                      <span key={a} className="inline-flex items-center space-x-1 bg-stone-100 text-stone-700 px-3 py-1 text-xs font-light">
                        <span>{a}</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, amenities: prev.amenities.filter(x => x !== a) }))}
                          className="ml-1 text-stone-400 hover:text-stone-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="available" className="text-sm font-light text-stone-600">
                  {language === 'es' ? 'Activa' : 'Active'}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                {(() => {
                  const currentlyVisible = properties.filter(p => {
                    if (editingProperty && p.id === editingProperty.id) {
                      return false
                    }
                    return (p.show_in_landing ?? true) === true
                  }).length
                  const isAtLimit = currentlyVisible >= 10 && !formData.showInLanding

                  return (
                    <>
                      <input
                        type="checkbox"
                        id="showInLanding"
                        checked={formData.showInLanding}
                        onChange={(e) => {
                          if (e.target.checked && currentlyVisible >= 10) {
                            alert(language === 'es'
                              ? 'Solo se pueden mostrar 10 propiedades en la landing. Desactiva una propiedad existente primero.'
                              : 'Only 10 properties can be shown on the landing. Please deactivate an existing property first.')
                            return
                          }
                          setFormData({ ...formData, showInLanding: e.target.checked })
                        }}
                        disabled={isAtLimit}
                        className="w-4 h-4"
                      />
                      <label htmlFor="showInLanding" className={`text-sm font-light ${isAtLimit ? 'text-stone-400' : 'text-stone-600'}`}>
                        {language === 'es' ? 'Mostrar en la landing (máx. 10)' : 'Show on landing (max 10)'}
                        {isAtLimit && (
                          <span className="block text-xs text-stone-400 mt-1">
                            {language === 'es' ? '(Límite alcanzado)' : '(Limit reached)'}
                          </span>
                        )}
                      </label>
                    </>
                  )
                })()}
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="btn-animate flex-1 bg-stone-900 hover:bg-stone-800 text-white font-light py-4 transition-all text-sm tracking-widest uppercase"
                >
                  {editingProperty
                    ? (language === 'es' ? 'Guardar Cambios' : 'Save Changes')
                    : (language === 'es' ? 'Crear Propiedad' : 'Create Property')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingProperty(null)
                    setFormData({
                      name: '',
                      description: '',
                      location: '',
                      bedrooms: '',
                      bathrooms: '',
                      maxGuests: '',
                      pricePerNight: '',
                      images: [],
                      amenities: '',
                      available: true,
                      showInLanding: true
                    })
                  }}
                  className="btn-scale flex-1 border border-stone-300 hover:border-stone-900 text-stone-900 font-light py-4 transition-all text-sm tracking-widest uppercase"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Properties List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 border border-stone-200 bg-white/50">
            <Building2 className="w-16 h-16 mx-auto mb-6 text-stone-300" />
            <h3 className="text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
              {language === 'es' ? 'No hay propiedades' : 'No properties'}
            </h3>
            <p className="text-stone-500 text-sm font-light tracking-wide">
              {language === 'es'
                ? 'Comienza agregando tu primera propiedad'
                : 'Start by adding your first property'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white border border-stone-200 hover:border-stone-300 transition-all overflow-hidden"
              >
                <div className="aspect-video bg-stone-200 overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-display text-stone-900 tracking-tight flex-1">
                      {property.name}
                    </h3>
                    <button
                      onClick={() => toggleAvailability(property)}
                      className={`ml-2 p-1 ${property.available ? 'text-green-600' : 'text-stone-400'}`}
                      title={property.available
                        ? (language === 'es' ? 'Activa' : 'Active')
                        : (language === 'es' ? 'Inactiva' : 'Inactive')}
                    >
                      {property.available ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>

                  <p className="text-sm text-stone-500 font-light mb-4 line-clamp-2">
                    {property.location}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-light text-stone-600">
                      {property.bedrooms} {language === 'es' ? 'hab' : 'bed'} • {property.bathrooms} {language === 'es' ? 'baños' : 'bath'} • {property.max_guests} {language === 'es' ? 'huésp' : 'guests'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(property)}
                        className="btn-scale flex-1 flex items-center justify-center space-x-2 border border-stone-300 hover:border-stone-900 text-stone-900 py-2 transition-all text-xs tracking-wide"
                      >
                        <Edit className="w-4 h-4" />
                        <span>{language === 'es' ? 'Editar' : 'Edit'}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="btn-scale flex-1 flex items-center justify-center space-x-2 border border-red-300 hover:border-red-600 text-red-600 py-2 transition-all text-xs tracking-wide"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{language === 'es' ? 'Eliminar' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-stone-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-light text-stone-500 uppercase tracking-widest">
                          {language === 'es' ? 'Landing' : 'Landing'}
                        </p>
                        <p className="text-xs text-stone-400 font-light">
                          {language === 'es'
                            ? 'Controla si aparece en "Nuestras propiedades" (máx. 10)'
                            : 'Control visibility on "Our properties" (max 10)'}
                        </p>
                      </div>
                      {(() => {
                        const currentlyVisible = properties.filter(p => {
                          if (p.id === property.id) {
                            return false
                          }
                          return (p.show_in_landing ?? true) === true
                        }).length
                        const isAtLimit = currentlyVisible >= 10 && !(property.show_in_landing ?? true)
                        const isDisabled = !!landingUpdates[property.id] || isAtLimit

                        return (
                          <button
                            onClick={() => handleLandingToggle(property)}
                            disabled={isDisabled}
                            className={`min-w-[110px] flex items-center justify-center space-x-2 px-3 py-1.5 text-xs tracking-wide border transition-all ${
                              property.show_in_landing
                                ? 'border-green-500 text-green-600'
                                : 'border-stone-300 text-stone-500'
                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-stone-900 hover:text-stone-900'}`}
                            title={isAtLimit ? (language === 'es' ? 'Ya hay 10 propiedades visibles. Desactiva una primero.' : 'Already 10 properties visible. Deactivate one first.') : ''}
                          >
                            {landingUpdates[property.id] ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <span>{property.show_in_landing ? (language === 'es' ? 'Visible' : 'Visible') : (language === 'es' ? 'Oculta' : 'Hidden')}</span>
                            )}
                          </button>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && isAdmin && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-display font-light text-stone-900 tracking-tight mb-2">
                  Reviews
                </h2>
                <p className="text-stone-500 text-sm font-light">
                  {language === 'es' ? 'Gestiona las reviews de clientes' : 'Manage client reviews'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchReviews()}
                  disabled={reviewsLoading}
                  className="inline-flex items-center justify-center space-x-2 border border-stone-300 hover:border-stone-900 text-stone-900 px-4 py-2 text-xs tracking-widest uppercase transition-all disabled:opacity-60"
                >
                  <RefreshCcw className={`w-4 h-4 ${reviewsLoading ? 'animate-spin' : ''}`} />
                  <span>{language === 'es' ? 'Actualizar' : 'Refresh'}</span>
                </button>
                {!showReviewForm && (
                  <button
                    onClick={() => { setShowReviewForm(true); setEditingReview(null); setReviewFormData({ reviewer_name: '', rating: 5, comment: '', property_id: '' }) }}
                    className="inline-flex items-center justify-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 text-xs tracking-widest uppercase transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'es' ? 'Nueva Review' : 'New Review'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="mb-8 bg-white border border-stone-200 p-6 md:p-8">
                <h3 className="text-2xl font-display font-light text-stone-900 mb-6 tracking-tight">
                  {editingReview
                    ? (language === 'es' ? 'Editar Review' : 'Edit Review')
                    : (language === 'es' ? 'Nueva Review' : 'New Review')}
                </h3>
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                        {language === 'es' ? 'Nombre' : 'Name'}
                      </label>
                      <input
                        type="text"
                        value={reviewFormData.reviewer_name}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, reviewer_name: e.target.value })}
                        required
                        className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                        Rating (1-5)
                      </label>
                      <div className="flex items-center space-x-1 py-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                            className="p-0.5"
                          >
                            <Star className={`w-6 h-6 transition-colors ${
                              star <= reviewFormData.rating
                                ? 'fill-stone-900 text-stone-900'
                                : 'text-stone-300'
                            }`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                      {language === 'es' ? 'Propiedad' : 'Property'}
                    </label>
                    <select
                      value={reviewFormData.property_id}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, property_id: e.target.value })}
                      className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                    >
                      <option value="">{language === 'es' ? '— Sin propiedad —' : '— No property —'}</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                      {language === 'es' ? 'Comentario' : 'Comment'}
                    </label>
                    <textarea
                      value={reviewFormData.comment}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                      required
                      rows="3"
                      className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light resize-none"
                    />
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="btn-animate flex-1 bg-stone-900 hover:bg-stone-800 text-white font-light py-4 transition-all text-sm tracking-widest uppercase"
                    >
                      {editingReview
                        ? (language === 'es' ? 'Guardar Cambios' : 'Save Changes')
                        : (language === 'es' ? 'Crear Review' : 'Create Review')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowReviewForm(false); setEditingReview(null) }}
                      className="btn-scale flex-1 border border-stone-300 hover:border-stone-900 text-stone-900 font-light py-4 transition-all text-sm tracking-widest uppercase"
                    >
                      {language === 'es' ? 'Cancelar' : 'Cancel'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews List */}
            {reviewsLoading && reviews.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto mb-4"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20 border border-stone-200 bg-white/50">
                <MessageSquare className="w-16 h-16 mx-auto mb-6 text-stone-300" />
                <h3 className="text-2xl font-display font-light text-stone-900 mb-2 tracking-tight">
                  {language === 'es' ? 'No hay reviews' : 'No reviews'}
                </h3>
                <p className="text-stone-500 text-sm font-light tracking-wide">
                  {language === 'es' ? 'Agrega la primera review' : 'Add the first review'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-stone-200 p-6 hover:border-stone-300 transition-all">
                    <div className="flex items-center space-x-1 mb-3">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-stone-900 text-stone-900' : 'text-stone-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-stone-600 text-sm font-light leading-relaxed mb-4 line-clamp-3">
                      "{review.comment}"
                    </p>
                    <p className="text-stone-900 text-sm font-medium">{review.reviewer_name}</p>
                    {review.property_id && (
                      <p className="text-stone-400 text-xs font-light mb-4">
                        {properties.find(p => p.id === review.property_id)?.name || (language === 'es' ? 'Propiedad eliminada' : 'Deleted property')}
                      </p>
                    )}
                    {!review.property_id && <div className="mb-4" />}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="btn-scale flex-1 flex items-center justify-center space-x-2 border border-stone-300 hover:border-stone-900 text-stone-900 py-2 transition-all text-xs tracking-wide"
                      >
                        <Edit className="w-4 h-4" />
                        <span>{language === 'es' ? 'Editar' : 'Edit'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="btn-scale flex-1 flex items-center justify-center space-x-2 border border-red-300 hover:border-red-600 text-red-600 py-2 transition-all text-xs tracking-wide"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{language === 'es' ? 'Eliminar' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab Content */}
        {activeTab === 'users' && isAdmin && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-display font-light text-stone-900 tracking-tight mb-2">
                  {language === 'es' ? 'Usuarios registrados' : 'Registered users'}
                </h2>
                <p className="text-stone-500 text-sm font-light">
                  {language === 'es'
                    ? 'Revisa quién se ha registrado en la plataforma'
                    : 'Review who has signed up to the platform'}
                </p>
              </div>
              <button
                onClick={() => fetchUsers(usersPagination.currentPage, usersPagination.itemsPerPage)}
                disabled={usersLoading}
                className="inline-flex items-center justify-center space-x-2 border border-stone-300 hover:border-stone-900 text-stone-900 px-4 py-2 text-xs tracking-widest uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCcw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                <span>{language === 'es' ? 'Actualizar' : 'Refresh'}</span>
              </button>
            </div>

            <div className="bg-white border border-stone-200">
              {usersLoading && users.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-stone-500 text-sm font-light">
                    {language === 'es' ? 'Cargando usuarios...' : 'Loading users...'}
                  </p>
                </div>
              ) : usersError ? (
                <div className="py-12 px-6 text-center">
                  <p className="text-red-600 text-sm font-light mb-4">
                    {language === 'es'
                      ? 'No se pudieron cargar los usuarios.'
                      : 'Users could not be loaded.'}
                  </p>
                  <button
                    onClick={fetchUsers}
                    className="text-xs tracking-widest uppercase text-stone-900 underline"
                  >
                    {language === 'es' ? 'Volver a intentar' : 'Try again'}
                  </button>
                </div>
              ) : users.length === 0 ? (
                <div className="py-12 px-6 text-center text-stone-500 text-sm font-light">
                  {language === 'es'
                    ? 'No hay usuarios registrados.'
                    : 'No registered users.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-stone-100">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-light text-stone-500 uppercase tracking-widest">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-light text-stone-500 uppercase tracking-widest">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-light text-stone-500 uppercase tracking-widest">
                          {language === 'es' ? 'Rol' : 'Role'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-light text-stone-500 uppercase tracking-widest">
                          {language === 'es' ? 'Registrado' : 'Created'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-stone-50">
                          <td className="px-6 py-3 text-xs font-mono text-stone-500 break-all">
                            {user.id}
                          </td>
                          <td className="px-6 py-3 text-sm text-stone-900">{user.email}</td>
                          <td className="px-6 py-3 text-sm">
                            <span className="inline-flex items-center space-x-2">
                              <span className="text-xs tracking-widest uppercase text-stone-500">
                                {user.role || 'client'}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-stone-500">
                            {formatUserDate(user.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Componente de paginación */}
              {usersPagination.totalPages > 1 && (
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <Pagination
                    currentPage={usersPagination.currentPage}
                    totalPages={usersPagination.totalPages}
                    totalItems={usersPagination.totalItems}
                    itemsPerPage={usersPagination.itemsPerPage}
                    onPageChange={handleUsersPageChange}
                    className="justify-center"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(AdminDashboard)
