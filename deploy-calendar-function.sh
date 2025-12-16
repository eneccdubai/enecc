#!/bin/bash

# Script para redesplegar la función export-calendar con acceso público
#
# Instrucciones:
# 1. Obtén tu access token de Supabase:
#    - Ve a: https://supabase.com/dashboard/account/tokens
#    - Crea un nuevo access token o copia uno existente
# 2. Ejecuta este script con tu token:
#    SUPABASE_ACCESS_TOKEN=tu_token_aqui ./deploy-calendar-function.sh

set -e

echo "🚀 Desplegando función export-calendar con acceso público..."

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: SUPABASE_ACCESS_TOKEN no está configurado"
    echo ""
    echo "Para obtener tu access token:"
    echo "1. Ve a https://supabase.com/dashboard/account/tokens"
    echo "2. Crea un nuevo token o copia uno existente"
    echo "3. Ejecuta:"
    echo "   SUPABASE_ACCESS_TOKEN=tu_token_aqui ./deploy-calendar-function.sh"
    exit 1
fi

echo "✅ Access token encontrado"

# Desplegar la función con --no-verify-jwt
echo "📦 Desplegando función..."
supabase functions deploy export-calendar \
    --no-verify-jwt \
    --project-ref bdfpiaoegclakkhtosvz

echo ""
echo "✅ ¡Función desplegada exitosamente!"
echo ""
echo "🔗 URLs de exportación para tus propiedades:"
echo "  Casa de Playa:      https://bdfpiaoegclakkhtosvz.supabase.co/functions/v1/export-calendar/NGYzMDY2Y2MtODQ5Yi00ZGI1LWE4NGUtNWJkOGZkY2Q4OWUw.ics"
echo "  Apartamento Centro: https://bdfpiaoegclakkhtosvz.supabase.co/functions/v1/export-calendar/OGM0MDNjMjQtODMxMS00MjhiLWIyNWMtNTMyMTI1NDlkMDg0.ics"
echo "  Villa de Lujo:      https://bdfpiaoegclakkhtosvz.supabase.co/functions/v1/export-calendar/NWEzOWMyM2MtMDJjMi00MmY2LWEzM2QtNGNmZjFlM2U1YmUw.ics"
echo ""
echo "🎉 Ya puedes darle estos links a tu cliente para que los configure en Airbnb"
