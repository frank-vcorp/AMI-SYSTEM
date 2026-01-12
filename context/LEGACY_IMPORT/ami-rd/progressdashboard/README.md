# Progress Dashboard

Este directorio contiene los archivos para el dashboard de progreso del proyecto RD-AMI.

## Arquitectura

1.  **`parser.js`**: Un script de Node.js que lee `PROYECTO.md`, extrae el estado de las tareas y genera un archivo `project_data.json`.
2.  **`data/project_data.json`**: El archivo JSON que contiene los datos del proyecto para el frontend.
3.  **`index.html`**: La estructura HTML del dashboard.
4.  **`styles.css`**: Los estilos CSS para el dashboard (usando Tailwind CSS).
5.  **`app.js`**: El código JavaScript del frontend que lee `project_data.json` y renderiza el dashboard.

## Despliegue

El dashboard se despliega automáticamente en `vcorp.mx/ami/progressdashboard` cada vez que hay un cambio en `PROYECTO.md` en la rama `main`.

El despliegue se realiza mediante una GitHub Action que:
1.  Ejecuta `parser.js` para generar `project_data.json`.
2.  Sube los archivos estáticos (`index.html`, `styles.css`, `app.js`, `data/project_data.json`) al servidor FTP.