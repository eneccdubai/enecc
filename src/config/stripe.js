import { loadStripe } from '@stripe/stripe-js'

// Cargar Stripe con la publishable key desde las variables de entorno
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export default stripePromise
