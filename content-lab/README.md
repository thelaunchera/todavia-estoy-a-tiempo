# The Content Lab — código principal en GitHub

Aplicación privada de contenido visual, alojada en GitHub Pages, en una carpeta separada de `estudio-control/`. No modifica el podcast, sus publicaciones, ni The Launch Era Cleaning App.

## Enlaces

- App: https://podcast.thelaunchera.com/content-lab/
- Master Prompts gratuitos: https://podcast.thelaunchera.com/content-lab/prompts/
- Código: https://github.com/thelaunchera/todavia-estoy-a-tiempo/tree/main/content-lab

## Arquitectura (31 de octubre de 2026)

- **Frontend:** React/Vite publicado desde GitHub Pages; código independiente del SDK de AppDeploy.
- **Datos y fotos:** Supabase ya existente del podcast, proyecto `fhrvuhikrybobidxpvnh`. Tablas prefijadas `content_lab_*`, propietarios autorizados, políticas RLS y bucket *privado* `content-lab-private`. No se modifican las tablas del Studio.
- **Servidor:** Supabase Edge Function `content-lab-generate` con verificación JWT y propietario autorizado.
- **IA:** SOLO Cloudflare Workers AI Free. Imagen: `@cf/black-forest-labs/flux-2-klein-4b`, que acepta una foto de producto + referencia opcional. Texto/ideas: `@cf/meta/llama-3.1-8b-instruct-fp8-fast`. Gemini de pago ya NO se utiliza.
- **Idioma:** Todavía estoy a tiempo = español latino; The Launch Era = inglés americano.

## Modelo gratuito y sus límites

Cloudflare Workers AI **Workers Free** incluye un máximo compartido de **10.000 neuronas por día**, sujeto a disponibilidad y cambios de Cloudflare. Cuando se agota la cuota del plan gratuito las peticiones dejan de funcionar; **no genera fotos ilimitadas ni se cobra por exceso mientras se mantenga en Workers Free**. Este presupuesto lo comparten los modelos de texto e imagen.

https://developers.cloudflare.com/workers-ai/platform/pricing/

FLUX.2 Klein 4B acepta fotos de referencia de tamaño inferior a 512×512 px. Al subir una foto, el navegador conserva el original de buena calidad en Supabase Storage y prepara otra copia **de máximo 480 px** bajo el mismo registro protegido por RLS para la IA. Las fotos anteriores a esta integración se deben volver a subir. Al exportar, se entregan PNG individuales de 1080×1350 píxeles; las nuevas fotos del modelo se generan en 1024×1280. Revisa siempre la fidelidad de empaques, logos y detalles.

## Activación: pendiente conectar cuenta gratuita Cloudflare

1. Crear/iniciar sesión en una cuenta **Cloudflare Free** (sin contratar Workers Paid).
2. En el panel Cloudflare, obtener **Account ID** y crear un **API Token** de Workers AI con permisos limitados para esa cuenta.
3. Guardarlos en **Supabase → Edge Functions → Secrets** de `fhrvuhikrybobidxpvnh` como `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_API_TOKEN`. **Nunca ponerlos en GitHub, VITE variables, ni ChatGPT.**
4. Confirmar que el URL de redirección de Supabase Auth incluya `https://podcast.thelaunchera.com/content-lab/`.
5. Entrar al Lab y probar 1 imagen de producto real, verificar su guardado y descarga. Luego evaluar un grid de 9. Se utilizan las mismas cuotas gratuitas, no se requiere clave de Gemini.
6. Migración de proyectos/datos previamente almacenados en AppDeploy **todavía pendiente**. Código y datos no se migran juntos.

Si no se configura Cloudflare, el backend responde con un mensaje claro y no intenta usar Gemini ni otro proveedor de pago. **No anunciar la generación gratuita como activa hasta completar una prueba con cuenta Cloudflare conectada.**

## Instalación local

```bash
cd content-lab
npm install
npm test
npm run build
npm run dev
```

El frontend recibe únicamente identificadores públicos `VITE_CONTENT_LAB_SUPABASE_URL` y `VITE_CONTENT_LAB_SUPABASE_PUBLISHABLE_KEY`. Todas las claves privadas residen en secretos de Supabase. El código de la Edge Function se encuentra en `supabase/functions/content-lab-generate/index.ts` y el esquema de seguridad en `supabase/schema.sql`.

## Herramientas

- *1 Photo → 9 Posts*: nueve fotos publicitarias independientes con diferentes escenas. Hay que revisar manualmente la fidelidad del producto y descargar un PNG por post.
- *1 Product → 8 Compositions*: ocho prompts para cambiar composición manteniendo **la misma foto**, el mismo producto y el texto. **Gratis sin llamar a ninguna API**, se puede usar desde la biblioteca pública de prompts.
- *Carousel Factory* y editor de publicaciones: disponibles en el frontend privado cuando el login esté configurado.

El antiguo AppDeploy permanece como referencia temporal y no debe eliminarse mientras existan borradores/fotos sin exportar.

## Solución al error de Cloudflare «Could not route» (2026-10-31)

La primera prueba real falló porque `CLOUDFLARE_ACCOUNT_ID` incluía un espacio insertado durante el copiado. El backend ahora elimina los espacios en blanco (incluidos saltos de línea) antes de usar el ID, verifica que tenga exactamente 32 dígitos hexadecimales y traduce los errores de permisos/ID a mensajes en español sin mostrar identificadores privados. Si la conexión vuelve a fallar, revisa que `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_API_TOKEN` pertenezcan a la misma cuenta gratuita de Cloudflare. Las claves no se escriben en GitHub ni en el frontend.
