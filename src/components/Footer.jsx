import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const Footer = () => {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-cream-100 text-stone-700 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-display font-light text-stone-900 mb-6 tracking-tight">
              ENECC<span className="text-stone-600"> DUBAI</span>
            </h2>
            <p className="text-stone-500 text-sm font-light mb-8 max-w-md leading-relaxed">
              {t.footer.description}
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-stone-500 text-sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:enecc.team@gmail.com" className="hover:text-stone-900 transition-colors font-light">
                  enecc.team@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-stone-500 text-sm">
                <Phone className="w-4 h-4" />
                <a href="tel:+971523730416" className="hover:text-stone-900 transition-colors font-light">
                  +971 52 373 0416
                </a>
              </div>
              <div className="flex items-center space-x-3 text-stone-500 text-sm">
                <MapPin className="w-4 h-4" />
                <span className="font-light">Sheikh Zayed Road, Al Manara, Dubai, UAE</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-light text-stone-900 text-lg mb-6">{t.footer.quickLinks}</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('home')}
                  className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-light"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('properties')}
                  className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-light"
                >
                  {t.nav.properties}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('owner-contact')}
                  className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-light"
                >
                  {t.nav.listProperty}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-light"
                >
                  {t.nav.contact}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-200 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-stone-500 text-xs font-light tracking-wide">
              © {currentYear} {t.footer.copyright}
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-8 text-xs text-stone-500 font-light">
              <a href="#" className="hover:text-stone-900 transition-colors">
                {t.footer.privacy}
              </a>
              <a href="#" className="hover:text-stone-900 transition-colors">
                {t.footer.terms}
              </a>
              <a href="#" className="hover:text-stone-900 transition-colors">
                {t.footer.legal}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
