import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
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
  const [loaded, setLoaded] = useState(false)

  const count10 = useCountUp(10, 1600, statsVisible, 0)
  const count95 = useCountUp(95, 1800, statsVisible, 0)
  const count49 = useCountUp(4.9, 2000, statsVisible, 1)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const [slideIndex, setSlideIndex] = useState(0)
  const slides = [
    'https://grmsqbcyzgonwvbmoeex.supabase.co/storage/v1/object/public/property-images/the-residence-5/the-residence-5-01.webp',
    'https://grmsqbcyzgonwvbmoeex.supabase.co/storage/v1/object/public/property-images/act-two/act-two-01.webp',
    'https://grmsqbcyzgonwvbmoeex.supabase.co/storage/v1/object/public/property-images/2205/2205-01.webp',
    'https://grmsqbcyzgonwvbmoeex.supabase.co/storage/v1/object/public/property-images/-h2a7417-1771577738968-oxfxaq.webp',
    'https://grmsqbcyzgonwvbmoeex.supabase.co/storage/v1/object/public/property-images/413-myrtle/413-myrtle-10.webp',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex(i => (i + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
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
    <section id="home" className="relative bg-stone-900">

      {/* ── HERO FULL SCREEN ── */}
      <div className="relative h-screen min-h-[600px] overflow-hidden">

        {/* Slideshow con crossfade */}
        {slides.map((src, i) => (
          <img
            key={src}
            src={src}
            alt="Luxury Dubai Property"
            className="absolute inset-0 w-full h-full object-cover hero-ken-burns"
            style={{
              opacity: i === slideIndex ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              zIndex: i === slideIndex ? 1 : 0,
            }}
          />
        ))}

        {/* Overlay degradado */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" style={{ zIndex: 2 }} />

        {/* Contenido centrado */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-8">

          {/* Badge */}
          <div
            className="mb-6"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
            }}
          >
            <span className="text-white/60 text-xs font-light tracking-[0.35em] uppercase border-b border-white/30 pb-2">
              {language === 'es' ? 'Propiedades Premium en Dubai' : 'Premium Properties in Dubai'}
            </span>
          </div>

          {/* Heading */}
          <h1
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[1.05] tracking-tight mb-8"
            style={{
              fontWeight: 700,
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1s ease 0.5s, transform 1s ease 0.5s',
            }}
          >
            {language === 'es' ? (
              <>Propiedades<br /><span className="text-white/50">Premium en Dubai</span></>
            ) : (
              <>Premium<br /><span className="text-white/50">Properties in Dubai</span></>
            )}
          </h1>

          {/* Subtítulo */}
          <p
            className="text-white/60 text-sm md:text-base font-light max-w-xl leading-relaxed mb-10"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1s ease 0.7s, transform 1s ease 0.7s',
            }}
          >
            {language === 'es'
              ? 'Selección exclusiva de apartamentos y propiedades de lujo en las mejores ubicaciones.'
              : "Exclusive selection of luxury apartments and properties in Dubai's finest locations."}
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center gap-4"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1s ease 0.9s, transform 1s ease 0.9s',
            }}
          >
            <button
              onClick={() => document.getElementById('properties').scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center gap-3 bg-white hover:bg-stone-100 text-stone-900 px-8 py-4 font-light text-xs tracking-[0.2em] transition-all uppercase"
            >
              {language === 'es' ? 'Explorar Propiedades' : 'Explore Properties'}
              <span className="w-4 h-px bg-stone-900/50 group-hover:w-7 transition-all duration-300" />
            </button>
            <button
              onClick={() => document.getElementById('owner-contact').scrollIntoView({ behavior: 'smooth' })}
              className="group relative flex items-center gap-2 text-white/80 hover:text-white px-2 py-4 font-light text-xs tracking-[0.2em] transition-colors uppercase"
            >
              {language === 'es' ? 'Contactar' : 'Contact Us'}
              <span className="absolute bottom-2 left-0 w-0 group-hover:w-full h-px bg-white transition-all duration-300" />
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1s ease 1.4s',
          }}
        >
          <span className="text-xs font-light tracking-[0.2em] uppercase">
            {language === 'es' ? 'Scroll' : 'Scroll'}
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>

      {/* ── STATS ── */}
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

      {/* ── PARTNERS ── */}
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
