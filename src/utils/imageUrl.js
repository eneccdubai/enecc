/**
 * Generates optimized Supabase Storage image URLs using Image Transformations.
 * Falls through for non-Supabase URLs (e.g. Unsplash).
 *
 * Supabase Pro includes Image Transformations:
 * replaces /object/public/ with /render/image/public/ and appends resize params.
 */

const SUPABASE_OBJECT_PATH = '/storage/v1/object/public/'
const SUPABASE_RENDER_PATH = '/storage/v1/render/image/public/'

export const getOptimizedImageUrl = (url, { width, height, quality = 75, resize = 'cover' } = {}) => {
  if (!url || typeof url !== 'string') return url

  // Only transform Supabase Storage URLs
  if (!url.includes(SUPABASE_OBJECT_PATH)) return url

  const transformedUrl = url.replace(SUPABASE_OBJECT_PATH, SUPABASE_RENDER_PATH)

  const params = new URLSearchParams()
  if (width) params.set('width', String(width))
  if (height) params.set('height', String(height))
  if (quality) params.set('quality', String(quality))
  if (resize) params.set('resize', resize)

  const queryString = params.toString()
  return queryString ? `${transformedUrl}?${queryString}` : transformedUrl
}
