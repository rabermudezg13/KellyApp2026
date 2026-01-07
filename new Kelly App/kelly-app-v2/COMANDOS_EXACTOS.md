# 📋 Comandos Exactos para Ejecutar

## ⚠️ IMPORTANTE: Copia y pega estos comandos EXACTAMENTE

---

## 🔧 TERMINAL 1 - Backend

Copia y pega estos comandos **UNO POR UNO**:

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
```

```bash
python3 -m venv venv
```

```bash
source venv/bin/activate
```

```bash
pip install -r requirements.txt
```

```bash
echo "DATABASE_URL=sqlite:///./kelly_app.db" > .env
```

```bash
python main.py
```

**✅ Cuando veas esto, el backend está corriendo:**
```
INFO:     Uvicorn running on http://0.0.0.0:3026
```

**⚠️ NO CIERRES ESTA TERMINAL**

---

## 🎨 TERMINAL 2 - Frontend (NUEVA TERMINAL)

Abre una **NUEVA TERMINAL** y copia estos comandos:

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/frontend"
```

```bash
npm install
```

```bash
npm run dev
```

**✅ Cuando veas esto, el frontend está corriendo:**
```
➜  Local:   http://localhost:3025/
```

---

## 🌐 Abrir en el Navegador

Abre tu navegador y ve a:

```
http://localhost:3025
```

---

## ❌ Si Ves Errores

### Error: "No such file or directory: 'requirements.txt'"

**Solución:** Asegúrate de estar en el directorio correcto:
```bash
pwd
# Debe mostrar: /Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend
```

Si no, ejecuta:
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2/backend"
```

---

### Error: "command not found: python3"

**Solución:** Usa `python` en lugar de `python3`:
```bash
python -m venv venv
python main.py
```

---

### Error: "command not found: npm"

**Solución:** Node.js no está instalado. Instálalo desde: https://nodejs.org/

---

## ✅ Verificar que Funciona

1. **Backend:** Abre `http://localhost:3026`
   - Deberías ver: `{"message": "Kelly Education Front Desk API v2.0", "status": "running"}`

2. **Frontend:** Abre `http://localhost:3025`
   - Deberías ver la página de Kelly Education Miami Dade

---

*Copia y pega los comandos exactamente como están escritos arriba.*


