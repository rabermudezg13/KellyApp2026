# Kelly Education Front Desk - Version 2.0

## 🚀 Nueva Arquitectura

### Frontend (Puerto 3025)
- React con TypeScript
- Vite como build tool
- Tailwind CSS para estilos
- React Router para navegación

### Backend (Puerto 3026)
- Python FastAPI
- PostgreSQL como base de datos
- Redis para caché (opcional)
- JWT para autenticación

## 📁 Estructura del Proyecto

```
kelly-app-v2/
├── frontend/          # React app (puerto 3025)
├── backend/           # FastAPI app (puerto 3026)
└── README.md
```

## 🎯 Cambios Implementados

### Info Session (Nueva Funcionalidad)
- ✅ Campo ZIP code añadido
- ✅ Verificación de lista de exclusión
- ✅ Alarma si está en lista de exclusión
- ✅ Pantalla de bienvenida con requisitos
- ✅ Checklist de pasos completables
- ✅ Dashboard staff para ver registros

### Pantalla Inicial
- ✅ Sistema de avisos/mensajes editables desde admin
- ✅ Mensajes de bienvenida configurables

### Register Visit
- ✅ Document Completion removido de esta sección

---

## 🛠️ Desarrollo

### Frontend
```bash
cd frontend
npm install
npm run dev  # Puerto 3025
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 3026
```

---

## 📝 Notas

- Esta es la nueva versión, no modifica la app original
- Desarrollo en puertos 3025 (frontend) y 3026 (backend)
- Sección por sección según prioridades


