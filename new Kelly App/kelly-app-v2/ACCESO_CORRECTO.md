# 🔗 Cómo Acceder a la Nueva App Kelly v2.0

## ⚠️ IMPORTANTE: Puertos Específicos

La nueva app **NO** está en `http://localhost` (puerto 80)

La nueva app está en:
- **Frontend:** `http://localhost:3025` ✅
- **Backend:** `http://localhost:3026` ✅

---

## 🎯 URLs Correctas

### Frontend (Interfaz de Usuario)
```
http://localhost:3025
```

### Backend API
```
http://localhost:3026
```

### Documentación API (Swagger)
```
http://localhost:3026/docs
```

---

## 🚀 Pasos para Ejecutar

### 1. Verificar que los puertos estén libres

```bash
# Verificar puerto 3025
lsof -i :3025

# Verificar puerto 3026
lsof -i :3026
```

Si hay algo corriendo, puedes:
- Cerrar esa aplicación
- O cambiar los puertos en la configuración

---

### 2. Iniciar Backend (Terminal 1)

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
source venv/bin/activate
python main.py
```

**Deberías ver:**
```
INFO:     Uvicorn running on http://0.0.0.0:3026
```

---

### 3. Iniciar Frontend (Terminal 2 - Nueva ventana)

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/frontend"
npm run dev
```

**Deberías ver:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3025/
  ➜  Network: use --host to expose
```

---

## ✅ Verificar que Funciona

1. **Abrir en navegador:** `http://localhost:3025`
   - Deberías ver la pantalla inicial de Kelly Education Miami Dade
   - NO deberías ver tu otra app

2. **Verificar backend:** `http://localhost:3026`
   - Deberías ver: `{"message": "Kelly Education Front Desk API v2.0", "status": "running"}`

3. **Ver API Docs:** `http://localhost:3026/docs`
   - Deberías ver la documentación interactiva de FastAPI

---

## 🔧 Si los Puertos Están Ocupados

### Opción 1: Cambiar Puertos

**Backend (cambiar a 3027):**
Editar `backend/main.py` línea 50:
```python
uvicorn.run("main:app", host="0.0.0.0", port=3027, reload=True)
```

**Frontend (cambiar a 3028):**
Editar `frontend/vite.config.ts`:
```typescript
server: {
  port: 3028,
  ...
}
```

Y actualizar CORS en `backend/main.py`:
```python
allow_origins=[
    "http://localhost:3028",
    "http://127.0.0.1:3028",
],
```

### Opción 2: Cerrar Proceso que Usa el Puerto

```bash
# Encontrar proceso en puerto 3025
lsof -ti :3025

# Matar proceso (reemplaza PID con el número que salga)
kill -9 <PID>

# Lo mismo para 3026
lsof -ti :3026
kill -9 <PID>
```

---

## 📝 Diferencias con tu App Actual

| Característica | App Actual | Nueva App v2.0 |
|----------------|------------|----------------|
| Puerto Frontend | ? | **3025** |
| Puerto Backend | ? | **3026** |
| URL | `http://localhost` | `http://localhost:3025` |
| Tecnología | Firebase/Monolito | React + FastAPI |

---

## 🎯 Resumen

✅ **Usa estos puertos específicos:**
- Frontend: `http://localhost:3025`
- Backend: `http://localhost:3026`

❌ **NO uses:**
- `http://localhost` (esa es tu otra app)
- `http://localhost:3000` (si tienes otra app ahí)

---

*Si sigues teniendo problemas, verifica que ambos servidores estén corriendo correctamente.*


