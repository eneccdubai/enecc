/**
 * Payment Settings Utility
 *
 * Lee la configuración de pagos desde variables de entorno (.env)
 * Ya no se usan configuraciones almacenadas en la base de datos.
 */

/**
 * Obtiene la configuración de pagos desde variables de entorno
 * @returns {Object} Configuración de pagos
 */
export const getPaymentSettings = () => {
  return {
    stripe_publishable_key: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    default_price_id: import.meta.env.VITE_STRIPE_DEFAULT_PRICE_ID || '',
    success_url: import.meta.env.VITE_STRIPE_SUCCESS_URL || '/dashboard?payment=success',
    cancel_url: import.meta.env.VITE_STRIPE_CANCEL_URL || '/booking?payment=cancelled',
    payments_enabled: import.meta.env.VITE_PAYMENTS_ENABLED === 'true'
  }
}

/**
 * Verifica si los pagos están habilitados
 * @returns {boolean}
 */
export const isPaymentsEnabled = () => {
  return import.meta.env.VITE_PAYMENTS_ENABLED === 'true'
}

/**
 * Limpia el cache de configuración (ya no es necesario pero se mantiene por compatibilidad)
 */
export const clearPaymentSettingsCache = () => {
  // No hace nada, se mantiene por compatibilidad con código existente
  console.log('clearPaymentSettingsCache: No longer needed as settings come from env vars')
}

/**
 * Guarda la configuración de pagos (ya no soportado)
 * Las configuraciones ahora deben editarse en el archivo .env
 * @deprecated Esta función ya no hace nada. Edita el archivo .env directamente.
 */
export const savePaymentSettings = async () => {
  console.warn('savePaymentSettings is deprecated. Edit .env file directly.')
  return {
    success: false,
    error: 'Configuration must be set in .env file. This function is deprecated.'
  }
}
