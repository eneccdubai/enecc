import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../supabase/config'

const Contact = () => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
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
      // Call Supabase Edge Function to send email and save to database
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          type: 'contact',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          message: formData.message
        }
      })

      if (error) throw error

      setStatus({
        type: 'success',
        message: t.contact.successMessage
      })
      setFormData({ name: '', email: '', phone: '', service: '', message: '' })
    } catch (error) {
      console.error('Error submitting form:', error)
      setStatus({
        type: 'error',
        message: t.contact.errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 border-b border-stone-200 pb-2 mb-8">
            <span className="text-stone-500 text-xs font-light tracking-widest uppercase">
              {t.contact.badge}
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-light text-stone-900 mb-6 tracking-tight">
            {t.contact.title}
            <span className="text-stone-600"> {t.contact.titleHighlight}</span>
          </h2>
          <p className="text-base text-stone-500 max-w-2xl mx-auto font-light">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-display font-light text-stone-900 mb-8">
              {t.contact.formTitle}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-xs font-light text-stone-500 mb-3 tracking-widest uppercase">
                  {t.contact.name} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                  placeholder={t.contact.namePlaceholder}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-light text-stone-500 mb-3 tracking-widest uppercase">
                  {t.contact.email} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                  placeholder={t.contact.emailPlaceholder}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-light text-stone-500 mb-3 tracking-widest uppercase">
                  {t.contact.phone}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                  placeholder={t.contact.phonePlaceholder}
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-xs font-light text-stone-500 mb-3 tracking-widest uppercase">
                  {t.contact.service} *
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light"
                >
                  <option value="">{t.contact.servicePlaceholder}</option>
                  <option value="rent-property">{t.contact.services.rentProperty}</option>
                  <option value="list-property">{t.contact.services.listProperty}</option>
                  <option value="property-management">{t.contact.services.propertyManagement}</option>
                  <option value="general-inquiry">{t.contact.services.generalInquiry}</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-light text-stone-500 mb-3 tracking-widest uppercase">
                  {t.contact.message} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none resize-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                  placeholder={t.contact.messagePlaceholder}
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
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-light py-4 transition-all disabled:cursor-not-allowed text-sm tracking-widest uppercase mt-8"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t.contact.sending}</span>
                  </div>
                ) : (
                  <span>{t.contact.send}</span>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="border-t border-stone-200 pt-8 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-16">
            <h3 className="text-2xl font-display font-light text-stone-900 mb-8">
              {t.contact.infoTitle}
            </h3>

            <div className="space-y-8">
              <div className="border-b border-stone-200 pb-8">
                <div className="flex items-start space-x-4">
                  <Mail className="w-5 h-5 text-stone-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-light text-stone-500 mb-2 tracking-widest uppercase">Email</h4>
                    <a
                      href="mailto:enecc.team@gmail.com"
                      className="text-base text-stone-900 hover:text-stone-600 transition-colors font-light"
                    >
                      enecc.team@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-b border-stone-200 pb-8">
                <div className="flex items-start space-x-4">
                  <Phone className="w-5 h-5 text-stone-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-light text-stone-500 mb-2 tracking-widest uppercase">{t.contact.phone}</h4>
                    <a
                      href="tel:+971523730416"
                      className="text-base text-stone-900 hover:text-stone-600 transition-colors font-light"
                    >
                      +971 52 373 0416
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-b border-stone-200 pb-8">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-5 h-5 text-stone-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-light text-stone-500 mb-2 tracking-widest uppercase">{t.contact.address}</h4>
                    <p className="text-base text-stone-900 font-light leading-relaxed">
                      Sheikh Zayed Road, Al Manara<br />
                      Dubai, UAE
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="text-sm font-light text-stone-500 mb-4 tracking-widest uppercase">{t.contact.hours}</h4>
                <p className="text-base text-stone-900 font-light">
                  {t.contact.weekdays}: 9:00 - 18:00<br />
                  {t.contact.weekend}: {t.contact.closed}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
