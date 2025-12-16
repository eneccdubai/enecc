# 🏠 Configuración de Sincronización con Airbnb

## ⚡ ÚLTIMO PASO ANTES DE LA REUNIÓN

Para que Airbnb pueda importar tu calendario, necesitas redesplegar la función con acceso público.

### Opción 1: Desde la terminal (MÁS RÁPIDO) ⚡

```bash
# 1. Obtén tu access token
open https://supabase.com/dashboard/account/tokens

# 2. Crea un nuevo token o copia uno existente

# 3. Ejecuta el script (pega tu token donde dice YOUR_TOKEN):
SUPABASE_ACCESS_TOKEN=sbp_tu_token_aqui ./deploy-calendar-function.sh
```

### Opción 2: Desde el Dashboard de Supabase 🖱️

1. Ve a: https://supabase.com/dashboard/project/bdfpiaoegclakkhtosvz/functions
2. Click en la función `export-calendar`
3. Click en "Settings" o "Configure"
4. Busca la opción "Verify JWT" y **DESACTÍVALA** (debe estar en OFF)
5. Click en "Save" o "Update"

---

## 📋 GUÍA PARA LA REUNIÓN CON EL CLIENTE

### Lo que EL CLIENTE necesita hacer en Airbnb:

1. **Ir a su anuncio en Airbnb**
2. **Ir a:** Calendario → Disponibilidad → Sincronizar calendarios
3. **En "Exportar calendario":**
   - Copiar el link de iCal que Airbnb muestra
   - **DARTE ESE LINK**

4. **En "Importar calendario":**
   - **PEGAR TU LINK** (ver abajo)
   - Darle un nombre: "Enecc Calendar"

### Lo que TÚ le das al cliente:

Dependiendo de qué propiedad es:

#### 🏖️ Casa de Playa
```
https://bdfpiaoegclakkhtosvz.supabase.co/functions/v1/export-calendar/NGYzMDY2Y2MtODQ5Yi00ZGI1LWE4NGUtNWJkOGZkY2Q4OWUw.ics
```

#### 🏢 Apartamento Centro
```
https://bdfpiaoegclakkhtosvz.supabase.co/functions/v1/export-calendar/OGM0MDNjMjQtODMxMS00MjhiLWIyNWMtNTMyMTI1NDlkMDg0.ics
```

#### 🏰 Villa de Lujo
```
https://bdfpiaoegclakkhtosvz.supabase.co/functions/v1/export-calendar/NWEzOWMyM2MtMDJjMi00MmY2LWEzM2QtNGNmZjFlM2U1YmUw.ics
```

### Lo que el cliente te da a ti:

Un link que se ve así:
```
https://www.airbnb.com/calendar/ical/XXXXXXXX.ics?s=YYYYYYYY
```

---

## 🔧 DESPUÉS DE LA REUNIÓN

1. Entra a tu app: https://enecc-web.pages.dev/
2. Haz login como admin
3. Ve a la propiedad correspondiente
4. En la sección **"Sincronización de Calendarios"**:
   - Pega el link que te dio el cliente en **"Airbnb iCal URL"**
   - Marca ✅ **"Activar sincronización"**
   - Click en **"Guardar URLs"**
   - Click en **"Sincronizar Ahora"** para la primera importación

---

## ✅ ¿Cómo saber que funciona?

### Para verificar TU exportación (que Airbnb puede leer):

Después de redesplegar, abre este link en tu navegador:
```
https://bdfpiaoegclakkhtosvz.supabase.co/functions/v1/export-calendar/NGYzMDY2Y2MtODQ5Yi00ZGI1LWE4NGUtNWJkOGZkY2Q4OWUw.ics
```

Deberías ver un archivo de texto con formato iCalendar que empieza con:
```
BEGIN:VCALENDAR
VERSION:2.0
...
```

Si ves esto = ✅ **TODO FUNCIONA**

Si ves un error 401 = ❌ **Necesitas redesplegar la función con acceso público**

---

## 🔄 Sincronización Automática

Una vez configurado:
- ⏰ Se sincroniza **automáticamente cada 3 horas**
- 📥 Importa reservas de Airbnb a tu sistema
- 📤 Exporta tus reservas para que Airbnb las bloquee
- 🚫 **No más double bookings**
- ✅ Calendarios siempre actualizados

---

## 🆘 Troubleshooting

### Error: "Calendario no encontrado" (404)
- Verifica que el token en la URL sea correcto
- Verifica que la propiedad existe en tu base de datos

### Error: "Unauthorized" (401)
- La función necesita ser redesplegada con `--no-verify-jwt`
- Ejecuta el script `deploy-calendar-function.sh` con tu access token

### Error: "No se encontraron reservas"
- Normal si la propiedad no tiene reservas confirmadas
- Airbnb igual puede importar el calendario (estará vacío)

### Las reservas no se sincronizan
- Verifica que "Activar sincronización" esté marcado ✅
- Click en "Sincronizar Ahora" manualmente
- Revisa los logs en Supabase dashboard

---

## 📞 Contacto

Si algo falla durante la reunión:
- Puedes hacer la sincronización manual después
- El cliente puede volver a configurar en cualquier momento
- Los links de exportación NUNCA cambian (son permanentes)

¡Buena suerte con tu reunión! 🚀
