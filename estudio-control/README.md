# Estudio de Control · Todavía estoy a tiempo

Código fuente del centro privado del podcast. Proyecto **independiente** del Command Center de The Launch Era.

## Accesos
- Panel en funcionamiento: https://estudio-de-control-todavia-estoy-a-tiempo-c09dcu.v2.appdeploy.ai/
- Enlace desde GitHub Pages: https://thelaunchera.github.io/todavia-estoy-a-tiempo/estudio/
- El sitio público del podcast permanece en https://thelaunchera.github.io/todavia-estoy-a-tiempo/

## Arquitectura
- React + TypeScript, interfaz 100 % español, responsive
- Autenticación de AppDeploy; rutas privadas que validan al administrador
- Backend AppDeploy SDK (API y base de datos) para episodios, tareas, productos e ideas
- Modo grabación oculta controles y no muestra datos de compradores
- Indicadores de ventas, audiencia y soporte **no sincronizados** hasta configurar las conexiones reales

## Importante sobre la publicación
GitHub Pages sirve **solo contenido estático**. El código de `backend/index.ts` necesita un entorno servidor con el SDK de AppDeploy; **no puede ejecutarse directamente en GitHub Pages**.
La página `/estudio/` de este repositorio abre el panel seguro existente. Los cambios realizados en este directorio GitHub **no actualizan automáticamente** el despliegue AppDeploy hasta configurar un flujo de deploy compatible.

## Seguridad
No guardar claves, credenciales ni información de compradores en el repositorio. Este repositorio es público; el workflow de Pages excluye `estudio-control/` de los archivos publicados. Los archivos del repositorio sí son visibles como código fuente en GitHub. Se ha sustituido el correo administrativo explícito por `STUDIO_ADMIN_EMAILS` en el **código exportado**; debes configurar este valor como secreto de servidor al hacer una futura implementación. El panel AppDeploy que ya está activo mantiene su configuración original. Evita exponer secretos en variables VITE_ o archivos frontend.

## Desarrollo
```sh
cd estudio-control
npm install
npm run dev
```
Para ejecutar las rutas `/api` necesitas el entorno AppDeploy, con dependencias `@appdeploy/sdk` y `@appdeploy/client` inyectadas por esa plataforma, o adaptar el backend a otro proveedor. No confundir la vista local sin API con una versión de producción.
