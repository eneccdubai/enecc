import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../supabase/config'

const exampleProperties = [
  {
    name: 'Luxury Penthouse - Burj Khalifa',
    description: 'Espectacular penthouse con vista panorámica al Burj Khalifa. Acabados de lujo, cocina gourmet completamente equipada, y acceso a todas las amenidades del edificio. Perfecto para una estadía inolvidable en el corazón de Dubai.',
    location: 'Downtown Dubai, Burj Khalifa District',
    bedrooms: 3,
    bathrooms: 3,
    max_guests: 6,
    price_per_night: 850.00,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811'],
    amenities: ['WiFi de alta velocidad', 'Piscina infinita', 'Gimnasio privado', 'Concierge 24/7', 'Estacionamiento', 'Terraza privada'],
    available: true,
    show_in_landing: true
  },
  {
    name: 'Beachfront Villa - Palm Jumeirah',
    description: 'Villa exclusiva frente al mar en la icónica Palm Jumeirah. Playa privada, piscina infinity con vista al mar, y diseño contemporáneo de lujo. Experiencia única de vida frente al golfo Pérsico.',
    location: 'Palm Jumeirah',
    bedrooms: 5,
    bathrooms: 4,
    max_guests: 10,
    price_per_night: 1500.00,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1613977257363-707ba9348227'],
    amenities: ['Playa privada', 'Piscina infinita', 'WiFi', 'Jacuzzi', 'Chef privado disponible', 'Servicio de limpieza', 'Seguridad 24/7'],
    available: true,
    show_in_landing: true
  },
  {
    name: 'Modern Apartment - Dubai Marina',
    description: 'Apartamento moderno en el corazón de Dubai Marina. Vistas impresionantes a los yates y rascacielos. Walking distance a restaurantes, tiendas y vida nocturna. Perfecto para profesionales y familias.',
    location: 'Dubai Marina',
    bedrooms: 2,
    bathrooms: 2,
    max_guests: 4,
    price_per_night: 450.00,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
    amenities: ['WiFi', 'Piscina comunitaria', 'Gimnasio', 'Aire acondicionado', 'Balcón con vista', 'Estacionamiento'],
    available: true,
    show_in_landing: true
  },
  {
    name: 'Desert Oasis Villa',
    description: 'Villa privada tipo resort en el desierto de Dubai. Combina lujo moderno con arquitectura árabe tradicional. Perfecta para quienes buscan privacidad y una experiencia auténtica del desierto.',
    location: 'Arabian Ranches',
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 8,
    price_per_night: 700.00,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'],
    amenities: ['Piscina privada', 'Jardín amplio', 'BBQ área', 'WiFi', 'Campo de golf cercano', 'Estacionamiento para 3 autos'],
    available: true,
    show_in_landing: true
  },
  {
    name: 'Sky Suite - Business Bay',
    description: 'Suite de lujo en torre moderna de Business Bay. Vista panorámica del Dubai Canal y skyline. Ideal para viajes de negocios o estadías cortas con acceso rápido al centro financiero.',
    location: 'Business Bay',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    price_per_night: 350.00,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', 'https://images.unsplash.com/photo-1574643156929-51fa098b0394'],
    amenities: ['WiFi de alta velocidad', 'Escritorio ejecutivo', 'Gimnasio', 'Piscina', 'Servicio de limpieza diario', 'Metro a 5 min'],
    available: true,
    show_in_landing: true
  }
]

const testUsers = {
  admin: {
    email: 'admin@enecc.com',
    password: 'Admin123!'
  },
  client: {
    email: 'cliente@test.com',
    password: 'Cliente123!'
  }
}

