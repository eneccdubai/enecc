import React, { useEffect, useState, useMemo } from 'react'

const ParallaxBackground = () => {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Genera partículas aleatorias una sola vez con useMemo
  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1.5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: Math.random() * 8 + 12
    })), []
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Partículas flotantes como luces pequeñas con más brillo */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-gold-400/60 dark:bg-gold-400/40 blur-lg"
          style={{
            width: `${particle.size * 3}px`,
            height: `${particle.size * 3}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            boxShadow: '0 0 30px 10px rgba(212, 175, 55, 0.6)'
          }}
        />
      ))}

      {/* Luces grandes difuminadas - Efecto glow MUY VISIBLE con movimiento complejo */}
      <div
        className="absolute top-1/4 right-1/4 w-80 h-80 bg-gold-500/40 dark:bg-gold-500/30 rounded-full blur-3xl animate-float-complex animate-pulse-glow"
        style={{
          boxShadow: '0 0 150px 60px rgba(212, 175, 55, 0.35)',
          animationDelay: '0s, 0s'
        }}
      ></div>
      <div
        className="absolute top-1/2 left-1/5 w-72 h-72 bg-gold-400/35 dark:bg-gold-400/25 rounded-full blur-3xl animate-float-complex animate-pulse-glow"
        style={{
          animationDelay: '3s, 1s',
          boxShadow: '0 0 120px 50px rgba(212, 175, 55, 0.3)'
        }}
      ></div>
      <div
        className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-gold-500/38 dark:bg-gold-500/28 rounded-full blur-3xl animate-float-complex animate-pulse-glow"
        style={{
          animationDelay: '6s, 2s',
          boxShadow: '0 0 130px 55px rgba(212, 175, 55, 0.32)'
        }}
      ></div>

      {/* Luz adicional en el centro-izquierda */}
      <div
        className="absolute top-2/3 left-1/3 w-56 h-56 bg-gold-400/30 dark:bg-gold-400/20 rounded-full blur-3xl animate-float-complex animate-pulse-glow"
        style={{
          animationDelay: '4.5s, 1.5s',
          boxShadow: '0 0 100px 40px rgba(212, 175, 55, 0.25)'
        }}
      ></div>

      {/* Luz central superior */}
      <div
        className="absolute top-10 left-1/2 w-52 h-52 bg-gold-500/32 dark:bg-gold-500/22 rounded-full blur-3xl animate-float-complex animate-pulse-glow"
        style={{
          animationDelay: '1.5s, 0.5s',
          boxShadow: '0 0 110px 45px rgba(212, 175, 55, 0.27)'
        }}
      ></div>

      {/* Líneas decorativas como rayos de luz más brillantes */}
      <div
        className="absolute top-1/3 left-0 w-80 h-px bg-gradient-to-r from-transparent via-gold-400/50 dark:via-gold-400/40 to-transparent blur-sm"
        style={{ boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}
      ></div>
      <div
        className="absolute bottom-1/3 right-0 w-80 h-px bg-gradient-to-l from-transparent via-gold-400/50 dark:via-gold-400/40 to-transparent blur-sm"
        style={{ boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}
      ></div>
    </div>
  )
}

export default ParallaxBackground
