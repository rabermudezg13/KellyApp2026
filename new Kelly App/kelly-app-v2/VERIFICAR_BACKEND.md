# 🔍 Verificar que el Backend Esté Corriendo

## ⚠️ Error: "Request timeout" o "Backend server is not responding"

Este error significa que el **backend no está corriendo** o no está accesible en el puerto 3026.

## ✅ Solución: Iniciar el Backend

### Paso 1: Abrir una nueva terminal

### Paso 2: Navegar al directorio del backend

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
```

### Paso 3: Activar el entorno virtual

```bash
source venv/bin/activate
```

### Paso 4: Iniciar el servidor

```bash
python main.py
```

**Deberías ver:**
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
✅ Default admin user created: cculturausallc@gmail.com
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:3026 (Press CTRL+C to quit)
```

### Paso 5: Verificar que funciona

Abre en el navegador: `http://localhost:3026`

Deberías ver:
```json
{"message": "Kelly Education Front Desk API v2.0", "status": "running"}
```

## 🔧 Si el Backend No Inicia

### Error: "ModuleNotFoundError: No module named 'fastapi'"

**Solución:**
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
source venv/bin/activate
pip install -r requirements.txt
```

### Error: "Address already in use" (Puerto 3026 ocupado)

**Solución 1:** Cerrar el proceso que está usando el puerto
```bash
lsof -ti:3026 | xargs kill -9
```

**Solución 2:** Cambiar el puerto en `backend/main.py`:
```python
uvicorn.run("main:app", host="0.0.0.0", port=3027, reload=True)
```

Y actualizar `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3027/api'
```

## 📝 Resumen

**Para que la app funcione, necesitas DOS terminales:**

1. **Terminal 1 - Backend:**
   ```bash
   cd kelly-app-v2/backend
   source venv/bin/activate
   python main.py
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd kelly-app-v2/frontend
   npm run dev
   ```

Ambos deben estar corriendo al mismo tiempo.


