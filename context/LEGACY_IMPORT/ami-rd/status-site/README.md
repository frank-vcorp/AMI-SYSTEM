# Status Site (cPanel)

Sitio ultra ligero (HTML + Tailwind) para compartir con AMI el avance diario del proyecto RD-AMI. El contenido es de solo lectura y se publica en un hosting compartido vía cPanel/FTP.

## Flujo de datos
1. `PROYECTO.md` contiene la tabla “Tablero — Módulos fuente”.  
2. `npm run sync:dashboard` parsea esa tabla y genera `status-site/data/status.json`.  
3. El workflow `.github/workflows/deploy-status-site.yml` ejecuta el script en cada push a `main` y sube la carpeta `status-site/` al servidor FTP/FTPS.  
4. `index.html` consume el JSON y renderiza progreso por fase/módulo.

## Configuración rápida
1. Copia las credenciales del FTP/cPanel como secrets:
   - `CPANEL_HOST`, `CPANEL_USERNAME`, `CPANEL_PASSWORD`, `CPANEL_PORT` (21 por defecto) y `CPANEL_TARGET_DIR`.
2. Ajusta la ruta destino en `CPANEL_TARGET_DIR` (por ejemplo `/public_html/rd-ami-status/`).  
3. Realiza un push a `main`; el workflow generará el JSON y desplegará el sitio.

## Estructura
- `index.html` — Layout principal + Tailwind CDN.  
- `styles.css` — Estilos base (fondos, tarjetas, chips).  
- `app.js` — Fetch a `data/status.json` + render dinámico.  
- `data/status.json` — Resultado del script (no editar manualmente).

## Uso local
```bash
npm run sync:dashboard -- --skip-firestore
npx serve status-site
```
Abre `http://localhost:3000` para validar antes de publicar.
