import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const Hero = () => {
  const { language } = useLanguage()
  const [statsRef, statsVisible] = useScrollAnimation({ once: true, threshold: 0.2 })
  const [partnersRef, partnersVisible] = useScrollAnimation({ once: true, threshold: 0.2 })

  const partners = [
    {
      name: 'Booking.com',
      viewBox: '0 0 24 24',
      path: 'M24 0H0v24h24ZM8.575 6.563h2.658c2.108 0 3.473 1.15 3.473 2.898 0 1.15-.575 1.82-.91 2.108l-.287.263.335.192c.815.479 1.318 1.389 1.318 2.395 0 1.988-1.51 3.257-3.857 3.257H7.449V7.713c0-.623.503-1.126 1.126-1.15zm1.7 1.868c-.479.024-.694.264-.694.79v1.893h1.676c.958 0 1.294-.743 1.294-1.365 0-.815-.503-1.318-1.318-1.318zm-.096 4.36c-.407.071-.598.31-.598.79v2.251h1.868c.934 0 1.509-.55 1.509-1.533 0-.934-.599-1.509-1.51-1.509zm7.737 2.394c.743 0 1.341.599 1.341 1.342a1.34 1.34 0 0 1-1.341 1.341 1.355 1.355 0 0 1-1.341-1.341c0-.743.598-1.342 1.34-1.342z',
    },
    {
      name: 'Airbnb',
      viewBox: '0 0 24 24',
      path: 'M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.953l.558 1.089.08.159c2.041 4.004 3.821 7.608 5.279 10.794l.026.025.533 1.22.318.764c.243.613.294 1.222.213 1.858zm1.22-2.39c-.186-.583-.505-1.271-.9-2.094v-.03c-1.889-4.006-3.642-7.608-5.307-10.844l-.111-.163C15.317 1.461 14.468 0 12.001 0c-2.44 0-3.476 1.695-4.535 3.898l-.081.16c-1.669 3.236-3.421 6.843-5.303 10.847v.053l-.559 1.22c-.21.504-.317.768-.345.847C-.172 20.74 2.611 24 5.98 24c.027 0 .132 0 .265-.027h.372c1.75-.213 3.554-1.325 5.384-3.317 1.829 1.989 3.635 3.104 5.382 3.317h.372c.133.027.239.027.265.027 3.37.003 6.152-3.261 4.802-6.975z',
    },
    {
      name: 'Expedia',
      viewBox: '0 0 24 24',
      path: 'M19.067 0H4.933A4.94 4.94 0 0 0 0 4.933v14.134A4.932 4.932 0 0 0 4.933 24h14.134A4.932 4.932 0 0 0 24 19.067V4.933C24.01 2.213 21.797 0 19.067 0ZM7.336 19.341c0 .19-.148.337-.337.337h-2.33a.333.333 0 0 1-.337-.337v-2.33c0-.189.148-.336.337-.336H7c.19 0 .337.147.337.337zm12.121-1.486-2.308 2.298c-.169.168-.422.053-.422-.2V9.57l-6.44 6.44a.533.533 0 0 1-.421.17H8.169a.32.32 0 0 1-.338-.338v-1.697c0-.2.053-.316.169-.422l6.44-6.44H4.058c-.253 0-.369-.253-.2-.421l2.297-2.309c.137-.137.285-.232.517-.232H18.15c.854 0 1.539.686 1.539 1.54v11.478c-.01.231-.095.368-.232.516z',
    },
    {
      name: 'VRBO',
      viewBox: '0 0 200 40',
      path: 'M22.5 2h6.3l12.6 28.8L54 2h6.3L43.5 38h-4.2L22.5 2zm57.3 0h18c7.8 0 13.2 4.8 13.2 11.4 0 5.4-3.6 9.6-8.4 10.8L114 38h-7.2l-10.2-13.2h-10v13.2h-6V2zm17.4 17.4c4.8 0 7.8-2.7 7.8-6.6s-3-5.4-7.8-5.4h-11.4v12h11.4zm30-17.4h18.6c5.4 0 9 1.8 11.1 4.5 1.5 2.1 2.4 4.5 2.4 7.2 0 3.6-1.5 6.6-4.2 8.7 3.6 2.1 5.7 5.4 5.7 9.6 0 4.2-2.1 7.5-5.1 9.3-2.1 1.2-4.8 2.1-8.7 2.1h-19.8V2zm18 15.6c3.6 0 6-2.4 6-5.4 0-3.3-2.4-5.4-6-5.4h-12v10.8h12zm1.2 15.6c4.2 0 6.6-2.4 6.6-5.7 0-3.6-2.7-6-7.2-6h-12.6v11.7h13.2zm29.4-15c0-10.8 8.4-18.6 19.2-18.6s19.2 7.8 19.2 18.6-8.4 18.6-19.2 18.6-19.2-7.8-19.2-18.6zm32.4 0c0-7.8-5.7-13.2-13.2-13.2s-13.2 5.4-13.2 13.2 5.7 13.2 13.2 13.2 13.2-5.4 13.2-13.2z',
    },
    {
      name: 'Agoda',
      viewBox: '0 0 200 40',
      path: 'M16.8 8.4c-4.8 0-8.4 3.6-8.4 8.4v3.6c0 4.8 3.6 8.4 8.4 8.4h1.2c3 0 5.4-1.2 7.2-3.6v3h6V8.4h-6v3c-1.8-2.4-4.2-3-7.2-3h-1.2zm1.2 5.4c3 0 5.4 1.8 5.4 4.8v1.2c0 3-2.4 4.8-5.4 4.8s-4.8-1.8-4.8-4.2v-2.4c0-2.4 1.8-4.2 4.8-4.2zm30.6-5.4c-4.8 0-8.4 3.6-8.4 8.4v3.6c0 4.8 3.6 8.4 8.4 8.4 2.4 0 4.2-.6 6-2.4v1.8c0 3-1.8 4.8-5.4 4.8-2.4 0-4.2-1.2-4.8-3h-6c.6 4.8 4.8 8.4 10.8 8.4 6.6 0 11.4-4.2 11.4-10.2V8.4h-6v3c-1.8-2.4-3.6-3-6-3zm1.2 5.4c3 0 4.8 1.8 4.8 4.2v2.4c0 2.4-1.8 4.2-4.8 4.2s-4.8-1.8-4.8-4.2V19c0-2.4 1.8-5.2 4.8-5.2zm25.8-5.4c-6 0-10.8 4.2-10.8 10.2v2.4c0 6 4.8 10.2 10.8 10.2s10.8-4.2 10.8-10.2v-2.4c0-6-4.8-10.2-10.8-10.2zm0 5.4c3 0 4.8 2.4 4.8 4.8v2.4c0 2.4-1.8 4.8-4.8 4.8s-4.8-2.4-4.8-4.8v-2.4c0-2.4 1.8-4.8 4.8-4.8zm24-5.4c-4.8 0-8.4 3.6-8.4 8.4v3.6c0 4.8 3.6 8.4 8.4 8.4h1.2c3 0 5.4-1.2 7.2-3.6v3h6V0h-6v11.4c-1.8-2.4-4.2-3-7.2-3h-1.2zm1.2 5.4c3 0 5.4 1.8 5.4 4.8v1.2c0 3-2.4 4.8-5.4 4.8s-4.8-1.8-4.8-4.2v-2.4c0-2.4 1.8-4.2 4.8-4.2zm30.6-5.4c-4.8 0-8.4 3.6-8.4 8.4v3.6c0 4.8 3.6 8.4 8.4 8.4h1.2c3 0 5.4-1.2 7.2-3.6v3h6V8.4h-6v3c-1.8-2.4-4.2-3-7.2-3h-1.2zm1.2 5.4c3 0 5.4 1.8 5.4 4.8v1.2c0 3-2.4 4.8-5.4 4.8s-4.8-1.8-4.8-4.2v-2.4c0-2.4 1.8-4.2 4.8-4.2z',
    },
    {
      name: 'HomeAway',
      viewBox: '0 0 200 40',
      path: 'M8 2v36h6V22h16v16h6V2h-6v14H14V2H8zm56.4 6.4c-6 0-10.8 4.2-10.8 10.2v2.4c0 6 4.8 10.2 10.8 10.2s10.8-4.2 10.8-10.2v-2.4c0-6-4.8-10.2-10.8-10.2zm0 5.4c3 0 4.8 2.4 4.8 4.8v2.4c0 2.4-1.8 4.8-4.8 4.8s-4.8-2.4-4.8-4.8v-2.4c0-2.4 1.8-4.8 4.8-4.8zm24.6-5.4h-6v22.8h6V18.4c0-3 2.4-4.8 4.8-4.8 2.4 0 4.2 1.2 4.2 4.2v13.4h6V18.4c0-3 1.8-4.8 4.8-4.8 2.4 0 4.2 1.2 4.2 4.2v13.4h6V16.6c0-5.4-3.6-8.2-8.4-8.2-3 0-5.4 1.2-7.2 3.6-1.2-2.4-3.6-3.6-6.6-3.6-2.4 0-4.8 1.2-6 3v-3zm55.8 9c0-6-4.2-9.6-10.2-9.6-6 0-10.8 4.2-10.8 10.2v2.4c0 6 4.8 10.2 10.8 10.2 4.8 0 8.4-2.4 9.6-6.6h-6c-.6 1.8-1.8 2.4-3.6 2.4-3 0-4.8-1.8-4.8-4.2h15v-4.8zm-15-.6c.6-2.4 2.4-3.6 4.8-3.6s4.2 1.2 4.8 3.6h-9.6z',
    },
  ]

  return (
    <section id="home" className="relative overflow-hidden bg-white">
      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-20">
        {/* Grid Layout: Texto (izquierda) + Imagen (derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Columna Izquierda: Contenido */}
          <div className="space-y-6 md:space-y-8 text-left">
            {/* Badge - minimalista */}
            <div className="opacity-0-initial animate-fade-in-up inline-flex items-center space-x-2 border-b border-stone-300 pb-2">
              <span className="text-stone-500 text-xs font-light tracking-widest uppercase">
                {language === 'es' ? 'Propiedades Premium en Dubai' : 'Premium Properties in Dubai'}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="opacity-0-initial animate-fade-in-up delay-200 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-stone-900 leading-[1.1] tracking-tight" style={{ fontWeight: 700 }}>
              {language === 'es' ? 'Propiedades' : 'Premium'}
              <br />
              {language === 'es' ? 'Premium en' : 'Properties in'}
              <br />
              <span className="text-stone-500">Dubai</span>
            </h1>

            {/* Subheading */}
            <p className="opacity-0-initial animate-fade-in-up delay-300 text-sm md:text-base text-stone-500 max-w-lg leading-relaxed font-light">
              {language === 'es'
                ? 'Descubre nuestra selección exclusiva de apartamentos y propiedades de lujo en las mejores ubicaciones de Dubai.'
                : 'Discover our exclusive selection of luxury apartments and properties in Dubai\'s finest locations.'
              }
            </p>

            {/* CTA Buttons */}
            <div className="opacity-0-initial animate-fade-in-up delay-400 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => document.getElementById('properties').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto btn-animate bg-stone-900 hover:bg-stone-800 text-white px-8 py-3.5 font-light text-sm tracking-widest transition-all uppercase shadow-md hover:shadow-lg rounded-lg"
              >
                {language === 'es' ? 'Explorar Propiedades' : 'Explore Properties'}
              </button>
              <button
                onClick={() => document.getElementById('owner-contact').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto btn-scale bg-neutral-100 hover:bg-neutral-200 text-stone-900 px-8 py-3.5 font-light text-sm tracking-widest transition-all uppercase shadow-md hover:shadow-lg rounded-lg"
              >
                {language === 'es' ? 'Contactar' : 'Contact Us'}
              </button>
            </div>
          </div>

          {/* Columna Derecha: Imagen Vertical */}
          <div className="hidden lg:flex lg:items-center lg:justify-center mt-8 lg:mt-0">
            <div className="opacity-0-initial animate-clip-reveal delay-500 relative h-[500px] xl:h-[600px] w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80"
                alt="Luxury Dubai Interior"
                className="w-full h-full object-cover"
              />
              {/* Overlay sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="relative bg-neutral-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-0">
            {[
              { value: '50+', labelEs: 'Propiedades Gestionadas', labelEn: 'Properties Managed' },
              { value: '95%', labelEs: 'Tasa de Ocupación', labelEn: 'Occupancy Rate', border: true },
              { value: '4.9★', labelEs: 'Valoración Media', labelEn: 'Average Rating' }
            ].map((stat, i) => (
              <div
                key={stat.value}
                className={`${statsVisible ? `animate-fade-in-up delay-${i * 200}` : 'opacity-0-initial'} text-center space-y-2 py-4${stat.border ? ' sm:border-l sm:border-r border-stone-200' : ''}`}
              >
                <div className="text-5xl md:text-6xl font-display text-stone-900 tracking-tight" style={{ fontWeight: 700 }}>{stat.value}</div>
                <div className="text-stone-500 text-xs font-light tracking-widest uppercase px-4">
                  {language === 'es' ? stat.labelEs : stat.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div ref={partnersRef} className="relative bg-white border-t border-stone-200 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={`${partnersVisible ? 'animate-fade-in-down' : 'opacity-0-initial'} text-center text-stone-400 text-xs font-light tracking-[0.25em] uppercase mb-8`}>
            {language === 'es' ? 'Nuestros Partners' : 'Our Partners'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 md:gap-x-14 gap-y-6">
            {partners.map((partner, i) => (
              <div
                key={partner.name}
                className={`${partnersVisible ? `animate-fade-in-up delay-${(i + 1) * 100}` : 'opacity-0-initial'} flex items-center`}
              >
                <svg viewBox={partner.viewBox} xmlns="http://www.w3.org/2000/svg" className="h-6 md:h-8 w-auto opacity-40 hover:opacity-70 transition-opacity" fill="#44403c">
                  <path d={partner.path} />
                  {partner.path2 && <path d={partner.path2} />}
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
