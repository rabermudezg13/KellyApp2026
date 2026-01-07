# 🚀 Instrucciones para Ejecutar Kelly App v2.0

## 📋 Requisitos Previos

- Python 3.9+ instalado
- Node.js 18+ y npm instalados
- Git (opcional)

---

## 🔧 Configuración del Backend (Puerto 3026)

### 1. Navegar al directorio del backend
```bash
cd backend
```

### 2. Crear entorno virtual
```bash
python -m venv venv
```

### 3. Activar entorno virtual
**En macOS/Linux:**
```bash
source venv/bin/activate
```

**En Windows:**
```bash
venv\Scripts\activate
```

### 4. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 5. Crear archivo .env
```bash
cp .env.example .env
```

Editar `.env` y configurar:
```
DATABASE_URL=sqlite:///./kelly_app.db
SECRET_KEY=tu-clave-secreta-aqui
```

### 6. Ejecutar el servidor
```bash
python main.py
```

O con uvicorn directamente:
```bash
uvicorn main:app --reload --port 3026
```

El backend estará disponible en: **http://localhost:3026**

---

## 🎨 Configuración del Frontend (Puerto 3025)

### 1. Navegar al directorio del frontend
```bash
cd frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Crear archivo .env (opcional)
```bash
echo "VITE_API_URL=http://localhost:3026/api" > .env
```

### 4. Ejecutar el servidor de desarrollo
```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:3025**

---

## ✅ Verificar que Todo Funciona

1. **Backend:** Abrir http://localhost:3026 en el navegador
   - Deberías ver: `{"message": "Kelly Education Front Desk API v2.0", "status": "running"}`

2. **Frontend:** Abrir http://localhost:3025 en el navegador
   - Deberías ver la pantalla inicial con el título "Kelly Education Miami Dade"

3. **API Docs:** Abrir http://localhost:3026/docs
   - Deberías ver la documentación interactiva de FastAPI (Swagger UI)

---

## 🧪 Probar Info Session

1. En el frontend (http://localhost:3025), hacer clic en "Register Visit"
2. Llenar el formulario de Info Session:
   - First Name
   - Last Name
   - Email
   - Phone
   - ZIP Code (nuevo campo)
   - Type (New Hire o Reactivation)
   - Time Slot (8:30 AM o 1:30 PM)
3. Hacer clic en "Register Info Session"
4. Si el nombre está en la lista de exclusión, aparecerá una advertencia
5. Después del registro, aparecerá la pantalla de bienvenida con los pasos a completar

---

## 📊 Dashboard Staff

1. En el frontend, hacer clic en "Staff Login"
2. Verás la lista de todas las Info Sessions registradas
3. Podrás ver:
   - Nombre completo
   - Email y teléfono
   - ZIP Code
   - Tipo de sesión
   - Time slot
   - Estado
   - Si está en lista de exclusión

---

## 🗄️ Base de Datos

Por defecto, se usa SQLite (archivo `kelly_app.db` en el directorio backend).

Para cambiar a PostgreSQL:
1. Instalar PostgreSQL
2. Crear una base de datos
3. Cambiar `DATABASE_URL` en `.env`:
   ```
   DATABASE_URL=postgresql://usuario:password@localhost/kelly_app
   ```

---

## 🐛 Solución de Problemas

### Backend no inicia
- Verificar que Python 3.9+ está instalado: `python --version`
- Verificar que todas las dependencias están instaladas: `pip list`
- Verificar que el puerto 3026 no está en uso

### Frontend no inicia
- Verificar que Node.js 18+ está instalado: `node --version`
- Eliminar `node_modules` y `package-lock.json`, luego `npm install` de nuevo
- Verificar que el puerto 3025 no está en uso

### Error de CORS
- Verificar que el frontend está en http://localhost:3025
- Verificar que el backend está en http://localhost:3026
- Revisar la configuración de CORS en `backend/main.py`

### Error de base de datos
- Verificar que el archivo `.env` existe y tiene `DATABASE_URL` configurado
- Si usas SQLite, verificar permisos de escritura en el directorio backend

---

## 📝 Próximos Pasos

1. ✅ Info Session implementado
2. ⏳ Sistema de avisos/mensajes (parcialmente implementado - falta UI admin)
3. ⏳ Quitar Document Completion de Register Visit
4. ⏳ Implementar otras secciones (Fingerprints, Badge, etc.)

---

## 🔗 URLs Importantes

- **Frontend:** http://localhost:3025
- **Backend API:** http://localhost:3026
- **API Docs:** http://localhost:3026/docs
- **Health Check:** http://localhost:3026/health

---

*Última actualización: 2025-01-27*


