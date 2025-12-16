/**
 * Validación de Variables de Entorno
 * Verifica que todas las variables necesarias estén configuradas
 */

/**
 * Lista de variables de entorno requeridas
 */
const REQUIRED_ENV_VARS = {
  // Supabase (requeridas solo en modo supabase)
  VITE_SUPABASE_URL: {
    required: () => import.meta.env.VITE_DATA_SOURCE === 'supabase',
    description: 'URL de tu proyecto de Supabase'
  },
  VITE_SUPABASE_ANON_KEY: {
    required: () => import.meta.env.VITE_DATA_SOURCE === 'supabase',
    description: 'Clave anónima de Supabase'
  },

  // Stripe (requerida siempre para pagos)
  VITE_STRIPE_PUBLISHABLE_KEY: {
    required: true,
    description: 'Clave pública de Stripe',
    validate: (value) => {
      if (!value.startsWith('pk_')) {
        return 'La clave de Stripe debe empezar con "pk_"'
      }
      return null
    }
  },

  // Admin (requerida siempre)
  VITE_ADMIN_EMAILS: {
    required: true,
    description: 'Lista de emails de administradores',
    validate: (value) => {
      const emails = value.split(',').map(e => e.trim()).filter(Boolean)
      if (emails.length === 0) {
        return 'Debe haber al menos un email de administrador'
      }
      // Validar formato de emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const invalidEmails = emails.filter(email => !emailRegex.test(email))
      if (invalidEmails.length > 0) {
        return `Emails inválidos: ${invalidEmails.join(', ')}`
      }
      return null
    }
  },

  // Data Source (opcional, tiene default)
  VITE_DATA_SOURCE: {
    required: false,
    description: 'Fuente de datos (local o supabase)',
    validate: (value) => {
      if (value && !['local', 'supabase'].includes(value)) {
        return 'VITE_DATA_SOURCE debe ser "local" o "supabase"'
      }
      return null
    }
  }
}

/**
 * Valida todas las variables de entorno
 * @returns {Object} Resultado de la validación
 */
export const validateEnvironmentVariables = () => {
  const errors = []
  const warnings = []
  const info = []

  // Verificar cada variable
  Object.entries(REQUIRED_ENV_VARS).forEach(([varName, config]) => {
    const value = import.meta.env[varName]
    const isRequired = typeof config.required === 'function'
      ? config.required()
      : config.required

    // Variable no configurada
    if (!value) {
      if (isRequired) {
        errors.push({
          variable: varName,
          message: `Variable requerida no configurada: ${config.description}`,
          fix: `Agrega ${varName}=tu_valor al archivo .env`
        })
      } else {
        warnings.push({
          variable: varName,
          message: `Variable opcional no configurada: ${config.description}`,
          fix: `Agrega ${varName}=tu_valor al archivo .env (opcional)`
        })
      }
      return
    }

    // Validar formato si hay validador
    if (config.validate) {
      const validationError = config.validate(value)
      if (validationError) {
        errors.push({
          variable: varName,
          message: validationError,
          fix: `Corrige el valor de ${varName} en el archivo .env`
        })
      }
    }

    // Variable configurada correctamente
    info.push({
      variable: varName,
      message: `✓ ${config.description}`
    })
  })

  // Verificar que la clave de Stripe no sea el placeholder
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (stripeKey && stripeKey.includes('your_publishable_key_here')) {
    warnings.push({
      variable: 'VITE_STRIPE_PUBLISHABLE_KEY',
      message: 'Estás usando el placeholder de Stripe. Los pagos no funcionarán.',
      fix: 'Obtén tu clave real en https://dashboard.stripe.com/test/apikeys'
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    dataSource: import.meta.env.VITE_DATA_SOURCE || 'local',
    environment: import.meta.env.MODE
  }
}

/**
 * Muestra el resultado de la validación en la consola
 */
export const logEnvironmentValidation = () => {
  const result = validateEnvironmentVariables()

  console.group('🔧 Validación de Variables de Entorno')

  // Mostrar información del entorno
  console.log(
    `%c📊 Entorno: ${result.environment}`,
    'color: #3b82f6; font-weight: bold;'
  )
  console.log(
    `%c🗄️ Fuente de datos: ${result.dataSource}`,
    'color: #3b82f6; font-weight: bold;'
  )

  // Mostrar errores
  if (result.errors.length > 0) {
    console.group(`%c❌ Errores (${result.errors.length})`, 'color: #dc2626; font-weight: bold;')
    result.errors.forEach(error => {
      console.error(`${error.variable}: ${error.message}`)
      console.log(`  💡 Fix: ${error.fix}`)
    })
    console.groupEnd()
  }

  // Mostrar warnings
  if (result.warnings.length > 0) {
    console.group(`%c⚠️ Advertencias (${result.warnings.length})`, 'color: #f59e0b; font-weight: bold;')
    result.warnings.forEach(warning => {
      console.warn(`${warning.variable}: ${warning.message}`)
      console.log(`  💡 Fix: ${warning.fix}`)
    })
    console.groupEnd()
  }

  // Mostrar info de variables configuradas
  if (result.info.length > 0 && import.meta.env.DEV) {
    console.group(`%c✅ Variables configuradas (${result.info.length})`, 'color: #22c55e; font-weight: bold;')
    result.info.forEach(item => {
      console.log(item.message)
    })
    console.groupEnd()
  }

  // Resumen final
  if (result.valid) {
    console.log(
      '%c✨ Todas las variables requeridas están configuradas correctamente',
      'color: #22c55e; font-weight: bold; font-size: 14px;'
    )
  } else {
    console.error(
      '%c⛔ Hay variables de entorno faltantes o incorrectas. Revisa los errores arriba.',
      'color: #dc2626; font-weight: bold; font-size: 14px;'
    )
    console.log(
      '%c📖 Consulta ENV_VARIABLES.md para más información',
      'color: #3b82f6;'
    )
  }

  console.groupEnd()

  return result
}

/**
 * Obtiene información de configuración para debugging
 */
export const getEnvironmentInfo = () => {
  return {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    dataSource: import.meta.env.VITE_DATA_SOURCE || 'local',
    hasSupabase: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    hasStripe: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    hasAdminEmails: !!import.meta.env.VITE_ADMIN_EMAILS,
    adminEmailsCount: import.meta.env.VITE_ADMIN_EMAILS
      ? import.meta.env.VITE_ADMIN_EMAILS.split(',').filter(Boolean).length
      : 0
  }
}

// Ejecutar validación automáticamente en desarrollo
if (import.meta.env.DEV) {
  logEnvironmentValidation()
}
