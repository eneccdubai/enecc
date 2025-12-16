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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY no está configurada')
    }

    // Inicializar Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Inicializar cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parsear el body de la petición
    const { session_id, booking_id } = await req.json()

    if (!session_id || !booking_id) {
      throw new Error('Faltan parámetros requeridos: session_id y booking_id')
    }

    // Obtener la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id)

    console.log('Session status:', session.payment_status)
    console.log('Session metadata:', session.metadata)

    // Verificar que el booking_id coincida
    if (session.metadata.booking_id !== booking_id.toString()) {
      throw new Error('El booking_id no coincide con la sesión')
    }

    // Actualizar el estado del pago según el estado de la sesión
    let payment_status = 'pending'
    let booking_status = 'pending_payment'

    if (session.payment_status === 'paid') {
      payment_status = 'paid'
      booking_status = 'confirmed'
    } else if (session.payment_status === 'unpaid') {
      payment_status = 'pending'
      booking_status = 'pending_payment'
    }

    // Actualizar la reserva
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status,
        status: booking_status,
        payment_date: session.payment_status === 'paid' ? new Date().toISOString() : null,
        payment_amount: session.payment_status === 'paid' ? session.amount_total / 100 : null,
      })
      .eq('id', booking_id)
      .select()
      .single()

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        success: true,
        payment_status,
        booking_status,
        session_status: session.payment_status,
        booking: updatedBooking,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error al verificar el pago',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
