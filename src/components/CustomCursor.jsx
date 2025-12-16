import React, { useEffect, useState } from 'react'

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState([])
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })

      // Añadir punto al rastro
      setTrail((prev) => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: Date.now() }]
        // Mantener solo los últimos 10 puntos
        return newTrail.slice(-10)
      })
    }

    const handleMouseOver = (e) => {
      // Detectar si estamos sobre un elemento interactivo
      const target = e.target
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.classList.contains('cursor-pointer') ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  // Limpiar el rastro periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail((prev) => prev.filter((point) => Date.now() - point.id < 500))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] hidden md:block">
      {/* Rastro de partículas */}
      {trail.map((point, index) => {
        const opacity = (index + 1) / trail.length
        const scale = (index + 1) / trail.length
        return (
          <div
            key={point.id}
            className="absolute w-2 h-2 bg-gold-500 rounded-full"
            style={{
              left: `${point.x}px`,
              top: `${point.y}px`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: opacity * 0.5,
              transition: 'opacity 0.3s ease-out'
            }}
          />
        )
      })}

      {/* Cursor principal */}
      <div
        className={`absolute transition-all duration-150 ease-out ${
          isHovering ? 'scale-150' : 'scale-100'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Anillo exterior */}
        <div className="w-8 h-8 border-2 border-gold-500/50 rounded-full"></div>

        {/* Punto central */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gold-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  )
}

export default CustomCursor
