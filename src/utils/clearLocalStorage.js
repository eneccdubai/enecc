/**
 * Limpia datos obsoletos de localStorage
 *
 * Este script elimina todos los datos de la antigua implementación local
 * para asegurar que la aplicación solo use Supabase como fuente de datos.
 */

const KEYS_TO_CLEAR = [
  'enecc_local_properties',
  'enecc_local_bookings',
  'enecc_local_users',
  'enecc_properties_cache',
  'enecc_properties_timestamp'
]

export const clearLegacyLocalStorage = () => {
  let clearedKeys = []

  KEYS_TO_CLEAR.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      clearedKeys.push(key)
    }
  })

  if (clearedKeys.length > 0) {
    console.log(
      '%c🧹 LIMPIEZA DE DATOS LOCALES',
      'background: #ef4444; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold;',
      `\nSe eliminaron ${clearedKeys.length} claves obsoletas:`,
      clearedKeys
    )
  }
}

// Ejecutar automáticamente al importar
if (typeof window !== 'undefined') {
  // Solo ejecutar una vez
  const CLEANUP_FLAG = 'enecc_cleanup_done'

  if (!sessionStorage.getItem(CLEANUP_FLAG)) {
    clearLegacyLocalStorage()
    sessionStorage.setItem(CLEANUP_FLAG, 'true')
  }
}
