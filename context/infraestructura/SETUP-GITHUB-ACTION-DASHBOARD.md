# Configuración: Deploy Progress Dashboard a cPanel

## 📋 Secrets Requeridos

Para que el GitHub Action funcione, debes configurar estos secrets en:  
**GitHub → Repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `CPANEL_FTP_SERVER` | Servidor FTP de cPanel | `ftp.vcorp.mx` |
| `CPANEL_FTP_USERNAME` | Usuario FTP | `usuario@vcorp.mx` |
| `CPANEL_FTP_PASSWORD` | Contraseña FTP | `*********` |
| `CPANEL_FTP_PATH` | Ruta destino en servidor | `/public_html/ami-dashboard/` |

> ⚠️ **Importante**: La ruta `CPANEL_FTP_PATH` debe terminar en `/`

---

## 🔧 Cómo obtener credenciales FTP en cPanel

1. Accede a cPanel de vcorp.mx
2. Busca **"Cuentas FTP"** o **"FTP Accounts"**
3. Crea una cuenta nueva o usa las credenciales principales
4. El servidor suele ser `ftp.tudominio.mx` o la IP del hosting

---

## 🚀 Cómo funciona el workflow

```
PROYECTO.md modificado
        ↓
   push a master
        ↓
  GitHub Action se dispara
        ↓
  parser.js genera JSON
        ↓
  Commit automático del JSON
        ↓
  FTP Upload a cPanel
        ↓
  Dashboard actualizado en vcorp.mx
```

---

## 🧪 Probar manualmente

1. Ve a **Actions** en el repo de GitHub
2. Selecciona **"Deploy Progress Dashboard"**
3. Click en **"Run workflow"** (botón derecho)
4. Selecciona branch `master`
5. Click en **"Run workflow"**

---

## 📁 Archivos desplegados

El workflow sube todo el contenido de `progressdashboard/` excepto:
- `parser.js` (solo se usa en CI)
- `node_modules/`
- Archivos `.git*`

**Estructura en cPanel:**
```
/public_html/ami-dashboard/
├── index.html
├── app.js
├── styles.css
└── data/
    └── project_data.json
```

---

## 🔗 URL Final

Una vez desplegado, el dashboard estará disponible en:
```
https://vcorp.mx/ami-dashboard/
```
(o la ruta que configures en `CPANEL_FTP_PATH`)

---

## ❓ Troubleshooting

### Error: "Login authentication failed"
- Verifica que `CPANEL_FTP_USERNAME` y `CPANEL_FTP_PASSWORD` sean correctos
- Algunos hostings requieren usuario completo: `usuario@dominio.mx`

### Error: "Could not connect to server"
- Verifica que `CPANEL_FTP_SERVER` sea correcto
- Puede ser IP o dominio (ej: `ftp.vcorp.mx` o `192.168.x.x`)
- Puerto FTP por defecto: 21

### El dashboard no se actualiza
- Verifica que el path `CPANEL_FTP_PATH` exista en el servidor
- Revisa los logs del workflow en GitHub Actions
