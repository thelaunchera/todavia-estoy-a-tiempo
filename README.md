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

| Producto | Precio previsto |
| --- | --- |
| 5 preguntas para cuando sientes que vas tarde | Gratis |
| No voy tarde — Un diario para volver a mí | $4.99 USD |
| Empezar de nuevo — Sin tener todo resuelto | $7.99 USD |

## Vista local

Ejecutar `python3 -m http.server 8015` y abrir `http://localhost:8015`.

## Enlaces y ventas

La tienda permanece en preparación. `site-config.js` contiene únicamente configuración pública.

- `commerceEnabled: false` mantiene los botones de compra desactivados, incluso si hay un enlace de pago.
- Antes de activar ventas: terminar los PDF y verificar el pago, la confirmación y la entrega de archivos de extremo a extremo.
- Después de esa prueba: añadir los enlaces públicos de Stripe y activar `commerceEnabled` explícitamente.
- `freeGuideUrl` y `podcastUrl` quedan vacíos hasta disponer de sus enlaces oficiales; la interfaz muestra ese estado sin simular descargas o reproducciones.
- No guardar claves secretas, tokens ni datos personales en este repositorio.

## Accesibilidad y movimiento

Navegación con teclado, cierre del menú con Escape, FAQ nativo, avisos con `aria-live`, imágenes con dimensiones y texto alternativo. Reveals con IntersectionObserver y transiciones suaves; `prefers-reduced-motion` deja todo el contenido visible sin animaciones. La colección utiliza scroll horizontal nativo y snap en móvil, sin dependencias ni autoplay.

## Publicación

El flujo existente de GitHub Pages publica la rama `main`.

## Estudio de Control (privado)

El Estudio de Control es una aplicación independiente de la landing pública. Enlace de acceso: https://estudio-de-control-todavia-estoy-a-tiempo-c09dcu.v2.appdeploy.ai/

La landing pública está en https://podcast.thelaunchera.com/ y **no** debe utilizarse como enlace al Estudio. No incluir el acceso privado en la navegación pública sin autorización.

Dirección editorial: el podcast está dirigido a cualquier persona que conecte con sus temas; tono natural, conversacional y cercano, sin recurrir repetidamente a «chica» ni asumir una audiencia exclusivamente femenina.
