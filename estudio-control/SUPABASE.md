# Backend Supabase — Todavía estoy a tiempo

**Estado: proyecto Supabase exclusivo del podcast activo desde el 22 de octubre de 2026.**

El podcast no debe compartir las bases de datos **The Launch Era Cleaning App** ni **The Launch Era Cleaning App — Testing**.

## 1. Proyecto exclusivo existente
El proyecto `Todavía estoy a tiempo — Podcast` está activo y separado de los proyectos comerciales de The Launch Era. No reutilizar credenciales ni tablas de TLE.

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
En Auth > URL Configuration, mantener permitida `https://podcast.thelaunchera.com/estudio/` como redirección. La cuenta de administración utiliza contraseña de Supabase; el enlace de recuperación sirve para establecerla. La bóveda local es compatibilidad con datos anteriores.
El login debe comprobar membresía admin, además de las políticas de base de datos.

## 5. Variables públicas del frontend
GitHub Actions puede compilar Vite con:
- `VITE_PODCAST_SUPABASE_URL` — URL pública del nuevo proyecto
- `VITE_PODCAST_SUPABASE_PUBLISHABLE_KEY` — clave publishable para clientes

Estas dos variables **son públicas por diseño**. NUNCA exponer `service_role`, `sb_secret_`, llaves privadas de Stripe, Resend o Make en GitHub Pages ni en variables `VITE_`.

La URL y la clave publicable ya están configuradas en el frontend. La bóveda local antigua solo debe importarse expresamente tras verificar un respaldo.

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

## 7. Migración del estudio local
Después de configurar el nuevo proyecto y habilitar el primer administrador, entra en el estudio con el correo autorizado.
En **Configuración** aparecerá «Recuperar mis capítulos y tareas anteriores» si este navegador guarda una bóveda cifrada.
La importación utiliza la frase local, añade los episodios, tareas, productos e ideas a Supabase y conserva la copia cifrada. Si la repites, las claves `external_id` evitan duplicados.
No importa ventas ni direcciones de compradores porque estas no se pueden validar mediante los datos del navegador.

## 8. Control de calidad del repositorio
El despliegue de GitHub Pages ahora verifica `tests/check-schema.mjs` antes de compilar.
La primera lectura real de Supabase, sus políticas RLS y el acceso por correo deben probarse tras crear el nuevo proyecto. No declarar «conectado» hasta que esa verificación sea satisfactoria.

### Activación real — 22 octubre 2026
- Proyecto nuevo creado: `fhrvuhikrybobidxpvnh`.
- El esquema de ocho tablas está instalado y sus RLS están habilitadas.
- El sitio GitHub Pages usa la URL y la **clave pública** Supabase de `src/public-supabase-config.ts`. Esto NO es una clave secreta.
- En Supabase > Authentication > URL Configuration, mantener permitida la dirección `https://podcast.thelaunchera.com/estudio/` y verificarla al cambiar la recuperación.
- El primer propietario ya consta en `podcast_studio_admins`. No se permite el acceso solo por crear una cuenta.
- Las cuentas sin autorización explícita seguirán bloqueadas.
- Antes de migrar registros locales, exportar un respaldo cifrado desde la versión local. El proyecto activo ya contiene registros; no reimportar respaldos sin revisar duplicados.

### Verificación 27 de octubre de 2026
- Proyecto activo con diez tablas `podcast_*` y RLS habilitada.
- Precios oficiales: diario $1.99 y cuaderno $3.99; los registros de productos del Estudio se han sincronizado.
- La tabla de entregas personalizadas carece de políticas públicas intencionalmente: solo acceso del servidor autorizado.
- Advertencia pendiente de seguridad: habilitar protección de contraseñas comprometidas en Auth desde el panel privado.
