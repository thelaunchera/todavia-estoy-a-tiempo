# Todavía estoy a tiempo

Landing independiente del podcast de Dailin y su primera colección digital en español.

## Dirección editorial

Azul noche `#101D34`, ivory `#F6F3EB`, azul suave `#B8CADC` y líneas doradas discretas `#AC9870`. Las portadas incorporan siluetas femeninas, fotografías en azul monocromático y bordes de papel. El retrato existente de Dailin se conserva sin editar sus píxeles ni su identidad.

- `index.html`: landing principal.
- `styles-redesign.css`: sistema visual y responsive compartido.
- `app-redesign.js`: navegación móvil, reveals, estados de disponibilidad y configuración de enlaces.
- `productos/`: páginas de los dos cuadernos de pago.
- `assets/productos/editorial/`: las tres portadas vigentes, en WebP.
- `assets/fonts/`: tipografías WOFF2 locales y licencias; no se depende de Google Fonts.
- `redesign.html`: alias a la página principal para evitar una vista previa antigua.

## Colección

| Producto | Precio público |
| --- | --- |
| 5 preguntas para cuando sientes que vas tarde | Gratis |
| No voy tarde — Un diario para volver a mí | $1.99 USD |
| Empezar de nuevo — Sin tener todo resuelto | $3.99 USD |

## Vista local

Ejecutar `python3 -m http.server 8015` y abrir `http://localhost:8015`.

## Enlaces y ventas

La venta está activa (`commerceEnabled: true` en `site-config.js`). Los productos de $1.99 y $3.99 utilizan Stripe Checkout; el recurso gratuito, la suscripción y la ayuda usan automatización de correo. El PDF personalizado se entrega mediante la función privada del proyecto del podcast. No añadir claves secretas ni tokens de descarga a archivos del repositorio. Las claves publicables de Supabase no son secretos. Tras modificar pagos o correos, comprobar sus flujos de extremo a extremo.

## Accesibilidad y movimiento

Navegación con teclado, cierre del menú con Escape, FAQ nativo, avisos con `aria-live`, imágenes con dimensiones y texto alternativo. Reveals con IntersectionObserver y transiciones suaves; `prefers-reduced-motion` deja todo el contenido visible sin animaciones. La colección utiliza scroll horizontal nativo y snap en móvil, sin dependencias ni autoplay.

## Publicación

El flujo existente de GitHub Pages publica la rama `main`.

## Estudio de Control

El Estudio de Control protegido se encuentra en `https://podcast.thelaunchera.com/estudio/`. El proyecto exclusivo de Supabase está activo y exige una cuenta autorizada. No enlazar el estudio desde el menú público ni mostrar proveedores internos en la pantalla de acceso.

Dirección editorial: el podcast se dirige a todas las personas; voz natural y cercana, sin repetir «chica» ni asumir una audiencia exclusivamente femenina.
