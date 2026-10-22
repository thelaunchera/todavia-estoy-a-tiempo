# Entregas del podcast — preparación del 22 de octubre de 2026

Landing publicado: https://thelaunchera.github.io/todavia-estoy-a-tiempo/

## Estado real

- Guía gratis: flujo activo, prueba enviada y confirmada como delivered por Resend. El formulario está preparado en esta rama; aún no publicado en main.
- Productos pagados: flujo configurado e inactivo. Los dos Payment Links están inactivos. commerceEnabled permanece false.
- Remitente y respuestas: hello@thelaunchera.com. Dominio verificado y envío habilitado.
- Sin inscripción automática a publicidad.

## Flujos

Guía gratis: https://us2.make.com/2964061/scenarios/6728266
Compras: https://us2.make.com/2964061/scenarios/6727852

La guía acepta email, name, resource=cinco_preguntas, newsletter=no, website vacío y source=podcast_website.
El formulario envía URLSearchParams para evitar un preflight CORS. La respuesta JSON ok=true se devuelve únicamente después de que Resend acepte el envío. Idempotencia diaria por hash del correo; repetir una solicitud el mismo día reutiliza el envío.

El flujo de compras recibe checkout.session.completed o checkout.session.async_payment_succeeded. Recupera la sesión directamente de Stripe con line_items expandido. Exige payment_status=paid, status=complete, livemode=true y currency=usd. El correo del destinatario sale de customer_details.email verificado en Stripe, nunca del webhook.

| Producto | Importe USD | Payment Link permitido | Price permitido |
|---|---:|---|---|
| No voy tarde | 4.99 | plink_1UT9l8CnlGzKRSIMI1SyCzCO | price_1UT9iVCnlGzKRSIMM0j0iNFB |
| Empezar de nuevo | 7.99 | plink_1UT9lGCnlGzKRSIMUwMTsYrH | price_1UT9iYCnlGzKRSIMQktOzEJF |

Se requiere un único line item, cantidad 1 e importe total exacto. Se usa Idempotency-Key por sesión en Resend y el almacén “Podcast — Entregas completadas” (180295), escrito después de un 2xx del correo. Ejecución secuencial activada. Este control evita repetir entregas registradas; un fallo entre correo y registro requiere revisar el resultado del proveedor antes de reintentar tras 24 horas.

## Archivos definitivos

- Guía: https://drive.google.com/file/d/1FAJd-pAgQUynFLAeB5wdnsf1Broi5SDo/view
- No voy tarde: https://drive.google.com/file/d/1sDMFG1q9fj3xF7sR7gqadPgm5YpCERRq/view
- Empezar de nuevo: https://drive.google.com/file/d/1bN2wnvn-HzMBsNtKhin2vQK_tWPGsSD1/view

Incluyen portada original, campos rellenables, interiores legibles para teléfono y pie Powered by The Launch Era con contacto.

## Validación hecha

- Consulta de Stripe y line items de ambos enlaces: precios actuales 499 y 799 centavos.
- Solicitud de guía por webhook real: Make terminó con éxito; Resend devolvió 200 y confirmó delivered.
- El envío de prueba incluyó el PDF actual, versión HTML y texto, y reply-to oficial.
- Los flujos se guardaron sin errores de configuración reportados.

## Antes de abrir al público

1. Revisar/publicar esta rama y comprobar el formulario real desde un teléfono (incluido CORS y respuesta visible).
2. Para compras, registrar/configurar en Stripe el endpoint del flujo de compras y comprobar los eventos habilitados. No se ha registrado un endpoint nuevo en esta preparación.
3. Probar el recorrido completo de compra y entrega con ambos productos, sin cobrar a terceros. Confirmar el PDF correcto y que un evento repetido no reenvía el correo. No se ha hecho una compra ni un cargo de prueba en esta preparación.
4. Completar las condiciones de venta y soporte de los productos.
5. Solo después, activar el escenario de compras, los dos enlaces definitivos y commerceEnabled. No habilitar enlaces antiguos de 9.99/14.99.

Nunca guardar claves privadas, secretos de Stripe o tokens de Make en archivos públicos.
