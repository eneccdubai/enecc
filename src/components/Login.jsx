import React, { useState, useEffect } from 'react'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { isValidEmail, checkRateLimit, sanitizeString } from '../utils/security'

const Login = () => {
  const { language } = useLanguage()
  const { login, loginWithGoogle, currentUser } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirigir si ya está logueado
  useEffect(() => {
    if (currentUser) {
      navigate('/admin')
    }
  }, [currentUser, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validar email
    if (!isValidEmail(formData.email)) {
      setError(language === 'es'
        ? 'Email inválido'
        : 'Invalid email'
      )
      setIsLoading(false)
      return
    }

    // Rate limiting - 5 intentos por minuto
    const rateLimitKey = `login_${formData.email}`
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60000)

    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000)
      setError(language === 'es'
        ? `Demasiados intentos. Intenta de nuevo en ${waitMinutes} minuto(s).`
        : `Too many attempts. Try again in ${waitMinutes} minute(s).`
      )
      setIsLoading(false)
      return
    }

    try {
      await login(formData.email, formData.password)
      setSuccess(language === 'es' ? '¡Inicio de sesión exitoso!' : 'Login successful!')

      setTimeout(() => {
        navigate('/admin')
      }, 1000)

    } catch (err) {
      console.error('Login error:', err)

      let errorMessage = language === 'es'
        ? 'Error al iniciar sesión. Verifica tus credenciales.'
        : 'Login error. Please check your credentials.'

      if (err.code === 'auth/user-not-found') {
        errorMessage = language === 'es'
          ? 'No existe una cuenta con este correo.'
          : 'No account found with this email.'
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = language === 'es'
          ? 'Contraseña incorrecta.'
          : 'Incorrect password.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = language === 'es'
          ? 'Correo electrónico inválido.'
          : 'Invalid email address.'
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = language === 'es'
          ? 'Demasiados intentos. Intenta más tarde.'
          : 'Too many attempts. Try again later.'
      }

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await loginWithGoogle()
      setSuccess(language === 'es' ? '¡Inicio de sesión exitoso!' : 'Login successful!')

      setTimeout(() => {
        navigate('/admin')
      }, 1000)

    } catch (err) {
      console.error('Google login error:', err)

      let errorMessage = language === 'es'
        ? 'Error al iniciar sesión con Google.'
        : 'Error signing in with Google.'

      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = language === 'es'
          ? 'Inicio de sesión cancelado.'
          : 'Sign in cancelled.'
      }

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-7xl font-display font-light text-stone-900 mb-4 tracking-tight">
            Admin
          </h2>
          <p className="text-stone-500 text-sm font-light tracking-wide">
            {language === 'es'
              ? 'Acceso exclusivo para administradores'
              : 'Administrator access only'
            }
          </p>
        </div>

        {/* Form Container */}
        <div className="space-y-8">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 border-b border-stone-200 text-stone-700 px-4 py-4 font-light hover:border-stone-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{language === 'es' ? 'Continuar con Google' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-stone-400 font-light tracking-widest">
                {language === 'es' ? 'O CONTINÚA CON EMAIL' : 'OR CONTINUE WITH EMAIL'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-light text-stone-500 mb-3 tracking-widest uppercase">
                {language === 'es' ? 'Correo Electrónico' : 'Email Address'}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-light text-stone-500 mb-3 tracking-widest uppercase">
                {language === 'es' ? 'Contraseña' : 'Password'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-0 py-3 border-0 border-b border-stone-200 focus:border-stone-900 transition-all outline-none bg-transparent text-stone-900 text-sm font-light placeholder:text-stone-300"
                placeholder="••••••••"
              />
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                className="text-xs text-stone-500 hover:text-stone-900 font-light tracking-wide transition-colors underline underline-offset-4"
              >
                {language === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot password?'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start space-x-2 py-4 border-l-2 border-red-300 pl-4 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-light leading-relaxed">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start space-x-2 py-4 border-l-2 border-emerald-300 pl-4 text-emerald-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-light leading-relaxed">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-light py-4 rounded-lg shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed text-sm tracking-widest uppercase mt-10"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{language === 'es' ? 'Iniciando...' : 'Signing in...'}</span>
                </div>
              ) : (
                <span>{language === 'es' ? 'Iniciar Sesión' : 'Sign In'}</span>
              )}
            </button>
          </form>

        </div>

        {/* Back to home */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="text-stone-400 hover:text-stone-700 text-xs font-light tracking-wider transition-colors uppercase"
          >
            &larr; {language === 'es' ? 'Volver al inicio' : 'Back to home'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
