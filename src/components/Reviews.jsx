import React, { useState, useEffect, memo } from 'react'
import { Star } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../supabase/config'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const Reviews = () => {
  const { language } = useLanguage()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [sectionRef, sectionVisible] = useScrollAnimation({ once: true, threshold: 0.1 })

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setReviews(data || [])
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(
        language === 'es' ? 'es-ES' : 'en-US',
        { year: 'numeric', month: 'long' }
      )
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
        </div>
      </section>
    )
  }

  if (reviews.length === 0) return null

  const delayClasses = ['', 'delay-200', 'delay-400']

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`${sectionVisible ? 'animate-fade-in-up' : 'opacity-0-initial'} text-center mb-12 md:mb-16`}>
          <p className="text-stone-400 text-xs font-light tracking-widest uppercase mb-4">
            {language === 'es' ? 'Testimonios' : 'Testimonials'}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display text-stone-900 tracking-tight" style={{ fontWeight: 700 }}>
            {language === 'es' ? 'Lo que dicen nuestros clientes' : 'What Our Clients Say'}
          </h2>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className={`${sectionVisible ? `animate-fade-in-up ${delayClasses[index % 3]}` : 'opacity-0-initial'} bg-white border border-stone-200 p-6 md:p-8 hover:border-stone-300 transition-all`}
            >
              {/* Stars */}
              <div className="flex items-center space-x-1 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'fill-stone-900 text-stone-900'
                        : 'text-stone-200'
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-stone-600 text-sm font-light leading-relaxed mb-6">
                "{review.comment}"
              </p>

              {/* Author */}
              <div className="border-t border-stone-100 pt-4">
                <p className="text-stone-900 text-sm font-medium tracking-wide">
                  {review.reviewer_name}
                </p>
                <p className="text-stone-400 text-xs font-light mt-1">
                  {formatDate(review.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default memo(Reviews)
