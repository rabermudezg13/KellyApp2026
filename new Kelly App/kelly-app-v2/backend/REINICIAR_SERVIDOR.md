# 🔄 Reiniciar Servidor - Exclusion List

## ⚠️ IMPORTANTE: Cambios Realizados

Se han agregado nuevas funcionalidades que requieren:
1. ✅ Instalar nuevas dependencias (pandas, openpyxl)
2. ✅ Reiniciar el servidor backend
3. ✅ Actualizar la base de datos (si es necesario)

## 📋 Pasos para Reiniciar

### 1. Detén el servidor backend actual
Si está corriendo, presiona `Ctrl+C` en la terminal donde está corriendo

### 2. Instala las nuevas dependencias
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
source venv/bin/activate
pip install pandas openpyxl
```

O instala todas las dependencias de nuevo:
```bash
pip install -r requirements.txt
```

### 3. Reinicia el servidor backend
```bash
python main.py
```

O usando el script:
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
./start-backend.sh
```

## ✅ Verificar que Funciona

Una vez iniciado, deberías ver:
```
INFO:     Uvicorn running on http://0.0.0.0:3026 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

### Prueba los nuevos endpoints:
- `http://localhost:3026/api/exclusion-list/list` (requiere autenticación admin)

## 🔍 Si Hay Errores

### Error: "No module named 'pandas'"
```bash
pip install pandas openpyxl
```

### Error: "Table exclusion_list doesn't exist"
La base de datos se actualizará automáticamente al iniciar el servidor.
Si persiste el error, elimina la base de datos y reinicia:
```bash
rm kelly_app.db
python main.py
```

## 📝 Notas

- El frontend no necesita reiniciarse (solo el backend)
- Los cambios en la base de datos se aplican automáticamente
- Las nuevas dependencias son: `pandas` y `openpyxl` para leer archivos Excel

