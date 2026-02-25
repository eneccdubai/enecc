import React, { useState, useRef, useEffect } from 'react'
import { Building2, User, Mail, Phone, MapPin, Home, DollarSign, Send, CheckCircle, AlertCircle, Volume2, VolumeX } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { supabase } from '../supabase/config'

const OwnerContact = () => {
  const { t } = useLanguage()
  const [headerRef, headerVisible] = useScrollAnimation({ once: true, threshold: 0.2 })
  const [formRef, formVisible] = useScrollAnimation({ once: true, threshold: 0.1 })
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef(null)

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(video)
    return () => observer.unobserve(video)
  }, [])

  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    phone: '',
    propertyLocation: '',
    propertyType: '',
    bedrooms: '',
    expectedRevenue: '',
    message: ''
  })

  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          type: 'owner',
          name: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          propertyLocation: formData.propertyLocation,
          propertyType: formData.propertyType,
          bedrooms: formData.bedrooms,
          expectedRevenue: formData.expectedRevenue,
          message: formData.message
        }
      })

      if (error) throw error

      setStatus({
        type: 'success',
        message: t.ownerContact.successMessage
      })
      setFormData({
        ownerName: '',
        email: '',
        phone: '',
        propertyLocation: '',
        propertyType: '',
        bedrooms: '',
        expectedRevenue: '',
        message: ''
      })
    } catch (error) {
      console.error('Error submitting owner form:', error)
      setStatus({
        type: 'error',
        message: t.ownerContact.errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const benefits = [
    {
      icon: DollarSign,
      title: t.ownerContact.benefit1Title,
      description: t.ownerContact.benefit1Desc
    },
    {
      icon: Building2,
      title: t.ownerContact.benefit2Title,
      description: t.ownerContact.benefit2Desc
    },
    {
      icon: CheckCircle,
      title: t.ownerContact.benefit3Title,
      description: t.ownerContact.benefit3Desc
    }
  ]

  return (
    <section id="owner-contact" className="relative">
      {/* Split Screen Layout: 50% Imagen | 50% Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-start gap-8 lg:gap-12">
        {/* Columna Izquierda: Video — altura fija, centrado verticalmente */}
        <div className="relative hidden lg:block bg-white self-start sticky top-0 overflow-hidden" style={{ height: 'calc(100vh - 5rem)' }}>
          <video
            ref={videoRef}
            src="/videos/owner-video.mp4"
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-contain object-right"
          />
          {/* Botón mute/unmute — centrado en la parte inferior del video */}
          <button
            onClick={toggleMute}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center bg-stone-900/70 hover:bg-stone-900/90 text-white backdrop-blur-sm transition-all rounded-full"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Columna Derecha: Contenido Centrado */}
        <div ref={headerRef} className="relative bg-white py-6 md:py-8 flex flex-col justify-center">
          <div className="w-full max-w-xl">
            {/* Section Header */}
            <div className={`mb-6 ${headerVisible ? 'opacity-100' : 'opacity-0-initial'}`}>
              <div className={`inline-flex items-center space-x-2 border-b border-stone-400 pb-2 mb-4 ${headerVisible ? 'animate-fade-in-down' : ''}`}>
                <span className="text-stone-400 text-xs font-light tracking-widest uppercase">
                  {t.ownerContact.badge}
                </span>
              </div>
              <h2 className={`text-2xl md:text-3xl lg:text-4xl font-display text-stone-900 mb-2 tracking-tight ${headerVisible ? 'animate-fade-in-up delay-100' : ''}`} style={{ fontWeight: 700 }}>
                {t.ownerContact.title}{' '}
                <span className="text-stone-500">{t.ownerContact.titleHighlight}</span>
              </h2>
              <p className={`text-sm text-stone-600 font-light leading-relaxed ${headerVisible ? 'animate-fade-in-up delay-200' : ''}`}>
                {t.ownerContact.subtitle}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              <h3 className="text-base font-display text-stone-900 mb-3" style={{ fontWeight: 700 }}>
                {t.ownerContact.whyChoose}
              </h3>

              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                const delayClass = `delay-${(index + 1) * 100}`
                return (
                  <div
                    key={index}
                    className={`border-b border-stone-200 pb-3 last:border-b-0 ${formVisible ? `animate-fade-in-left ${delayClass}` : 'opacity-0-initial'}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs font-display text-stone-900 mb-0.5" style={{ fontWeight: 700 }}>
                          {benefit.title}
                        </h4>
                        <p className="text-stone-500 text-xs font-light leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tarjeta del Formulario */}
            <div ref={formRef} className={`bg-white rounded-xl shadow-lg p-6 border border-stone-200 ${formVisible ? 'animate-fade-in-up' : 'opacity-0-initial'}`}>
              {/* Stats */}
              <div className="mb-4 pb-3 border-b border-stone-200">
                <h4 className="text-xs font-light text-stone-400 mb-3 uppercase tracking-widest">
                  {t.ownerContact.results}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-xl font-display text-stone-900" style={{ fontWeight: 700 }}>50+</div>
                    <div className="text-xs text-stone-500 font-light tracking-wide uppercase mt-0.5">
                      {t.ownerContact.properties}
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-display text-stone-900" style={{ fontWeight: 700 }}>95%</div>
                    <div className="text-xs text-stone-500 font-light tracking-wide uppercase mt-0.5">
                      {t.ownerContact.occupancy}
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-display text-stone-900" style={{ fontWeight: 700 }}>4.9★</div>
                    <div className="text-xs text-stone-500 font-light tracking-wide uppercase mt-0.5">
                      Rating
                    </div>
                  </div>
                </div>
              </div>

              {/* Título del Formulario */}
              <h3 className="text-base font-display text-stone-900 mb-4" style={{ fontWeight: 700 }}>
                {t.ownerContact.formTitle}
              </h3>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ownerName" className="block text-xs font-light text-stone-400 mb-1 tracking-widest uppercase">
                      {t.ownerContact.yourName} *
                    </label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      required
                      className="w-full px-0 py-2 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-light text-stone-400 mb-1 tracking-widest uppercase">
                      {t.contact.phone} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-0 py-2 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                      placeholder="+971 50 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-light text-stone-400 mb-1 tracking-widest uppercase">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-0 py-2 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label htmlFor="propertyLocation" className="block text-xs font-light text-stone-400 mb-1 tracking-widest uppercase">
                    {t.ownerContact.propertyLocation} *
                  </label>
                  <input
                    type="text"
                    id="propertyLocation"
                    name="propertyLocation"
                    value={formData.propertyLocation}
                    onChange={handleChange}
                    required
                    className="w-full px-0 py-2 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                    placeholder="Dubai Marina, Downtown, etc."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="propertyType" className="block text-xs font-light text-stone-400 mb-1 tracking-widest uppercase">
                      {t.ownerContact.type} *
                    </label>
                    <select
                      id="propertyType"
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      required
                      className="select-minimal w-full px-0 py-2 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                    >
                      <option value="">{t.ownerContact.select}</option>
                      <option value="apartment">{t.ownerContact.apartment}</option>
                      <option value="studio">Studio</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="villa">Villa</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bedrooms" className="block text-xs font-light text-stone-400 mb-1 tracking-widest uppercase">
                      {t.ownerContact.bedrooms} *
                    </label>
                    <select
                      id="bedrooms"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      required
                      className="select-minimal w-full px-0 py-2 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                    >
                      <option value="">{t.ownerContact.select}</option>
                      <option value="studio">Studio</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="expectedRevenue" className="block text-xs font-light text-stone-400 mb-1 tracking-widest uppercase">
                      {t.ownerContact.expectedRevenue}
                    </label>
                    <input
                      type="text"
                      id="expectedRevenue"
                      name="expectedRevenue"
                      value={formData.expectedRevenue}
                      onChange={handleChange}
                      className="w-full px-0 py-2 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                      placeholder="120,000 AED"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-light text-stone-400 mb-1 tracking-widest uppercase">
                    {t.ownerContact.tellUsMore}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-0 py-2 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none resize-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                    placeholder={t.ownerContact.tellUsPlaceholder}
                  />
                </div>

                {status.message && (
                  <div className={`flex items-center space-x-2 py-4 border-l-2 pl-4 ${
                    status.type === 'success' ? 'border-emerald-300 text-emerald-700' : 'border-red-300 text-red-700'
                  }`}>
                    {status.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="text-xs font-light">{status.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-light py-3.5 transition-all disabled:cursor-not-allowed text-sm tracking-widest uppercase mt-6 shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t.ownerContact.sending}</span>
                    </div>
                  ) : (
                    <span>{t.ownerContact.ctaButton}</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}

export default OwnerContact
