import React, { useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Shield, ArrowLeft, Save, Upload, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { uploadAvatarToStorage, deleteAvatarFromStorage } from '../utils/storageHelper'

const Settings = () => {
  const { currentUser, userRole, updateProfile } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    photoURL: currentUser?.photoURL || null
  })

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingPhoto(true)
      setMessage(null)

      // Eliminar avatar anterior si existe
      if (currentUser?.photoURL) {
        await deleteAvatarFromStorage(currentUser.photoURL)
      }

      // Subir nuevo avatar a Storage
      const avatarUrl = await uploadAvatarToStorage(file, currentUser?.id)

      setFormData(prev => ({
        ...prev,
        photoURL: avatarUrl
      }))

      setMessage({
        type: 'success',
        text: language === 'es'
          ? 'Foto cargada. Presiona "Guardar Cambios" para aplicar.'
          : 'Photo uploaded. Press "Save Changes" to apply.'
      })
    } catch (error) {
      console.error('Error uploading photo:', error)
      setMessage({
        type: 'error',
        text: language === 'es'
          ? `Error al cargar la foto: ${error.message}`
          : `Error uploading photo: ${error.message}`
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    try {
      // Eliminar del Storage si existe
      if (currentUser?.photoURL) {
        await deleteAvatarFromStorage(currentUser.photoURL)
      }

      setFormData(prev => ({
        ...prev,
        photoURL: null
      }))
      setMessage({
        type: 'success',
        text: language === 'es'
          ? 'Foto eliminada. Presiona "Guardar Cambios" para aplicar.'
          : 'Photo removed. Press "Save Changes" to apply.'
      })
    } catch (error) {
      console.error('Error removing photo:', error)
      setFormData(prev => ({
        ...prev,
        photoURL: null
      }))
      setMessage({
        type: 'success',
        text: language === 'es'
          ? 'Foto eliminada. Presiona "Guardar Cambios" para aplicar.'
          : 'Photo removed. Press "Save Changes" to apply.'
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      await updateProfile({
        displayName: formData.displayName,
        photoURL: formData.photoURL
      })

      setMessage({
        type: 'success',
        text: language === 'es'
          ? 'Configuración guardada exitosamente'
          : 'Settings saved successfully'
      })
    } catch (error) {
      console.error('Error updating settings:', error)
      setMessage({
        type: 'error',
        text: language === 'es'
          ? 'Error al guardar la configuración'
          : 'Error saving settings'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors text-sm font-light tracking-wide mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'es' ? 'Volver' : 'Back'}</span>
          </button>

          <h1 className="text-5xl md:text-6xl font-display font-light text-stone-900 mb-2 tracking-tight">
            {language === 'es' ? 'Configuración' : 'Settings'}
          </h1>
          <p className="text-stone-500 text-sm font-light tracking-wide">
            {language === 'es'
              ? 'Administra tu cuenta y preferencias'
              : 'Manage your account and preferences'}
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white border border-stone-200 p-8 mb-6">
          <div className="flex items-start space-x-6 pb-6 border-b border-stone-200 mb-6">
            <div className="relative group">
              {formData.photoURL ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-stone-200">
                  <img
                    src={formData.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              {formData.photoURL && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title={language === 'es' ? 'Eliminar foto' : 'Remove photo'}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-display font-light text-stone-900 tracking-tight mb-2">
                {formData.displayName || (language === 'es' ? 'Usuario' : 'User')}
              </h2>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-3 h-3 text-stone-400" />
                <span className="text-xs text-stone-500 font-light tracking-wide uppercase">
                  {userRole === 'admin'
                    ? (language === 'es' ? 'Administrador' : 'Administrator')
                    : (language === 'es' ? 'Usuario' : 'User')}
                </span>
              </div>
              <label className="cursor-pointer inline-flex items-center space-x-2 bg-stone-100 hover:bg-stone-200 text-stone-900 px-4 py-2 transition-all text-xs tracking-wide font-light border border-stone-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto ? (
                  <>
                    <div className="w-3 h-3 border-2 border-stone-600/30 border-t-stone-600 rounded-full animate-spin"></div>
                    <span>{language === 'es' ? 'Cargando...' : 'Uploading...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    <span>{language === 'es' ? 'Cambiar Foto' : 'Change Photo'}</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                {language === 'es' ? 'Nombre' : 'Name'}
              </label>
              <div className="relative">
                <User className="absolute left-0 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder={language === 'es' ? 'Tu nombre' : 'Your name'}
                  className="w-full pl-6 pr-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-light text-stone-500 mb-2 tracking-widest uppercase">
                {language === 'es' ? 'Correo Electrónico' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-0 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-6 pr-0 py-3 border-0 border-b border-stone-200 transition-all outline-none bg-stone-50 text-stone-500 text-sm font-light cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-stone-400 mt-2 font-light">
                {language === 'es'
                  ? 'El correo electrónico no se puede modificar'
                  : 'Email cannot be modified'}
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 border-l-2 ${
                message.type === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-red-300 bg-red-50 text-red-700'
              }`}>
                <p className="text-sm font-light">{message.text}</p>
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-light py-4 transition-all disabled:cursor-not-allowed text-sm tracking-widest uppercase flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{language === 'es' ? 'Guardando...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{language === 'es' ? 'Guardar Cambios' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-stone-50 border border-stone-200 p-6">
          <h3 className="text-sm font-light text-stone-500 mb-3 tracking-widest uppercase">
            {language === 'es' ? 'Información de la Cuenta' : 'Account Information'}
          </h3>
          <div className="space-y-2 text-sm font-light text-stone-600">
            <div className="flex justify-between">
              <span>{language === 'es' ? 'ID de Usuario:' : 'User ID:'}</span>
              <span className="font-mono text-xs text-stone-400">{currentUser?.uid?.substring(0, 16)}...</span>
            </div>
            <div className="flex justify-between">
              <span>{language === 'es' ? 'Tipo de Cuenta:' : 'Account Type:'}</span>
              <span className="text-stone-900">
                {userRole === 'admin'
                  ? (language === 'es' ? 'Administrador' : 'Administrator')
                  : (language === 'es' ? 'Usuario Estándar' : 'Standard User')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Settings)
