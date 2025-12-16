/**
 * Storage Helper
 *
 * Utilidad para subir imágenes optimizadas a Supabase Storage
 * Reemplaza el sistema anterior de base64 con URLs públicas
 */

import { supabase } from '../supabase/config'
import { validateImageFile } from './security'

const BUCKET_NAME = 'property-images'
const MAX_WIDTH = 1200
const MAX_HEIGHT = 800
const QUALITY = 0.90 // 90% calidad WebP

/**
 * Optimiza una imagen y la convierte a Blob WebP
 * @param {File} file - Archivo de imagen
 * @returns {Promise<Blob>} - Blob de la imagen optimizada en WebP
 */
const optimizeImageToBlob = (file) => {
  return new Promise((resolve, reject) => {
    // Validación de seguridad
    const validation = validateImageFile(file)
    if (!validation.valid) {
      reject(new Error(validation.error))
      return
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo debe ser una imagen'))
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width)
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height)
            height = MAX_HEIGHT
          }
        }

        // Establecer dimensiones del canvas
        canvas.width = width
        canvas.height = height

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a WebP Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Error al convertir imagen a WebP'))
            }
          },
          'image/webp',
          QUALITY
        )
      }

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'))
      }

      img.src = e.target.result
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Genera un nombre de archivo único para evitar colisiones
 * @param {string} originalName - Nombre original del archivo
 * @returns {string} - Nombre único con timestamp
 */
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = 'webp' // Siempre usamos WebP
  const baseName = originalName
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 30)

  return `${baseName}-${timestamp}-${random}.${extension}`
}

/**
 * Sube una imagen optimizada a Supabase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} propertyId - ID de la propiedad (opcional, para organizar)
 * @returns {Promise<string>} - URL pública de la imagen subida
 */
export const uploadImageToStorage = async (file, propertyId = null) => {
  try {
    // Optimizar imagen a WebP Blob
    const optimizedBlob = await optimizeImageToBlob(file)

    // Generar nombre único
    const fileName = generateUniqueFileName(file.name)
    const filePath = propertyId ? `${propertyId}/${fileName}` : fileName

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, optimizedBlob, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 año de cache
        upsert: false
      })

    if (error) {
      console.error('Error uploading to Storage:', error)
      throw new Error(`Error al subir imagen: ${error.message}`)
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Error al obtener URL pública de la imagen')
    }

    console.log(`✅ Imagen subida: ${data.path} (${Math.round(optimizedBlob.size / 1024)}KB)`)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error in uploadImageToStorage:', error)
    throw error
  }
}

/**
 * Sube múltiples imágenes a Supabase Storage
 * @param {FileList|File[]} files - Archivos de imagen
 * @param {string} propertyId - ID de la propiedad (opcional)
 * @returns {Promise<string[]>} - Array de URLs públicas
 */
export const uploadImagesToStorage = async (files, propertyId = null) => {
  const filesArray = Array.from(files)
  const uploadPromises = filesArray.map(file => uploadImageToStorage(file, propertyId))

  try {
    const urls = await Promise.all(uploadPromises)
    console.log(`✅ ${urls.length} imágenes subidas exitosamente`)
    return urls
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    throw error
  }
}

/**
 * Elimina una imagen del Storage usando su URL
 * @param {string} imageUrl - URL pública de la imagen
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export const deleteImageFromStorage = async (imageUrl) => {
  try {
    // Extraer el path de la URL pública
    // URL format: https://[project-ref].supabase.co/storage/v1/object/public/property-images/[path]
    const urlParts = imageUrl.split('/property-images/')
    if (urlParts.length !== 2) {
      throw new Error('URL de imagen inválida')
    }

    const filePath = decodeURIComponent(urlParts[1])

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Error deleting from Storage:', error)
      throw error
    }

    console.log(`✅ Imagen eliminada: ${filePath}`)
    return true
  } catch (error) {
    console.error('Error in deleteImageFromStorage:', error)
    // No lanzar error para evitar bloquear operaciones
    return false
  }
}

/**
 * Elimina múltiples imágenes del Storage
 * @param {string[]} imageUrls - Array de URLs públicas
 * @returns {Promise<boolean>} - true si todas se eliminaron correctamente
 */
