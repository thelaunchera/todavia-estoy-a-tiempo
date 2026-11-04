# Reglas del Studio: demos terminados

Estas instrucciones se aplican al Estudio de Control, en especial a `src/FinishedDemos.tsx` y sus bibliotecas de recursos.

## Regla obligatoria

Cuando la propietaria termine un demo y pida guardarlo en **Studio → Demos terminados**, entregar y guardar **TODO JUNTO**, en la ficha del mismo demo:

1. Enlace funcional a la web terminada y enlace correcto a su repositorio/rama.
2. Todas las fotografías individuales aprobadas que se usen en el demo, con URL directa del archivo, nombre, ubicación en la página y vista previa. No reemplazar imágenes de cliente por otras sin autorización.
3. El prompt original de cada foto si existe. Si no está conservado, no inventarlo ni presentarlo como original: etiquetar una instrucción reconstruida de referencia.
4. Todos los pasos secuenciales de reconstrucción de la web, con prompt completo para copiar, qué mostrar en pantalla y explicación humana de lo que se hace.
5. Herramientas para abrir foto y copiar enlace, prompt y pasos desde el mismo **Kit completo**.

Nunca marcar un nuevo demo como **terminado** con `photos` o `promptsFor` vacío/ausente. Los dos campos son obligatorios en el tipo `Demo`. Para proyectos que comparten web, como Casa Brownie con y sin video, se puede compartir la galería pero no perder el paso de video.


## Flujo obligatorio para cada demo NUEVO (acordado el 4 de noviembre de 2026)

Cuando la propietaria diga **«haz un demo»**, completar el mismo proceso en este orden:

1. **AppDeploy (creación):** producir el sitio y probar la experiencia completa, especialmente el móvil. AppDeploy es el espacio inicial de construcción, no el destino final del proyecto.
2. **GitHub (publicación canónica):** llevar el código y todos los assets originales al repositorio de demos de The Launch Era, preferentemente `thelaunchera/the-launch-era-new-website-` → `public/demos/<slug>/`. Si el proyecto ya tiene repositorio propio aprobado, no crear una copia incompatible: preservar la fuente y registrar su URL exacta. Verificar que se pueda abrir la web **publicada**, no solo el código.
3. **The Launch Era Studio (registro):** crear una ficha única en `src/FinishedDemos.tsx` → «Demos terminados» con nombre, portada, demo publicado, repo/rama correcta, carpeta Google Drive por marca, fotos individuales, prompts de cada foto (originales solo si existen), pasos y prompts completos de reconstrucción. Actualizar `src/finished-demo-resources.ts` y las colecciones correspondientes. No considerar completado si falta una foto aprobada, enlace o instrucción.
4. **Aula (opción, NO publicación automática):** toda ficha de demo conceptual o educativo debe incluir el control existente `ClassroomDemoPublication` con el botón **«Agregar al Aula»**. El estado inicial será **«No añadido al aula»**; solo publicar en el Aula cuando la propietaria pulse esa opción. Al activar, sincronizar recursos y mostrar **«Quitar del Aula»**; preservar las fotos y prompts en Studio si se desactiva. Nunca compartir proyectos reales de clientes, datos o flujos operativos sin autorización explícita.

El orden es **AppDeploy → repositorio/publicación GitHub → Studio → opción de Aula**. No omitir pasos, no confundir Studio con el Lab comercial y no publicar un demo en el Aula por el solo hecho de registrarlo en Studio.

## Implementación

- Alta de demo y asignación de fotos/pasos: `src/FinishedDemos.tsx`.
- Referencias y pasos reconstruidos: `src/finished-demo-resources.ts`.
- Guías originales existentes: `src/demo-rebuild-prompts.ts`, `src/aftr-rebuild-prompts.ts`, `src/soluna-rebuild-prompts.ts`, `src/ivory-bloom-rebuild-prompts.ts`.
- Fotos aprobadas con sus prompts específicos: `src/soluna-photos.ts`, `src/ivory-bloom-photos.ts`.
- Verificar siempre `node --test tests/finished-demo-kits.test.mjs`, `npm run test:classes` y `npm run build` antes de dar por completada la publicación. `.github/workflows/pages.yml` comprueba el kit antes de publicar.

No mezclar proyectos reales con demos: los datos de un cliente y sus formularios operativos **no se usan para pruebas**, ni se comparten sus datos privados. Fotos de portfolio de cliente solo como referencia autorizada; no copiar identidades ni afirmaciones no aprobadas.

**Criterio de terminado:** la misma ficha permite encontrar fotos individuales, prompts de cada foto, pasos y prompts de construcción, enlace de vista final y fuente. Revisar que todas las fotos abran y que el despliegue haya pasado las pruebas.
