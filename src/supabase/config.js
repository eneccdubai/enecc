import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
// IMPORTANTE: Estas variables deben estar en tu archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Falta configurar las variables de entorno de Supabase.\n' +
    'Crea un archivo .env en la raíz del proyecto con:\n' +
    'VITE_SUPABASE_URL=tu_project_url\n' +
    'VITE_SUPABASE_ANON_KEY=tu_anon_key'
  )
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  }
})

// Exportar funciones de autenticación para facilitar su uso
export const auth = supabase.auth

export default supabase
