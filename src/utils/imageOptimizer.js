/**
 * Utilidad para optimizar imágenes automáticamente
 * Redimensiona y comprime imágenes para máxima velocidad
 */

import { validateImageFile } from './security'

const MAX_WIDTH = 1200
const MAX_HEIGHT = 800
const QUALITY = 0.90 // 90% calidad WebP (mejor compresión que JPEG)

/**
 * Optimiza una imagen: redimensiona y comprime
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} - Base64 de la imagen optimizada
 */
export const optimizeImage = (file) => {
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

        // Convertir a WebP (mejor compresión y calidad que JPEG/PNG)
        const optimizedDataUrl = canvas.toDataURL('image/webp', QUALITY)

        resolve(optimizedDataUrl)
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
 * Optimiza múltiples imágenes
 * @param {FileList|File[]} files - Archivos de imagen
 * @returns {Promise<string[]>} - Array de base64 optimizados
 */
export const optimizeImages = async (files) => {
  const filesArray = Array.from(files)
  const promises = filesArray.map(file => optimizeImage(file))
  return Promise.all(promises)
}

/**
 * Calcula el tamaño aproximado en KB de una imagen base64
 * @param {string} base64String - Imagen en base64
 * @returns {number} - Tamaño en KB
 */
export const getBase64Size = (base64String) => {
  const base64Length = base64String.length - (base64String.indexOf(',') + 1)
  const padding = (base64String.charAt(base64String.length - 2) === '=') ? 2 :
                  ((base64String.charAt(base64String.length - 1) === '=') ? 1 : 0)
  return Math.round((base64Length * 0.75 - padding) / 1024)
}
