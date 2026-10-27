# Estudio de Control — Todavía estoy a tiempo

## Estado (27 de octubre de 2026)
El Estudio se publica en https://podcast.thelaunchera.com/estudio/ junto al landing. La cuenta del Estudio usa Supabase Auth y autorización adicional mediante `podcast_studio_admins`, con RLS para los datos privados.

- Gestiona episodios, tareas, calendario, ideas y productos.
- Los paneles de ventas, suscriptores y mensajes muestran registros reales **solo cuando un servicio autorizado los sincroniza**. Una tabla vacía no demuestra que una transacción no exista en otro servicio.
- Los PDF personalizados se generan por una función protegida mediante enlace único de cada compra.
- La bóveda cifrada del navegador corresponde a una versión anterior y solo se importa expresamente. No se migran claves ni datos automáticamente.
- El modo grabación es solo una configuración visual; no da permisos.
- Cerrar sesión en dispositivos compartidos; las sesiones autorizadas pueden recordarse cinco días.

## Desarrollo y controles
Código React/Vite en `src/Studio.tsx`, conexión en `src/supabase-client.ts`, bóveda antigua en `src/local-client.ts`.
Ejecutar `cd estudio-control && npm install && npm run dev`. El flujo de GitHub Actions verifica esquema, PWA, enlaces Spotify, precios y privacidad antes del deploy.
En iPhone abre el Estudio en Safari y selecciona **Compartir → Añadir a pantalla de inicio**.

Nunca guardar claves secretas de Supabase, Stripe, correos privados o enlaces de descarga de compras dentro de archivos públicos.