export const deleteImagesFromStorage = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map(url => deleteImageFromStorage(url))
    await Promise.all(deletePromises)
    return true
  } catch (error) {
    console.error('Error deleting multiple images:', error)
    return false
  }
}

/**
 * Verifica si una URL es de Storage o base64
 * @param {string} url - URL o base64 string
 * @returns {boolean} - true si es URL de Storage
 */
export const isStorageUrl = (url) => {
  return url && typeof url === 'string' && url.startsWith('http')
}

// ============================================
// AVATAR FUNCTIONS
// ============================================

/**
 * Sube un avatar de usuario a Supabase Storage
 * Los avatares se guardan en el mismo bucket pero con prefijo "avatars/"
 * @param {File} file - Archivo de imagen
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} - URL pública del avatar
 */
export const uploadAvatarToStorage = async (file, userId) => {
  try {
    // Optimizar imagen a WebP Blob (más pequeño para avatares: 400x400)
    const optimizedBlob = await optimizeAvatarToBlob(file)

    // Generar nombre único para el avatar
    const fileName = `avatar-${userId}-${Date.now()}.webp`
    const filePath = `avatars/${fileName}`

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, optimizedBlob, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 año de cache
        upsert: true // Sobrescribir si existe
      })

    if (error) {
      console.error('Error uploading avatar to Storage:', error)
      throw new Error(`Error al subir avatar: ${error.message}`)
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Error al obtener URL pública del avatar')
    }

    console.log(`✅ Avatar subido: ${data.path} (${Math.round(optimizedBlob.size / 1024)}KB)`)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error in uploadAvatarToStorage:', error)
    throw error
  }
}

/**
 * Optimiza una imagen de avatar y la convierte a Blob WebP
 * Los avatares son más pequeños que las imágenes de propiedades
 * @param {File} file - Archivo de imagen
 * @returns {Promise<Blob>} - Blob de la imagen optimizada en WebP
 */
const optimizeAvatarToBlob = (file) => {
  return new Promise((resolve, reject) => {
    // Validación de seguridad
    const validation = validateImageFile(file)
    if (!validation.valid) {
      reject(new Error(validation.error))
      return
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo debe ser una imagen'))
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Avatares más pequeños: 400x400 máximo
        const MAX_SIZE = 400
        let width = img.width
        let height = img.height

        // Redimensionar manteniendo aspect ratio
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width)
            width = MAX_SIZE
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height)
            height = MAX_SIZE
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a WebP con 85% de calidad (suficiente para avatares)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Error al convertir avatar a WebP'))
            }
          },
          'image/webp',
          0.85
        )
      }

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'))
      }

      img.src = e.target.result
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Elimina un avatar antiguo del Storage antes de subir uno nuevo
 * @param {string} avatarUrl - URL pública del avatar anterior
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export const deleteAvatarFromStorage = async (avatarUrl) => {
  // Si no es una URL de Storage (es base64), no hay nada que eliminar
  if (!isStorageUrl(avatarUrl)) {
    return true
  }

  try {
    // Extraer el path de la URL pública
    const urlParts = avatarUrl.split('/property-images/')
    if (urlParts.length !== 2) {
      console.warn('URL de avatar inválida:', avatarUrl)
      return false
    }

    const filePath = decodeURIComponent(urlParts[1])

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Error deleting avatar from Storage:', error)
      return false
    }

    console.log(`✅ Avatar anterior eliminado: ${filePath}`)
    return true
  } catch (error) {
    console.error('Error in deleteAvatarFromStorage:', error)
    // No lanzar error para no bloquear la subida del nuevo avatar
    return false
  }
}
