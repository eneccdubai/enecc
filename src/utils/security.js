/**
 * Utilidades de seguridad
 * Protección contra XSS, validación de inputs, sanitización
 */

/**
 * Sanitiza una cadena de texto para prevenir XSS
 * @param {string} str - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeString = (str) => {
  if (!str) return ''

  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Valida un número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - true si es válido
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/
  return phoneRegex.test(phone)
}

/**
 * Valida una URL
 * @param {string} url - URL a validar
 * @returns {boolean} - true si es válida
 */
export const isValidURL = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Limpia un objeto de propiedades no permitidas
 * @param {Object} obj - Objeto a limpiar
 * @param {Array} allowedKeys - Claves permitidas
 * @returns {Object} - Objeto limpio
 */
export const sanitizeObject = (obj, allowedKeys) => {
  const clean = {}
  allowedKeys.forEach(key => {
    if (obj.hasOwnProperty(key)) {
      clean[key] = typeof obj[key] === 'string'
        ? sanitizeString(obj[key])
        : obj[key]
    }
  })
  return clean
}

/**
 * Valida que un archivo sea una imagen válida
 * @param {File} file - Archivo a validar
 * @returns {Object} - {valid: boolean, error: string}
 */
export const validateImageFile = (file) => {
  // Validar tipo MIME
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo JPG, PNG, WebP y GIF.'
    }
  }

  // Validar tamaño (máximo 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Archivo demasiado grande. Máximo 10MB.'
    }
  }

  // Validar extensión del nombre
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (!validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Extensión de archivo no permitida.'
    }
  }

  return { valid: true }
}

/**
 * Valida datos de propiedad antes de guardar
 * @param {Object} property - Datos de propiedad
 * @returns {Object} - {valid: boolean, errors: Array}
 */
export const validatePropertyData = (property) => {
  const errors = []

  // Validar nombre
  if (!property.name || property.name.trim().length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres')
  }
  if (property.name && property.name.length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres')
  }

  // Validar descripción
  if (!property.description || property.description.trim().length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres')
  }
  if (property.description && property.description.length > 1000) {
    errors.push('La descripción no puede exceder 1000 caracteres')
  }

  // Validar ubicación
  if (!property.location || property.location.trim().length < 3) {
    errors.push('La ubicación debe tener al menos 3 caracteres')
  }

  // Validar números
  if (!Number.isInteger(property.bedrooms) || property.bedrooms < 1 || property.bedrooms > 50) {
    errors.push('Habitaciones debe ser un número entre 1 y 50')
  }
  if (!Number.isInteger(property.bathrooms) || property.bathrooms < 1 || property.bathrooms > 50) {
    errors.push('Baños debe ser un número entre 1 y 50')
  }
  if (!Number.isInteger(property.max_guests) || property.max_guests < 1 || property.max_guests > 100) {
    errors.push('Huéspedes debe ser un número entre 1 y 100')
  }

  // Validar precio
  if (typeof property.price_per_night !== 'number' || property.price_per_night < 0 || property.price_per_night > 1000000) {
    errors.push('Precio debe ser un número entre 0 y 1,000,000')
  }

  // Validar imágenes
  if (!Array.isArray(property.images) || property.images.length === 0) {
    errors.push('Debe incluir al menos una imagen')
  }
  if (property.images && property.images.length > 20) {
    errors.push('Máximo 20 imágenes permitidas')
  }

  // Validar amenidades
  if (!Array.isArray(property.amenities) || property.amenities.length === 0) {
    errors.push('Debe incluir al menos una amenidad')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Rate limiting simple (almacena intentos en memoria)
 */
const rateLimitStore = new Map()

export const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now()
  const record = rateLimitStore.get(key) || { attempts: 0, resetTime: now + windowMs }

  // Reset si pasó el tiempo
  if (now > record.resetTime) {
    record.attempts = 0
    record.resetTime = now + windowMs
  }

  record.attempts++
  rateLimitStore.set(key, record)

  return {
    allowed: record.attempts <= maxAttempts,
    remaining: Math.max(0, maxAttempts - record.attempts),
    resetTime: record.resetTime
  }
}

/**
 * Genera un token CSRF simple
 * @returns {string} - Token
 */
export const generateCSRFToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Valida contraseña segura
 * @param {string} password - Contraseña a validar
 * @returns {Object} - {valid: boolean, errors: Array}
 */
export const validatePassword = (password) => {
  const errors = []

  if (!password || password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres')
  }

  if (password && password.length > 128) {
    errors.push('La contraseña no puede exceder 128 caracteres')
  }

  if (password && !/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula')
  }

  if (password && !/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula')
  }

  if (password && !/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número')
  }

  // Detectar contraseñas comunes
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123']
  if (password && commonPasswords.includes(password.toLowerCase())) {
    errors.push('Contraseña demasiado común. Elige una más segura')
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: errors.length === 0 ? 'strong' : errors.length <= 2 ? 'medium' : 'weak'
  }
}

/**
 * Previene ataques de timing en comparaciones de strings
 * @param {string} a - String a
 * @param {string} b - String b
 * @returns {boolean} - true si son iguales
 */
export const secureCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
