/**
 * Configuración de administradores
 * Lista de emails que tienen acceso de admin
 */

export const ADMIN_EMAILS = [
  'mpozzetti@mimetria.com',
  'mbenti@mimetria.com',
  // Agrega más emails de admin aquí si es necesario
]

/**
 * Verifica si un email tiene permisos de admin
 * @param {string} email - Email del usuario
 * @returns {boolean} - true si es admin
 */
export const isAdminEmail = (email) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
