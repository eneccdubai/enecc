# Instrucciones del Proyecto ENECC Dubai

## Stack Tecnológico
- React 18 + Vite
- React Router v6
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Stripe para pagos
- localStorage para desarrollo local

## Estructura del Proyecto

### Base de Datos
- Modo dual: `local` (localStorage) o `supabase` (base de datos real)
- Controlado por `VITE_DATA_SOURCE` en `.env`
- Todas las operaciones deben funcionar en ambos modos

### Configuración
- **TODAS** las variables sensibles deben estar en `.env`
- Nunca hardcodear: emails de admin, claves API, URLs, configuraciones
- Usar `import.meta.env.VITE_*` para acceder a variables

### Estilo de Código
- Componentes funcionales con hooks
- Diseño minimalista y elegante (stone colors, font-light)
- No usar emojis a menos que el usuario lo pida explícitamente
- Mantener estructura de archivos limpia

### Componentes
- Lazy loading para componentes pesados
- Memoización cuando sea apropiado
- Usar Lucide React para iconos
- Mobile-first responsive design

## Reglas Importantes

1. **No crear archivos innecesarios**
   - Evitar archivos `.md` extensos
   - No crear documentación a menos que se solicite
   - Mantener minimalista la estructura

2. **Variables de Entorno**
   - Siempre usar `.env` para configuraciones
   - Validar variables con `validateEnv.js`
   - Documentar solo lo esencial en `.env.example`

3. **Base de Datos**
   - Usar MCP de Supabase para migraciones
   - No mantener archivos `.sql` después de aplicar migraciones
   - Funciones deben funcionar tanto en modo local como Supabase

4. **Seguridad**
   - Sanitizar inputs del usuario
   - Validar datos antes de guardar
   - Usar CSRF tokens en formularios admin
   - RLS habilitado en todas las tablas

5. **Pagos con Stripe**
   - Siempre calcular precios en el backend (o simular en local)
   - Nunca confiar en precios del frontend
   - Guardar `payment_method_id` en bookings
   - Validar estados de pago

## Convenciones

### Nombres de Archivos
- Componentes: PascalCase (ej: `AdminDashboard.jsx`)
- Utils: camelCase (ej: `adminConfig.js`)
- Configs: camelCase (ej: `dataSource.js`)

### Imports
```javascript
// Orden de imports:
// 1. React y librerías externas
// 2. Componentes
// 3. Contexts
// 4. Utils
// 5. Styles
```

### Funciones
- Nombres descriptivos en inglés
- Comentarios JSDoc para funciones complejas
- Preferir arrow functions
- Validación temprana (early return)

## Features Principales

1. **Panel Admin** (`/admin`)
   - Tab de Propiedades: CRUD completo
   - Tab de Clientes: Ver clientes y sus reservas
   - Tab de Reservas: Gestionar todas las reservas

2. **Sistema de Reservas**
   - Selección de propiedad, fechas, huéspedes
   - Cálculo automático de precio por noches
   - Integración con Stripe para pagos
   - Estado guardado en `bookings` table

3. **Autenticación**
   - Email/password y Google OAuth
   - Roles: `admin` o `client`
   - Admin basado en emails en `.env`

## Testing
- Modo local usa datos mock en localStorage
- Stripe en modo test: tarjeta `4242 4242 4242 4242`
- Verificar que funcione en ambos modos (local/supabase)

## No Hacer
- ❌ No crear archivos `.md` extensos sin solicitud
- ❌ No hardcodear configuraciones
- ❌ No agregar dependencias sin necesidad
- ❌ No crear componentes que no se usen
- ❌ No usar emojis en el código
- ❌ No crear archivos de ejemplo innecesarios
