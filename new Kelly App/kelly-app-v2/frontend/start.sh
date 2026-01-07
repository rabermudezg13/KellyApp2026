#!/bin/bash

# Script para iniciar el frontend de Kelly App v2.0

echo "🚀 Iniciando Frontend Kelly App v2.0..."
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias..."
    npm install
fi

# Crear .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    echo "VITE_API_URL=http://localhost:3026/api" > .env
fi

# Iniciar servidor
echo ""
echo "✅ Iniciando servidor en puerto 3025..."
echo "🌐 Frontend disponible en: http://localhost:3025"
echo ""
npm run dev


