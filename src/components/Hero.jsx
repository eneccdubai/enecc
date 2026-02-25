import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const useCountUp = (target, duration = 1800, active = false, decimals = 0) => {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, target, duration, decimals])

  return count
}

const Hero = () => {
  const { language } = useLanguage()
  const [statsRef, statsVisible] = useScrollAnimation({ once: true, threshold: 0.2 })
  const [partnersRef, partnersVisible] = useScrollAnimation({ once: true, threshold: 0.2 })
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const count10 = useCountUp(10, 1600, statsVisible, 0)
  const count95 = useCountUp(95, 1800, statsVisible, 0)
  const count49 = useCountUp(4.9, 2000, statsVisible, 1)

  useEffect(() => {
    const handle = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 18,
        y: (e.clientY / window.innerHeight - 0.5) * 12,
      })
    }
    window.addEventListener('mousemove', handle)
    return () => window.removeEventListener('mousemove', handle)
  }, [])

  const storageBase = 'https://grmsqbcyzgonwvbmoeex.supabase.co/storage/v1/object/public/property-images/partners'
  const partners = [
    { name: 'Airbnb', src: `${storageBase}/airbnb.png` },
    { name: 'Booking.com', src: `${storageBase}/booking.png` },
    { name: 'Dubai Economy & Tourism', src: `${storageBase}/dubai-economy-tourism.png` },
    { name: 'Government of Dubai', src: `${storageBase}/government-of-dubai.png` },
    { name: 'Dubai Police', src: `${storageBase}/dubai-police.png` },
  ]

  return (
    <section id="home" className="relative overflow-hidden bg-white">
      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-32 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Columna Izquierda: Contenido */}
          <div className="space-y-6 md:space-y-8 text-left">
            <div className="opacity-0-initial animate-fade-in-up inline-flex items-center space-x-2 border-b border-stone-300 pb-2">
              <span className="text-stone-500 text-xs font-light tracking-widest uppercase">
                {language === 'es' ? 'Propiedades Premium en Dubai' : 'Premium Properties in Dubai'}
              </span>
            </div>

            <h1 className="opacity-0-initial animate-fade-in-up delay-200 font-display text-5xl sm:text-5xl md:text-6xl lg:text-7xl text-stone-900 leading-[1.1] tracking-tight" style={{ fontWeight: 700 }}>
              {language === 'es' ? 'Propiedades' : 'Premium'}
              <br />
              {language === 'es' ? 'Premium en' : 'Properties in'}
              <br />
              <span className="text-stone-500">Dubai</span>
            </h1>

            <p className="opacity-0-initial animate-fade-in-up delay-300 text-sm md:text-base text-stone-500 max-w-lg leading-relaxed font-light">
              {language === 'es'
                ? 'Descubre nuestra selección exclusiva de apartamentos y propiedades de lujo en las mejores ubicaciones de Dubai.'
                : "Discover our exclusive selection of luxury apartments and properties in Dubai's finest locations."
              }
            </p>

            <div className="opacity-0-initial animate-fade-in-up delay-400 flex flex-col sm:flex-row items-start gap-4 pt-2">
              <button
                onClick={() => document.getElementById('properties').scrollIntoView({ behavior: 'smooth' })}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 font-light text-xs tracking-[0.2em] transition-all uppercase"
              >
                {language === 'es' ? 'Explorar Propiedades' : 'Explore Properties'}
                <span className="w-4 h-px bg-white/50 group-hover:w-7 transition-all duration-300" />
              </button>
              <button
                onClick={() => document.getElementById('owner-contact').scrollIntoView({ behavior: 'smooth' })}
                className="group w-full sm:w-auto relative flex items-center justify-center gap-2 text-stone-900 px-2 py-4 font-light text-xs tracking-[0.2em] transition-colors uppercase"
              >
                {language === 'es' ? 'Contactar' : 'Contact Us'}
                <span className="absolute bottom-2 left-0 w-0 group-hover:w-full h-px bg-stone-900 transition-all duration-300" />
              </button>
            </div>
          </div>

          {/* Columna Derecha: Imagen con parallax + Ken Burns */}
          <div className="hidden lg:flex lg:items-center lg:justify-center mt-8 lg:mt-0">
            <div className="opacity-0-initial animate-clip-reveal delay-500 relative h-[500px] xl:h-[600px] w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]">
              <img
                src="/images/hero-cover.jpg"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80' }}
                alt="Luxury Dubai Interior"
                className="w-full h-full object-cover hero-ken-burns"
                style={{
                  transform: `translate(${mouse.x}px, ${mouse.y}px) scale(1.12)`,
                  transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section — contadores animados */}
      <div ref={statsRef} className="relative bg-neutral-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-0">
            {[
              { display: `${count10}+`, labelEs: 'Propiedades Gestionadas', labelEn: 'Properties Managed' },
              { display: `${count95}%`, labelEs: 'Tasa de Ocupación', labelEn: 'Occupancy Rate', border: true },
              { display: `${count49}★`, labelEs: 'Valoración Media', labelEn: 'Average Rating' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`${statsVisible ? `animate-fade-in-up delay-${i * 200}` : 'opacity-0-initial'} text-center space-y-2 py-4${stat.border ? ' sm:border-l sm:border-r border-stone-200' : ''}`}
              >
                <div className="text-5xl md:text-6xl font-display text-stone-900 tracking-tight tabular-nums" style={{ fontWeight: 700 }}>
                  {stat.display}
                </div>
                <div className="text-stone-500 text-xs font-light tracking-widest uppercase px-4">
                  {language === 'es' ? stat.labelEs : stat.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div ref={partnersRef} className="relative bg-white border-t border-stone-200 py-8 md:py-12">
        <p className={`${partnersVisible ? 'animate-fade-in-down' : 'opacity-0-initial'} text-center text-stone-400 text-sm font-light tracking-[0.25em] uppercase mb-8`}>
          {language === 'es' ? 'Nuestros Partners' : 'Our Partners'}
        </p>
        <div className={`${partnersVisible ? 'animate-fade-in-up delay-100' : 'opacity-0-initial'} max-w-4xl mx-auto px-4 sm:px-6 lg:px-8`}>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {partners.map((partner) => (
              <div key={partner.name} className="flex-shrink-0 w-28 md:w-32 h-12 md:h-14 flex items-center justify-center">
                <img src={partner.src} alt={partner.name} className="max-h-full max-w-full object-contain grayscale contrast-200 mix-blend-multiply opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