const DatabaseSetup = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const handleInitDatabase = async () => {
    setLoading(true)
    setStatus(null)

    try {
      // Insertar propiedades de ejemplo
      const { error } = await supabase
        .from('properties')
        .insert(exampleProperties)

      if (error) {
        setStatus({ type: 'error', message: `Error: ${error.message}` })
      } else {
        setStatus({
          type: 'success',
          message: `✓ Se insertaron ${exampleProperties.length} propiedades exitosamente.`
        })
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Database className="w-16 h-16 mx-auto mb-6 text-stone-600" />
          <h1 className="text-6xl md:text-7xl font-display font-light text-stone-900 mb-4 tracking-tight">
            Database Setup
          </h1>
          <p className="text-stone-500 text-sm font-light tracking-wide">
            Inicializa la base de datos con propiedades de ejemplo
          </p>
        </div>

        {/* Initialize Button */}
        <div className="mb-12 text-center">
          <button
            onClick={handleInitDatabase}
            disabled={loading}
            className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-light py-4 px-12 transition-all disabled:cursor-not-allowed text-sm tracking-widest uppercase"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Inicializando...</span>
              </div>
            ) : (
              'Inicializar Base de Datos'
            )}
          </button>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`mb-12 flex items-start space-x-2 py-4 border-l-2 pl-4 ${
            status.type === 'success'
              ? 'border-emerald-300 text-emerald-700'
              : 'border-red-300 text-red-700'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-xs font-light leading-relaxed">{status.message}</span>
          </div>
        )}

        {/* Test Users Information */}
        <div className="border-t border-stone-200 pt-12">
          <div className="flex items-center mb-8">
            <Users className="w-6 h-6 mr-3 text-stone-600" />
            <h2 className="text-3xl font-display font-light text-stone-900 tracking-tight">
              Usuarios de Prueba
            </h2>
          </div>

          <div className="space-y-6">
            {/* Admin User */}
            <div className="bg-white/50 border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display text-stone-900 tracking-tight">
                  Administrador
                </h3>
                <span className="text-xs tracking-widest uppercase text-stone-500 bg-stone-100 px-3 py-1">
                  ADMIN
                </span>
              </div>
              <div className="space-y-2 text-sm font-light">
                <p className="text-stone-600">
                  <span className="text-stone-400 mr-2">Email:</span>
                  <span className="font-mono">{testUsers.admin.email}</span>
                </p>
                <p className="text-stone-600">
                  <span className="text-stone-400 mr-2">Password:</span>
                  <span className="font-mono">{testUsers.admin.password}</span>
                </p>
              </div>
              <p className="mt-4 text-xs text-stone-500 font-light leading-relaxed">
                El administrador puede agregar, editar y eliminar propiedades. También puede ver todas las reservaciones.
              </p>
            </div>

            {/* Client User */}
            <div className="bg-white/50 border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display text-stone-900 tracking-tight">
                  Cliente
                </h3>
                <span className="text-xs tracking-widest uppercase text-stone-500 bg-stone-100 px-3 py-1">
                  CLIENT
                </span>
              </div>
              <div className="space-y-2 text-sm font-light">
                <p className="text-stone-600">
                  <span className="text-stone-400 mr-2">Email:</span>
                  <span className="font-mono">{testUsers.client.email}</span>
                </p>
                <p className="text-stone-600">
                  <span className="text-stone-400 mr-2">Password:</span>
                  <span className="font-mono">{testUsers.client.password}</span>
                </p>
              </div>
              <p className="mt-4 text-xs text-stone-500 font-light leading-relaxed">
                El cliente puede ver propiedades disponibles, hacer reservaciones y ver sus propias reservaciones.
              </p>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-900 font-light leading-relaxed">
              <strong className="font-normal">Importante:</strong> Estos usuarios deben ser creados manualmente
              usando el formulario de registro. Usa las credenciales mostradas arriba para crear las cuentas.
              Para el usuario administrador, necesitarás actualizar manualmente su rol en Supabase a 'admin'
              después de registrarse (Table Editor → users → editar rol).
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-12 pt-12 border-t border-stone-200">
          <button
            onClick={() => navigate('/')}
            className="text-stone-400 hover:text-stone-700 text-xs font-light tracking-wider transition-colors uppercase"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default DatabaseSetup
