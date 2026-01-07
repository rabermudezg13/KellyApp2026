# 🔧 Solución: Error al Instalar Dependencias

## ❌ Error: "Failed building wheel for pydantic-core"

Este error es común en macOS. Vamos a solucionarlo.

---

## ✅ Solución Rápida

### Opción 1: Instalar Versiones Más Antiguas (Recomendado)

En tu terminal, ejecuta:

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
source venv/bin/activate
```

Luego instala las dependencias básicas primero:

```bash
pip install fastapi uvicorn[standard] python-dotenv sqlalchemy python-multipart python-dateutil
```

Luego instala pydantic con una versión más estable:

```bash
pip install "pydantic>=2.0,<2.5" pydantic-settings
```

---

### Opción 2: Usar requirements-simple.txt

He creado un archivo más simple. Ejecuta:

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
source venv/bin/activate
pip install -r requirements-simple.txt
```

---

### Opción 3: Instalar Sin Versiones Específicas

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
source venv/bin/activate
pip install fastapi uvicorn python-dotenv pydantic pydantic-settings sqlalchemy python-multipart python-dateutil
```

---

## 🔍 Verificar Instalación

Después de instalar, verifica:

```bash
pip list | grep -E "fastapi|uvicorn|pydantic|sqlalchemy"
```

Deberías ver todas las librerías listadas.

---

## 🚀 Iniciar Servidor

Una vez instalado, ejecuta:

```bash
python main.py
```

Deberías ver:
```
INFO:     Uvicorn running on http://0.0.0.0:3026
```

---

## ⚠️ Notas

- **psycopg2-binary** fue removido porque solo lo necesitas si usas PostgreSQL
- Para SQLite (que es lo que usamos por defecto), no es necesario
- Si más adelante necesitas PostgreSQL, puedes instalarlo con: `pip install psycopg2-binary`

---

## 🆘 Si Sigue Fallando

### Instalar Xcode Command Line Tools

```bash
xcode-select --install
```

### Usar pip con --no-build-isolation

```bash
pip install --no-build-isolation fastapi uvicorn python-dotenv pydantic sqlalchemy
```

---

*Prueba la Opción 3 primero, es la más simple y debería funcionar.*


