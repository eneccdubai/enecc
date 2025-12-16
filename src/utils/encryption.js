/**
 * Utilidades de encriptación para datos sensibles en localStorage
 * Usa Web Crypto API para encriptación AES-GCM
 */

const ENCRYPTION_KEY_NAME = 'enecc_encryption_key'

/**
 * Genera o recupera la clave de encriptación
 * @returns {Promise<CryptoKey>}
 */
const getEncryptionKey = async () => {
  // Intentar recuperar clave existente
  const storedKey = sessionStorage.getItem(ENCRYPTION_KEY_NAME)

  if (storedKey) {
    try {
      const keyData = JSON.parse(storedKey)
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )
    } catch (error) {
      console.error('Error importing key:', error)
    }
  }

  // Generar nueva clave
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  // Guardar en sessionStorage (se pierde al cerrar navegador)
  const exportedKey = await crypto.subtle.exportKey('jwk', key)
  sessionStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey))

  return key
}

/**
 * Encripta datos
 * @param {string} data - Datos a encriptar
 * @returns {Promise<string>} - Datos encriptados (base64)
 */
export const encryptData = async (data) => {
  try {
    const key = await getEncryptionKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encodedData = new TextEncoder().encode(data)

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    )

    // Combinar IV + datos encriptados
    const combined = new Uint8Array(iv.length + encryptedData.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encryptedData), iv.length)

    // Convertir a base64
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Encryption error:', error)
    // Fallback: devolver datos sin encriptar
    return data
  }
}

/**
 * Desencripta datos
 * @param {string} encryptedData - Datos encriptados (base64)
 * @returns {Promise<string>} - Datos desencriptados
 */
export const decryptData = async (encryptedData) => {
  try {
    const key = await getEncryptionKey()

    // Convertir de base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    )

    // Separar IV y datos
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    return new TextDecoder().decode(decryptedData)
  } catch (error) {
    console.error('Decryption error:', error)
    // Fallback: devolver datos como están
    return encryptedData
  }
}

/**
 * Hash de datos (no reversible)
 * @param {string} data - Datos a hashear
 * @returns {Promise<string>} - Hash hex
 */
export const hashData = async (data) => {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
