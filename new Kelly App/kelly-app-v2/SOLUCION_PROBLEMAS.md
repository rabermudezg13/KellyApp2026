# 🔧 Solución de Problemas - No Puedo Acceder

## ❌ Error: "No puedo acceder"

### Diagnóstico Paso a Paso

#### 1. Verificar que los Servidores Estén Corriendo

**Backend:**
```bash
# En Terminal 1, deberías ver algo como:
INFO:     Uvicorn running on http://0.0.0.0:3026
INFO:     Application startup complete.
```

**Frontend:**
```bash
# En Terminal 2, deberías ver algo como:
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:3025/
```

---

#### 2. Verificar que los Puertos Estén Libres

```bash
# Verificar puerto 3025
lsof -i :3025

# Verificar puerto 3026
lsof -i :3026
```

**Si hay algo corriendo:**
```bash
# Matar proceso (reemplaza PID con el número)
kill -9 <PID>
```

---

#### 3. Verificar URLs Correctas

✅ **CORRECTO:**
- Frontend: `http://localhost:3025`
- Backend: `http://localhost:3026`

❌ **INCORRECTO:**
- `http://localhost` (esa es tu otra app)
- `http://localhost:3000`
- `http://127.0.0.1` (sin puerto)

---

#### 4. Errores Comunes y Soluciones

### Error: "Connection refused" o "No se puede acceder"

**Causa:** El servidor no está corriendo

**Solución:**
1. Verifica que ambos servidores estén corriendo
2. Revisa las terminales para ver errores
3. Asegúrate de estar en los directorios correctos

---

### Error: "Module not found" en Backend

**Causa:** Dependencias no instaladas

**Solución:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

---

### Error: "Cannot find module" en Frontend

**Causa:** node_modules no instalado

**Solución:**
```bash
cd frontend
npm install
```

---

### Error: "Port already in use"

**Causa:** Puerto ocupado por otro proceso

**Solución:**
```bash
# Ver qué está usando el puerto
lsof -i :3025
lsof -i :3026

# Matar proceso
kill -9 <PID>
```

O cambiar los puertos (ver más abajo)

---

### Error: "CORS error" en el navegador

**Causa:** Frontend y backend en puertos diferentes

**Solución:**
1. Verifica que frontend esté en 3025
2. Verifica que backend esté en 3026
3. Verifica CORS en `backend/main.py`

---

## 🚀 Inicio Rápido con Scripts

### Opción 1: Usar Scripts de Inicio

**Backend (Terminal 1):**
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
chmod +x start.sh
./start.sh
```

**Frontend (Terminal 2):**
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/frontend"
chmod +x start.sh
./start.sh
```

---

### Opción 2: Manual

**Backend:**
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"

# Primera vez
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "DATABASE_URL=sqlite:///./kelly_app.db" > .env

# Cada vez
source venv/bin/activate
python main.py
```

**Frontend:**
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/frontend"

# Primera vez
npm install

# Cada vez
npm run dev
```

---

## 🔍 Verificar que Funciona

### 1. Probar Backend Directamente

Abrir en navegador: `http://localhost:3026`

**Deberías ver:**
```json
{
  "message": "Kelly Education Front Desk API v2.0",
  "status": "running"
}
```

Si ves esto, el backend funciona ✅

---

### 2. Probar Frontend

Abrir en navegador: `http://localhost:3025`

**Deberías ver:**
- Título: "Kelly Education Miami Dade"
- Botones: "Register Visit" y "Staff Login"

Si ves esto, el frontend funciona ✅

---

### 3. Ver Errores en Consola del Navegador

1. Abrir `http://localhost:3025`
2. Presionar `F12` o `Cmd+Option+I` (Mac)
3. Ir a pestaña "Console"
4. Ver si hay errores en rojo

**Errores comunes:**
- `Failed to fetch` → Backend no está corriendo
- `CORS error` → Problema de configuración CORS
- `404 Not Found` → Ruta incorrecta

---

## 📝 Checklist de Diagnóstico

- [ ] Backend corriendo en Terminal 1
- [ ] Frontend corriendo en Terminal 2
- [ ] No hay errores en las terminales
- [ ] Puertos 3025 y 3026 libres
- [ ] Accediendo a `http://localhost:3025` (no solo `localhost`)
- [ ] Backend responde en `http://localhost:3026`
- [ ] No hay errores en consola del navegador

---

## 🆘 Si Nada Funciona

1. **Cerrar todo y empezar de nuevo:**
```bash
# Matar todos los procesos de Python/Node
pkill -f "python main.py"
pkill -f "vite"
pkill -f "uvicorn"
```

2. **Verificar versiones:**
```bash
python3 --version  # Debe ser 3.9+
node --version     # Debe ser 18+
npm --version
```

3. **Reinstalar dependencias:**
```bash
# Backend
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 💬 Información para Diagnosticar

Si sigues teniendo problemas, comparte:

1. **¿Qué error exacto ves?** (mensaje completo)
2. **¿En qué URL estás intentando acceder?**
3. **¿Qué ves en las terminales?** (errores, mensajes)
4. **¿Qué ves en la consola del navegador?** (F12 → Console)

---

*Con esta información podré ayudarte mejor a resolver el problema.*


