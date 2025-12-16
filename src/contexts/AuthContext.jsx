import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase/config'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Registrar usuario con email y contraseña
  const register = async (email, password, name) => {
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name
        }
      }
    })

    if (authError) throw authError

    // Crear registro en la tabla users (siempre como 'client')
    // Los admins deben ser asignados manualmente en la base de datos
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        role: 'client'
      })

    if (userError) throw userError

    return authData
  }

  // Iniciar sesión con email y contraseña
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  // Iniciar sesión con Google
  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) throw error
    return data
  }

  // Cerrar sesión
  const logout = async () => {
    try {
      // Limpiar estado local primero
      setCurrentUser(null)
      setUserRole(null)

      // Limpiar caché de rol
      localStorage.removeItem('enecc_user_role')
      localStorage.removeItem('enecc_user_id')

      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Limpiar localStorage y sessionStorage
      localStorage.clear()
      sessionStorage.clear()

      console.log('Logout successful - all data cleared')
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  }

  // Restablecer contraseña
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) throw error
  }

  // Actualizar perfil del usuario
  const updateProfile = async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: updates.displayName,
        avatar_url: updates.photoURL
      }
    })

    if (error) throw error

    // Actualizar estado local
    if (data?.user) {
      setCurrentUser({
        uid: data.user.id,
        email: data.user.email,
        displayName: data.user.user_metadata?.display_name || data.user.user_metadata?.full_name || data.user.email,
        photoURL: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null
      })
    }

    return data
  }

  // Obtener rol del usuario desde la tabla users de Supabase
  const getUserRole = async (userId, userEmail) => {
    const startTime = Date.now()
    console.log('[AUTH DEBUG] Getting role for user:', userId, userEmail)

    // PRIMERO: Verificar si tenemos el rol en caché para este usuario
    const cachedUserId = localStorage.getItem('enecc_user_id')
    const cachedRole = localStorage.getItem('enecc_user_role')

    // Si el caché es para un usuario diferente, limpiarlo
    if (cachedUserId && cachedUserId !== userId) {
      console.log('[AUTH DEBUG] Cache is for different user, clearing...')
      localStorage.removeItem('enecc_user_id')
      localStorage.removeItem('enecc_user_role')
    }

    // Siempre consultar la BD para asegurar que tenemos el rol más actualizado
    // El caché solo se usa como fallback si la consulta falla
    console.log('[AUTH DEBUG] Fetching role from database...')

    try {
      // Intentar obtener el usuario de la tabla users con timeout explícito
      const queryPromise = supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      // Timeout de 10 segundos para esta consulta específica
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('getUserRole timeout')), 10000)
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])
        .catch(err => {
          console.error('[AUTH DEBUG] Query timeout or error:', err)
          return { data: null, error: err }
        })

      const duration = Date.now() - startTime
      console.log(`[AUTH DEBUG] Query completed in ${duration}ms`)

      // Si el usuario no existe en la tabla users, crearlo automáticamente como 'client'
      if (error && error.code === 'PGRST116') {
        console.log('[AUTH DEBUG] User not found in users table, creating as client...')

        try {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: userEmail,
              role: 'client'
            })

          if (insertError) {
            console.error('[AUTH DEBUG] Error creating user:', insertError)
          } else {
            console.log('[AUTH DEBUG] User created with role: client')
          }
        } catch (insertErr) {
          console.error('[AUTH DEBUG] Exception creating user:', insertErr)
        }

        // Guardar en caché
        localStorage.setItem('enecc_user_id', userId)
        localStorage.setItem('enecc_user_role', 'client')

        return 'client'
      }

      // Si hay error de timeout o cualquier otro error
      if (error) {
        console.error('[AUTH DEBUG] Error getting user role:', error.message || error)

        // Si hay caché viejo, usarlo como fallback
        if (cachedRole) {
          console.log('[AUTH DEBUG] Using stale cache as fallback:', cachedRole)
          return cachedRole
        }

        return 'client'
      }

      // Si el usuario existe, usar su rol de la base de datos
      const role = data?.role || 'client'
      console.log('[AUTH DEBUG] ✅ Role from database:', role, 'for user:', userEmail)

      // Si el rol en caché es diferente, limpiar y actualizar
      if (cachedRole && cachedRole !== role) {
        console.log('[AUTH DEBUG] ⚠️ Role changed! Old:', cachedRole, 'New:', role)
      }

      // GUARDAR EN CACHÉ para uso futuro
      localStorage.setItem('enecc_user_id', userId)
      localStorage.setItem('enecc_user_role', role)
      console.log('[AUTH DEBUG] Role cached in localStorage:', role)

      return role
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[AUTH DEBUG] Exception after ${duration}ms:`, error.message || error)

      // Si hay caché viejo, usarlo como fallback
      if (cachedRole) {
        console.log('[AUTH DEBUG] Using stale cache as fallback:', cachedRole)
        return cachedRole
      }

      return 'client'
    }
  }

  // Observar cambios en el estado de autenticación
  useEffect(() => {
    let mounted = true

    // Timeout de seguridad para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth timeout - setting loading to false')
        setLoading(false)
      }
    }, 5000) // 5 segundos máximo

    // Obtener sesión inicial
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        if (session?.user) {
          setCurrentUser({
            uid: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || session.user.email,
            photoURL: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null
          })
          const role = await getUserRole(session.user.id, session.user.email)
          if (mounted) {
            console.log('[AUTH DEBUG] Setting user role to:', role)
            setUserRole(role)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)

      if (!mounted) return

      if (session?.user) {
        setCurrentUser({
          uid: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || session.user.email,
          photoURL: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null
        })
        const role = await getUserRole(session.user.id, session.user.email)
        if (mounted) {
          console.log('[AUTH DEBUG] Setting user role to:', role)
          setUserRole(role)
        }
      } else {
        setCurrentUser(null)
        setUserRole(null)
      }

      if (mounted) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    currentUser,
    userRole,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfile,
    loading,
    isAdmin: userRole === 'admin',
    isClient: userRole === 'client'
  }

  // Debug log
  useEffect(() => {
    console.log('[AUTH DEBUG] Context value updated:', {
      userEmail: currentUser?.email,
      userRole,
      isAdmin: userRole === 'admin',
      isClient: userRole === 'client'
    })
  }, [currentUser, userRole])

  // Mostrar loading spinner mientras se verifica la sesión
  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream-50 to-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600 text-sm font-light">Cargando...</p>
          </div>
        </div>
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
