import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener variables de entorno
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')

    // Validar variables de entorno requeridas con mensajes claros
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL no está configurada en las variables de entorno de la Edge Function')
    }

    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno de la Edge Function')
    }

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY no está configurada en las variables de entorno de la Edge Function')
    }

    // Inicializar Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Inicializar cliente de Supabase con service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener el token de autorización del header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No se proporcionó token de autorización')
    }

    // Verificar que el usuario esté autenticado
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Parsear el body de la petición
    const { booking_id, total_price, property_name, check_in, check_out } = await req.json()

    if (!booking_id) {
      throw new Error('Faltan parámetros requeridos: booking_id')
    }

    if (total_price === undefined || total_price === null) {
      throw new Error('Faltan parámetros requeridos: total_price')
    }

    // Validar que total_price sea un número válido y positivo
    const priceNum = Number(total_price)
    if (isNaN(priceNum) || priceNum <= 0) {
      throw new Error(`total_price debe ser un número positivo. Valor recibido: ${total_price}`)
    }

    // Obtener configuración de pagos desde variables de entorno
    const paymentsEnabled = Deno.env.get('PAYMENTS_ENABLED') === 'true'
    const defaultPriceId = Deno.env.get('STRIPE_DEFAULT_PRICE_ID') || ''
    const successUrl = Deno.env.get('STRIPE_SUCCESS_URL') || '/my-bookings?payment=success'
    const cancelUrl = Deno.env.get('STRIPE_CANCEL_URL') || '/booking?payment=cancelled'

    if (!paymentsEnabled) {
      throw new Error('Los pagos no están habilitados')
    }

    // Validar que las URLs estén configuradas
    if (!successUrl || !cancelUrl) {
      throw new Error('Las URLs de éxito y cancelación deben estar configuradas')
    }

    // Construir las URLs completas con parámetros
    const baseUrl = req.headers.get('origin') || 'http://localhost:5173'
    const successUrlFull = new URL(successUrl, baseUrl)
    successUrlFull.searchParams.set('booking_id', booking_id)
    successUrlFull.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}')

    const cancelUrlFull = new URL(cancelUrl, baseUrl)
    cancelUrlFull.searchParams.set('booking_id', booking_id)

    // Crear sesión de Checkout en Stripe
    // Construir line_items correctamente: usar price_id si existe, sino usar price_data
    const lineItem = {
      quantity: 1,
    }

    if (defaultPriceId && defaultPriceId.trim() !== '') {
      // Si hay un price_id predefinido, usarlo
      lineItem.price = defaultPriceId
    } else {
      // Si no, crear price_data dinámicamente
      lineItem.price_data = {
        currency: 'usd',
        product_data: {
          name: property_name || 'Reserva de propiedad',
          description: `Check-in: ${check_in || 'N/A'}, Check-out: ${check_out || 'N/A'}`,
        },
        unit_amount: Math.round(priceNum * 100), // Stripe usa centavos
      }
    }

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: 'payment',
      success_url: successUrlFull.toString(),
      cancel_url: cancelUrlFull.toString(),
      metadata: {
        booking_id: booking_id.toString(),
        user_id: user.id,
        user_email: user.email || '',
      },
      customer_email: user.email || undefined,
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Actualizar la reserva con el session_id de Stripe
    await supabase
      .from('bookings')
      .update({
        stripe_session_id: session.id,
        payment_status: 'pending',
      })
      .eq('id', booking_id)

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    const errorMessage = error.message || 'Error al crear la sesión de pago'
    const errorDetails = error.details || error.type || ''

    // Log más detallado para debugging
    console.error('Error details:', {
      message: errorMessage,
      details: errorDetails,
      stack: error.stack
    })

    // Devolver 200 con success:false para que supabase.functions.invoke()
    // pueda leer el mensaje de error (non-2xx pierde el body en el SDK)
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: errorDetails,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
})
