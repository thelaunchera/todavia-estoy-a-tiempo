# Todavía estoy a tiempo — Landing

Landing independiente del podcast de Dailin. Sitio estático responsive con identidad de papel texturizado, recortes editoriales y animaciones discretas inspiradas en los efectos del repositorio web existente (sin dependencias comerciales).

## Productos
- No voy tarde — Diario guiado para volver a mí: $4.99.
- Empezar de nuevo — Cuaderno práctico: $7.99.
- 5 preguntas para cuando sientes que vas tarde: gratuito.

## Antes de publicar
1. Subir retrato original a `assets/dailin.webp` sin retocar el rostro.
2. Subir fotografías de los productos a `assets/productos/` y reemplazar los mockups temporales por sus imágenes reales (no usar fotos de otras marcas).
3. Revisar archivos PDF finales y texto legal de datos, contacto y políticas.
4. Conectar enlaces públicos de pago de Stripe en `site-config.js`, tras probar el webhook de pago completado y la entrega automática en Make.
5. Colocar URL pública real del podcast y guía digital.
6. Probar manualmente en móvil, tablet y desktop.

## Seguridad
No se almacenan claves secretas de Stripe ni tokens de Make en GitHub. Botones comerciales deliberadamente en modo espera mientras no haya enlace de pago real.

## Movimiento
La implementación usa reveal con IntersectionObserver, relieve suave de tarjetas, sello flotante y textura scratch-paper realizada con SVG + CSS. Respeta `prefers-reduced-motion`.
