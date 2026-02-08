import { supabase } from '../supabase/config'

/**
 * Crea una sesión de pago en Stripe a través de la Edge Function
 * @param {Object} params - Parámetros de la sesión
 * @param {string|number} params.booking_id - ID de la reserva
 * @param {number} params.total_price - Precio total en dólares
 * @param {string} params.property_name - Nombre de la propiedad
 * @param {string} params.check_in - Fecha de check-in
 * @param {string} params.check_out - Fecha de check-out
 * @returns {Promise<Object>} Objeto con session_id y url
 */
export const createCheckoutSession = async ({ booking_id, total_price, property_name, check_in, check_out }) => {
  try {
    // Obtener el token de sesión actual
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('Usuario no autenticado')
    }

    // Llamar a la Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        booking_id,
        total_price,
        property_name,
        check_in,
        check_out
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) {
      console.error('Supabase function error:', error)
      throw new Error(error.message || 'Error al conectar con la función de pago')
    }

    if (!data) {
      throw new Error('La función no devolvió datos')
    }

    if (!data.success) {
      const errorMessage = data.error || data.details || 'Error al crear la sesión de pago'
      console.error('Checkout session creation failed:', data)
      throw new Error(errorMessage)
    }

    return {
      session_id: data.session_id,
      url: data.url
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}
