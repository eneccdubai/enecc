import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Lock, CreditCard } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const PaymentForm = ({ amount, onSuccess, onError, bookingData }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { language } = useLanguage()
  const [processing, setProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setPaymentError(null)

    try {
      // Get the CardElement
      const cardElement = elements.getElement(CardElement)

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: bookingData.user_email,
          name: bookingData.user_name
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      // En un entorno de producción, aquí deberías:
      // 1. Enviar el paymentMethod.id a tu backend
      // 2. Tu backend crearía un PaymentIntent en Stripe
      // 3. Tu backend confirmaría el pago
      // 4. Tu backend guardaría la reserva en la base de datos

      // Por ahora, simulamos un pago exitoso
      console.log('Payment Method Created:', paymentMethod)

      // Llamar al callback de éxito con el ID del método de pago
      if (onSuccess) {
        onSuccess({
          paymentMethodId: paymentMethod.id,
          status: 'succeeded'
        })
      }

      setProcessing(false)
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentError(error.message)
      setProcessing(false)

      if (onError) {
        onError(error)
      }
    }
  }

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: '#292524',
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#a8a29e'
        }
      },
      invalid: {
        color: '#dc2626',
        iconColor: '#dc2626'
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Amount */}
      <div className="bg-stone-50 border border-stone-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-stone-600">
            <Lock className="w-5 h-5" />
            <span className="text-sm font-light tracking-wide uppercase">
              {language === 'es' ? 'Pago Seguro' : 'Secure Payment'}
            </span>
          </div>
          <div>
            <div className="text-3xl font-display text-stone-900 tracking-tight">
              ${amount}
            </div>
          </div>
        </div>
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-xs font-light text-stone-500 mb-4 tracking-widest uppercase flex items-center">
          <CreditCard className="w-4 h-4 mr-2" />
          {language === 'es' ? 'Información de la Tarjeta' : 'Card Information'}
        </label>
        <div className="border-2 border-stone-200 focus-within:border-stone-900 transition-all p-4 bg-white">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Payment Error */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-sm font-light">
          {paymentError}
        </div>
      )}

      {/* Secure Payment Notice */}
      <div className="text-xs text-stone-500 font-light text-center space-y-1">
        <div className="flex items-center justify-center space-x-2">
          <Lock className="w-4 h-4" />
          <span>
            {language === 'es'
              ? 'Tu pago está protegido por Stripe'
              : 'Your payment is protected by Stripe'}
          </span>
        </div>
        <p>
          {language === 'es'
            ? 'Todos los datos de tu tarjeta están encriptados y seguros'
            : 'All your card data is encrypted and secure'}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-light py-5 transition-all disabled:cursor-not-allowed text-sm tracking-widest uppercase"
      >
        {processing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>{language === 'es' ? 'Procesando...' : 'Processing...'}</span>
          </div>
        ) : (
          <>
            {language === 'es' ? 'Pagar' : 'Pay'} ${amount}
          </>
        )}
      </button>

      {/* Test Card Info (Development Only) */}
      {import.meta.env.DEV && (
        <div className="bg-blue-50 border border-blue-200 p-4 text-xs text-blue-700 font-light space-y-1">
          <p className="font-medium mb-2">
            {language === 'es' ? '🧪 Modo de Prueba - Usa estas tarjetas:' : '🧪 Test Mode - Use these cards:'}
          </p>
          <p>✅ Éxito: 4242 4242 4242 4242</p>
          <p>❌ Error: 4000 0000 0000 9995</p>
          <p>📅 Fecha: Cualquier fecha futura</p>
          <p>🔒 CVC: Cualquier 3 dígitos</p>
        </div>
      )}
    </form>
  )
}

export default PaymentForm
