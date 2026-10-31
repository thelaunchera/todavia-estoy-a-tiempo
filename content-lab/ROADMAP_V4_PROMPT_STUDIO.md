# Content Lab — Roadmap técnico y comercial

**Versión:** Prompt Studio 4.0 — 31 octubre 2026. **Objetivo:** post editorials más reales, prompts libres y producto que se pueda vender sin promesas falsas. Los 8 Master Prompts gratuitos en `/content-lab/prompts/` se mantienen públicos; estas 30 recetas nuevas pertenecen al área privada autenticada.

## Prioridad 1 — Implementado en esta entrega (sujeto a QA real en iPhone)

- [x] Biblioteca de 30 recetas originales, 12 categorías, cada una con texto EN/ES y filtros.
- [x] Prompt Helper sin IA que compone: instrucción libre primero, sujeto, fondo, estilo, cámara, iluminación, fidelidad y «evitar». No consume créditos.
- [x] Biblioteca privada con guardar, favoritos, eliminar y recargar por usuario y marca. Política RLS comprueba UID y compra activa/administradora.
- [x] «Usar en Studio» envía el prompt y los controles al generador 1 Photo → 9 Posts.
- [x] Generación directa y grid-image reciben texto del usuario: ya no se usa un prompt fijo en las fotos de prueba. Brand Kit sigue aplicándose. Texto de títulos/etiquetas se añade aparte como capas editables, no se fabrica dentro de fotos.
- [x] Ajuste de fidelidad respaldado por el parámetro `guidance` real de FLUX.2 Klein 4B, dentro de límites acotados. Los controles estéticos restantes son instrucciones de texto, **no sliders reales de cambio físico ni preservación perfecta**.
- [x] Cuatro variaciones desde la fotografía de referencia original, una generación con confirmación de un crédito cada una. No afirmar que inpainten la salida previa.
- [x] Guía de uso bilingüe y versión responsive, conservar las fotos originales.
- [x] Pruebas automatizadas de templates, RLS, rutas privadas, composición y límites.

## Prioridad 2 — Antes de vender el Studio

- [ ] Realizar QA fotográfico con al menos tres referencias reales: retrato humano, producto con empaque/etiqueta y captura de una app. Evaluar 10 tomas comparadas con prompt libre, sin alterar logos ni rostros, y documentar tasa de éxito/fallo.
- [ ] Verificar en iPhone los inputs, copiar, guardar, restaurar, pasar al editor y exportar PNG. Validar 2 cuentas de compradores separadas, auditoría de acceso y que nadie puede consultar prompts/fotos ajenos.
- [ ] Medir neuronas reales en Cloudflare, tokens y costos promedio de flujos repetidos. El límite interno por compras **NO equivale a neuronas**.
- [ ] Configurar correos OTP reales y completar Stripe LIVE $10 → Make → Supabase → Resend → login, con compra de prueba y reversión, antes de activar el checkout.
- [ ] Traducción completa del resto del Studio (el Prompt Studio sí usa inglés/español según marca), además de precios/FAQ/legal/reembolsos/licencia de IA.
- [ ] Monitorear gastos con tope financiero, protección contra abuso, alertas y exclusión de costosas peticiones concurrentes.

## Prioridad 3 — Después de QA, no prometer como implementado

- [ ] Edición localizada de imagen (*inpainting*) y eliminación de fondo con un proveedor que lo soporte, contrastando calidad y costos por generación.
- [ ] Generador de referencias visuales con análisis de color, composición y coherencia del empaque, sin promesas de réplica exacta de marcas de terceros.
- [ ] QA de defectos con visión IA por demanda y **costo explícito**, incluyendo opción de revisión manual y límites para evitar errores de detección.
- [ ] Packs de recarga Stripe + Make y wallet privada con historial, devolución, caducidad comercial definida.
- [ ] Historial de versiones de prompts, carpetas y duplicación entre marcas **propias**, con migración segura de ownership.
- [ ] Suite e2e iOS/PWA y accesibilidad, pruebas A/B de onboarding y tasa de exportaciones completas.

## Políticas que no cambian

- Precio planificado: $10 USD pago único. Créditos de IA finitos incluidos (actualmente 60 fotos y 30 creativos por cuenta) con topes diarios, y diseño local sin consumir créditos. Venta no activada.
- Gratis: 8 Master Prompts públicos, no acceso abierto a datos privados ni prompts guardados.
- Fotos fieles: usar captura/producto/rostro original en Canvas cuando se necesite exactitud. Los modelos generativos pueden cambiar detalles aunque el prompt los prohíba.
- Conservación de proyectos: GitHub Pages + Supabase privado, no AppDeploy; no mezclar las marcas ni el podcast Studio.
