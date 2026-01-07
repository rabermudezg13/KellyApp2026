#!/bin/bash

# Script para iniciar solo el frontend
# Uso: ./start-frontend.sh

echo "🎨 Iniciando Frontend (puerto 3025)..."
cd "$(dirname "$0")/frontend"
npm run dev


