/**
 * Configuración de administradores
 * Combina emails hardcoded + VITE_ADMIN_EMAILS del entorno
 */

const HARDCODED_ADMINS = [
  'mimetria@eneccdubai.com',
  'enecc.team@gmail.com',
]

// Merge: hardcoded + env var (Vercel), todo en minúsculas, sin duplicados
const envEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export const ADMIN_EMAILS = [...new Set([
  ...HARDCODED_ADMINS.map(e => e.toLowerCase()),
  ...envEmails,
])]

/**
 * Verifica si un email tiene permisos de admin
 * @param {string} email - Email del usuario
 * @returns {boolean} - true si es admin
 */
export const isAdminEmail = (email) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
