# The Content Lab — código principal en GitHub

Aplicación privada de contenido visual, alojada en GitHub Pages, en una carpeta separada de `estudio-control/`. No modifica el podcast, sus publicaciones, ni The Launch Era Cleaning App.

## Enlaces

- App: https://podcast.thelaunchera.com/content-lab/
- Master Prompts gratuitos con ocho ejemplos de matcha y carrusel animado: https://podcast.thelaunchera.com/content-lab/prompts/
- Comprar Content Lab — checkout activo en Make/Stripe ($10): https://buy.stripe.com/14AdR8dHp6Dnd8B1IM93y0Z
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

El origen y los enlaces públicos oficiales son GitHub y GitHub Pages. El contenido privado anterior debe migrarse solo si existe respaldo verificado; no utilizar AppDeploy como enlace público.

## Solución al error de Cloudflare «Could not route» (2026-10-31)

La primera prueba real falló porque `CLOUDFLARE_ACCOUNT_ID` incluía un espacio insertado durante el copiado. El backend ahora elimina los espacios en blanco (incluidos saltos de línea) antes de usar el ID, verifica que tenga exactamente 32 dígitos hexadecimales y traduce los errores de permisos/ID a mensajes en español sin mostrar identificadores privados. Si la conexión vuelve a fallar, revisa que `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_API_TOKEN` pertenezcan a la misma cuenta gratuita de Cloudflare. Las claves no se escriben en GitHub ni en el frontend.

## Lanzamiento Content Lab ($10 compra única) — estado real

- **Entrada gratuita:** La ruta `/content-lab/prompts/` con los ocho Master Prompts es **pública intencionalmente**, para que la audiencia los copie y conozca el producto. No almacenar allí prompts premium ni datos privados.
- **Checkout LIVE:** Compra única de **$10 USD** en Stripe a través de Make: https://buy.stripe.com/14AdR8dHp6Dnd8B1IM93y0Z. El botón público ya aparece en el freebie. Se activó el webhook Stripe LIVE y el flujo Make de acceso privado y correo de bienvenida; la compra completa y la entrega aún requieren prueba con un comprador real.
- **Seguridad actual:** Administradores autorizados y compradores con correo verificado y membresía activa. El checkout se vuelve a consultar en Stripe LIVE antes de insertar una membresía privada en Supabase; el Lab no se habilita por JavaScript del navegador ni por la simple redirección de pago. RLS y Storage siguen aislados por propietario.
- **Costos de IA:** La compra incluye un número finito de créditos de IA y límites diarios por comprador. El servidor protege el saldo y la cuota gratuita compartida; no se promete IA ilimitada.
- **Bilingüe:** Login inicial disponible ES/EN y cada marca conserva idioma de copy, pero la traducción completa del resto del editor sigue pendiente de implementación y revisión.

### Inicio de sesión sin salir de la app (OTP en el mismo iPhone)

El Lab presenta un campo donde introducir el código numérico del correo. `supabase.auth.verifyOtp({ email, token, type: 'email' })` crea la sesión **en el mismo contexto web/PWA**, por lo que ya no hace falta pulsar el enlace que abre Safari.

**Paso de configuración aún necesario en Supabase (sin conectores para editar plantillas Auth):**
1. Ve a `https://supabase.com/dashboard/project/fhrvuhikrybobidxpvnh/auth/templates`.
2. Abre **Magic Link** en las plantillas de Auth. Como el podcast usa este mismo Supabase, **conserva intactos el enlace y el diseño del correo actual**. Añade únicamente un párrafo que muestre el código numérico mediante la variable {{ .Token }}. No sustituyas el correo entero ni elimines el Magic Link.

