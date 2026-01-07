# 🚀 Inicio Rápido - Kelly App v2.0

## ⚡ Pasos para Ejecutar la App

### Paso 1: Backend (Terminal 1)

```bash
# Navegar al directorio del backend
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"

# Crear entorno virtual (solo la primera vez)
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias (solo la primera vez)
pip install -r requirements.txt

# Crear archivo .env (solo la primera vez)
cp .env.example .env

# Ejecutar el servidor
python main.py
```

**✅ Deberías ver:** `Uvicorn running on http://0.0.0.0:3026`

---

### Paso 2: Frontend (Terminal 2 - Nueva ventana)

```bash
# Navegar al directorio del frontend
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/frontend"

# Instalar dependencias (solo la primera vez)
npm install

# Ejecutar el servidor de desarrollo
npm run dev
```

**✅ Deberías ver:** `Local: http://localhost:3025/`

---

### Paso 3: Abrir en el Navegador

1. **Frontend:** http://localhost:3025
2. **Backend API:** http://localhost:3026
3. **API Docs (Swagger):** http://localhost:3026/docs

---

## 🧪 Probar la App

### 1. Registrar Info Session
- Ir a http://localhost:3025
- Clic en "Register Visit"
- Llenar formulario de Info Session
- Marcar checkboxes si aplica
- Registrar

### 2. Ver Dashboard Staff
- Ir a http://localhost:3025
- Clic en "Staff Login"
- Ver todas las sesiones registradas
- Ver reclutadores asignados y duraciones

### 3. Dashboard del Reclutador
- Desde Staff Dashboard, hacer clic en el nombre de un reclutador
- O ir directamente a: http://localhost:3025/recruiter/1/dashboard
- Cambiar estado (Available/Busy)
- Iniciar sesión con visitante
- Marcar documentos
- Completar sesión

### 4. Configuración Admin
- Ir a: http://localhost:3025/admin/info-session-config
- Modificar cantidad de sesiones por día
- Añadir/eliminar time slots

---

## ⚠️ Si Algo No Funciona

### Backend no inicia:
```bash
# Verificar Python
python3 --version  # Debe ser 3.9+

# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Frontend no inicia:
```bash
# Verificar Node.js
node --version  # Debe ser 18+

# Limpiar e instalar de nuevo
rm -rf node_modules package-lock.json
npm install
```

### Error de puerto en uso:
```bash
# Ver qué está usando el puerto 3025
lsof -i :3025

# Ver qué está usando el puerto 3026
lsof -i :3026

# Matar proceso si es necesario
kill -9 <PID>
```

---

## 📝 Notas

- **Base de datos:** Se crea automáticamente (`kelly_app.db` en backend/)
- **Reclutadores:** Se crean automáticamente (5 reclutadores) al primer registro
- **Primera vez:** Puede tardar un poco más en instalar dependencias

---

## ✅ Checklist

- [ ] Backend corriendo en puerto 3026
- [ ] Frontend corriendo en puerto 3025
- [ ] Puedo ver la página inicial
- [ ] Puedo registrar una Info Session
- [ ] Puedo ver el Staff Dashboard
- [ ] Puedo acceder al dashboard del reclutador

---

¡Listo para probar! 🎉


