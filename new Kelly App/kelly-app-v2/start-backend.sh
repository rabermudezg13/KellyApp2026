#!/bin/bash

# Script para iniciar solo el backend
# Uso: ./start-backend.sh

echo "📦 Iniciando Backend (puerto 3026)..."
cd "$(dirname "$0")/backend"
source venv/bin/activate
python main.py


