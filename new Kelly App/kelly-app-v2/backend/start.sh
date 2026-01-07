#!/bin/bash

# Script para iniciar el backend de Kelly App v2.0

echo "🚀 Iniciando Backend Kelly App v2.0..."
echo ""

# Verificar si existe el entorno virtual
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias si es necesario
if [ ! -f "venv/.installed" ]; then
    echo "📥 Instalando dependencias..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Crear .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    echo "DATABASE_URL=sqlite:///./kelly_app.db" > .env
    echo "SECRET_KEY=$(openssl rand -hex 32)" >> .env
fi

# Iniciar servidor
echo ""
echo "✅ Iniciando servidor en puerto 3026..."
echo "🌐 Backend disponible en: http://localhost:3026"
echo "📚 API Docs disponible en: http://localhost:3026/docs"
echo ""
python main.py


