#!/bin/bash

# Script para iniciar tanto el backend como el frontend
# Uso: ./start.sh

echo "🚀 Iniciando Kelly App v2.0..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Iniciar Backend
echo -e "${BLUE}📦 Iniciando Backend (puerto 3026)...${NC}"
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar Frontend
echo -e "${GREEN}🎨 Iniciando Frontend (puerto 3025)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Ambos servidores están corriendo!${NC}"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3025"
echo "   Backend:  http://localhost:3026"
echo "   API Docs: http://localhost:3026/docs"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"
echo ""

# Esperar a que ambos procesos terminen
wait


