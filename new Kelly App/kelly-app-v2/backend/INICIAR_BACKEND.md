# 🚀 Cómo Iniciar el Backend

## Opción 1: Usando el Script Automático (Recomendado)

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
./start-backend.sh
```

## Opción 2: Manual (Paso a Paso)

### 1. Navega al directorio del backend
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
```

### 2. Activa el entorno virtual
```bash
source venv/bin/activate
```

### 3. Inicia el servidor
```bash
python main.py
```

O usando uvicorn directamente:
```bash
uvicorn main:app --host 0.0.0.0 --port 3026 --reload
```

## ✅ Verificar que Funciona

Una vez iniciado, deberías ver algo como:
```
INFO:     Uvicorn running on http://0.0.0.0:3026 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Prueba el servidor:
Abre en tu navegador: `http://localhost:3026/health`

Deberías ver:
```json
{"status": "healthy"}
```

O visita: `http://localhost:3026/`

Deberías ver:
```json
{
  "message": "Kelly Education Front Desk API v2.0",
  "status": "running"
}
```

## 🔧 Si Tienes Problemas

### Error: "No module named 'fastapi'"
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
source venv/bin/activate
pip install -r requirements.txt
```

### Error: "venv/bin/activate: No such file or directory"
El entorno virtual no existe. Créalo:
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Error: "Address already in use"
El puerto 3026 está ocupado. Detén el proceso que lo está usando:
```bash
lsof -ti:3026 | xargs kill -9
```

O cambia el puerto en `main.py` (línea 60):
```python
uvicorn.run("main:app", host="0.0.0.0", port=3027, reload=True)
```

## 📝 Notas

- El backend corre en el puerto **3026**
- El frontend debe estar en el puerto **3025**
- El servidor se reinicia automáticamente cuando cambias código (modo `reload=True`)
- Para detener el servidor, presiona `Ctrl+C`

