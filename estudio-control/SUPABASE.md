# Backend Supabase — Todavía estoy a tiempo

**Estado: preparado en GitHub, todavía sin proyecto Supabase exclusivo activado.**

El podcast no debe compartir las bases de datos **The Launch Era Cleaning App** ni **The Launch Era Cleaning App — Testing**.

## 1. Crear un proyecto exclusivo
Crear un proyecto de Supabase llamado `Todavía estoy a tiempo — Podcast` en la organización que elijas, después de confirmar cualquier costo. No reutilizar credenciales ni tablas de TLE.

## 2. Configurar la base
Ejecutar `sql/estructura-podcast.sql` únicamente en el **nuevo proyecto** desde SQL Editor.
Comprobar RLS en **todas** las tablas `podcast_*`.
Inicialmente nadie obtiene acceso por solo tener cuenta: se debe habilitar al administrador.

## 3. Autorizar la cuenta propietaria
Crear o invitar al usuario desde Auth > Users, copiar su UUID y ejecutar en SQL Editor:
```sql
insert into public.podcast_studio_admins(user_id,role)
values ('UUID_DE_LA_CUENTA_ADMINISTRADORA','owner');
```
Usar solo el UUID; no publicar correos ni secretos en el repositorio. No habilitar creación abierta de usuarios del estudio.

## 4. Configurar autenticación y dominios
En Auth > URL Configuration, usar `https://podcast.thelaunchera.com/estudio/` como redirección admitida. Se utiliza **magic link** al correo autorizado, no la contraseña local.
El login debe comprobar membresía admin, además de las políticas de base de datos.

## 5. Variables públicas del frontend
GitHub Actions puede compilar Vite con:
- `VITE_PODCAST_SUPABASE_URL` — URL pública del nuevo proyecto
- `VITE_PODCAST_SUPABASE_PUBLISHABLE_KEY` — clave publishable para clientes

Estas dos variables **son públicas por diseño**. NUNCA exponer `service_role`, `sb_secret_`, llaves privadas de Stripe, Resend o Make en GitHub Pages ni en variables `VITE_`.

**Hasta que ambas variables estén configuradas, el sitio sigue usando su bóveda local cifrada.** No hay migración automática de esos datos: exportar/importar solo tras validar un proceso autorizado. El cambio de backend debe anunciarse para que ningún dato local se pierda.

## 6. Eventos reales
Las tablas `podcast_sales`, `podcast_subscribers`, `podcast_support_messages`,
`podcast_delivery_events` y `podcast_automation_runs` son de **solo lectura desde el cliente**.
Solo una función o endpoint confiable, con validación de firmas y secretos almacenados en el servidor, podrá insertar o actualizar datos de Stripe, Make o Resend. Un panel jamás debe declarar como ingreso una compra sin confirmar.

## Seguridad
- Acceso admin controlado en una tabla sin políticas públicas de escritura.
- RLS por usuario + membresía administradora para episodios/tareas/productos/ideas.
- RLS solo lectura para datos sensibles de operaciones.
- `anon` sin permisos en tablas privadas.
- El modo grabación **es visual**, no reemplaza la seguridad de RLS.