3. Asegura el redirect `https://podcast.thelaunchera.com/content-lab/` en Auth → URL Configuration.
4. Prueba con **la cuenta propietaria autorizada**. Si el correo no muestra el código, la UI no puede fabricarlo; revisa la plantilla y no reportes que OTP funcionó.
5. Cuando exista el proveedor de pagos, implementar comprador autenticado + entitlement validado por webhook + RLS por `auth.uid()` + cuota por cuenta. No abrir el esquema ni quitar el requisito admin previamente.

Referencia: documentación oficial [Supabase Passwordless email sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless).

**Separación futura:** antes de vender acceso a clientes, considera un proyecto Auth independiente del podcast y revisa sus costes. No crear un proyecto nuevo ni cambiar los correos del Studio sin revisión.


## IA, créditos y sostenibilidad — política PRE-LANZAMIENTO (31 oct 2026)

**Precio previsto:** $10 USD pago único. No prometer generaciones de IA ilimitadas.

**Cuotas por comprador implementadas en servidor (no en JavaScript):**
- 60 generaciones de fotos IA iniciales (1 foto = 1 crédito).
- 30 créditos creativos: idea = 1; preparar grid con IA = 3, incluye análisis de referencias.
- Límite por día y comprador: 10 fotos, 10 créditos creativos. Reinicio UTC.
- Techo compartido de seguridad = 50 unidades ponderadas/día (foto 1, idea 2, grid plan 4). Son unidades internas, NO neuronas reales de Cloudflare.
- Diagnóstico técnico Cloudflare solo para la propietaria.
- Errores de inferencia devuelven crédito por RPC de servicio; un grid preparado por plantilla local no debe cobrar IA.
- Editor editorial, movimiento de capas, cambios de fondo y fuentes, biblioteca y exportación de PNG local NO consumen créditos IA.
- El saldo se consulta desde Supabase y aparece en el sidebar.

**Costos verificados:** Cloudflare Workers AI tiene 10.000 neuronas/día incluidas y cobra $0.011/1000 neuronas adicionales en Workers Paid; FLUX.2 Klein 4B cuesta $0.000287 por tile de salida 512×512 y $0.000059 por tile de entrada 512×512, según https://developers.cloudflare.com/workers-ai/platform/pricing/ . Texto y visión se cobran por tokens. No atribuir a cada imagen un costo fijo sin medir resolución real y entradas.

Stripe cobra normalmente 2.9% + $0.30 por tarjeta doméstica de EE.UU.; de $10 restan aproximadamente $9.41 antes de otros gastos. Fuente https://stripe.com/pricing .

**Stripe no transfiere el dinero automáticamente a Cloudflare.** Para seguir usando IA después de agotar la cuota gratuita compartida será necesario configurar una forma de pago en Workers Paid (la cuenta Workers tiene mínimo de $5/mes, sujeto a condiciones), o utilizar créditos prepagados AI Gateway con Unified Billing. No activar gasto abierto antes de verificar límites.

El pago único compra acceso permanente a las herramientas locales y una cuota **finita** inicial de IA. Los paquetes de créditos adicionales requerirán su propio pago Stripe y entrega verificada mediante Make. Los productos de recarga de créditos adicionales aún no están disponibles. El checkout original de $10 ya está activo en Stripe vía Make.

**QA pendiente después de activar el checkout:** sigue faltando completar una compra real de prueba de extremo a extremo Stripe→Make→Supabase→correo→OTP iPhone, verificar aislamiento de dos compradores, devolución de crédito al fallar la IA, solicitudes paralelas, límite por día y reembolso Stripe. El enlace de pago ya está activo; no afirmar que una compra de prueba se completó cuando no existe evidencia. Consultar uso real de neuronas en Cloudflare Dashboard: nuestro límite interno ponderado de 50/día NO garantiza que no se consuman las 10k neuronas diarias.

**Privacidad adicional:** la reserva de créditos ahora también es una función interna *service_role*; ningún comprador puede invocarla directamente desde el navegador ni modificar su saldo. El backend obtiene el UID/email de una sesión verificada antes de reservar o reembolsar.
