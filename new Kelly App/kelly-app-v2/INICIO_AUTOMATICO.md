# 🚀 Inicio Automático de Servidores

## 📋 Opciones para Iniciar los Servidores

### Opción 1: Script Todo-en-Uno (Recomendado) ⭐

**Inicia ambos servidores con un solo comando:**

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
chmod +x start.sh
./start.sh
```

Esto iniciará:
- ✅ Backend en puerto 3026
- ✅ Frontend en puerto 3025

**Para detener:** Presiona `Ctrl+C`

---

### Opción 2: Scripts Separados

**Solo Backend:**
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
chmod +x start-backend.sh
./start-backend.sh
```

**Solo Frontend:**
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
chmod +x start-frontend.sh
./start-frontend.sh
```

---

### Opción 3: Usando npm (Requiere instalar concurrently)

**Primero instala concurrently:**
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
npm install
```

**Luego inicia ambos:**
```bash
npm start
```

---

### Opción 4: Terminales Separadas (Manual)

**Terminal 1 - Backend:**
```bash
cd kelly-app-v2/backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd kelly-app-v2/frontend
npm run dev
```

---

## 🔄 ¿Siempre Debo Iniciar los Servidores?

### En Desarrollo Local: **SÍ** ✅

Cada vez que quieras trabajar en la app, necesitas iniciar:
1. Backend (puerto 3026)
2. Frontend (puerto 3025)

### En Producción: **NO** ❌

En producción (cuando despliegues la app):
- Los servidores se inician automáticamente
- Se mantienen corriendo 24/7
- No necesitas hacer nada manualmente

---

## 💡 Consejos

### 1. Usa el Script Todo-en-Uno
Es la forma más fácil. Solo ejecuta `./start.sh` y listo.

### 2. Mantén los Servidores Corriendo
Mientras trabajas, deja ambos servidores corriendo. Solo ciérralos cuando termines.

### 3. Si Cierras la Terminal
Si cierras la terminal donde están corriendo, los servidores se detienen. Solo vuelve a ejecutar `./start.sh`.

### 4. Para Producción
Cuando despliegues la app (Vercel, Render, etc.), los servidores se inician automáticamente y no necesitas hacer nada.

---

## 🛠️ Solución de Problemas

### Error: "Permission denied"
```bash
chmod +x start.sh
chmod +x start-backend.sh
chmod +x start-frontend.sh
```

### Error: "Port already in use"
Alguien ya está usando el puerto. Cierra ese proceso o cambia el puerto en la configuración.

### Los servidores no inician
Verifica que:
- Python está instalado
- Node.js está instalado
- Las dependencias están instaladas (`pip install -r requirements.txt` y `npm install`)


