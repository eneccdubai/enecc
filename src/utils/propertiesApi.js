import { supabase } from '../supabase/config'

const PROPERTY_SELECT = 'id, name, description, description_es, location, bedrooms, bathrooms, max_guests, price_per_night, images, amenities, available, show_in_landing, created_at'
const PROPERTY_SELECT_FALLBACK = 'id, name, description, description_es, location, bedrooms, bathrooms, max_guests, price_per_night, images, amenities, available, created_at'

const withTimeout = (promise, timeoutMs) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs))
])

const buildAvailableQuery = (select) =>
  supabase
    .from('properties')
    .select(select)
    .eq('available', true)
    .order('created_at', { ascending: false })

const normalizeLandingFlag = (data = []) =>
  data.map(property => ({
    ...property,
    show_in_landing: property.show_in_landing ?? true
  }))

export const isLandingColumnMissing = (error) =>
  Boolean(error?.message && error.message.toLowerCase().includes('show_in_landing'))

export const fetchAvailableProperties = async (timeoutMs = 10000) => {
  const primaryResult = await withTimeout(buildAvailableQuery(PROPERTY_SELECT), timeoutMs)

  if (primaryResult?.error) {
    if (isLandingColumnMissing(primaryResult.error)) {
      console.warn(
        '[Properties] Campo show_in_landing no existe en Supabase. Usando fallback con valor por defecto true.'
      )
      const fallbackResult = await withTimeout(buildAvailableQuery(PROPERTY_SELECT_FALLBACK), timeoutMs)
      if (fallbackResult.error) {
        throw fallbackResult.error
      }
      return normalizeLandingFlag(fallbackResult.data || [])
    }

    throw primaryResult.error
  }

  return normalizeLandingFlag(primaryResult.data || [])
}

