/* Studio privado de The Launch Era. Solo texto: nada se ejecuta ni se publica. */
export type DemoRebuildPrompt = {title:string;step:string;prompt:string};
export const demoRebuildPrompts: Record<'casa-brownie'|'crumb', DemoRebuildPrompt[]> = {
  "casa-brownie": [
    {
      "title": "00 · Inicio desde la página vacía",
      "step": "Preparación",
      "prompt": "Estamos trabajando en una app DE PRÁCTICA que ya está abierta en AppDeploy. No modificar ni clonar la web oficial https://thelaunchera.com/demos/casa-brownie/ ni ningún sitio existente. Crear el ejemplo ficticio Casa Brownie desde cero y mostrar primero una vista previa, sin desplegar todavía. Usar español latino, composición editorial humana, fondo marfil #f7f0e8, chocolate #422419, detalles rosa cacao, titulares serif grandes, textos DM Sans y una nota manuscrita mínima. Sin flechas decorativas, plantillas genéricas ni iconos de estrella verde. Preparar únicamente estas secciones y en este orden: aviso DEMO, menú, hero, banner continuo, seis sabores, regalos, historia, entrega Miami, cierre y footer. Sitio informativo con carrito y modales simulados, nunca cobros, pedidos reales ni mensajes enviados. El video es un BONO posterior, NO en la primera versión. Trabajar una sección por instrucción y conservar lo aprobado."
    },
    {
      "title": "01 · Identidad y menú",
      "step": "Header",
      "prompt": "En la app de práctica Casa Brownie construye solo el header con logo ORIGINAL de líneas finas: tejado de casita y corazón, texto Casa Brownie, subtítulo exacto PEQUEÑOS PLACERES · GRANDES MOMENTOS. Barra superior discreta con CASA BROWNIE · PROYECTO DE EJEMPLO y DEMO EDUCATIVA · SIN PEDIDOS NI PAGOS REALES. Menú Inicio, Nuestros brownies, Nuestra historia, Entrega en Miami; búsqueda de sabores, bolsa de demostración con contador 0 y menú móvil accesible. Colores marfil y cacao y tipografía editorial. No copiar logos ajenos. No tocar las demás secciones. Comparar contra https://thelaunchera.com/demos/casa-brownie/."
    },
    {
      "title": "02 · Hero estático exacto",
      "step": "Portada sin video",
      "prompt": "Crear SOLO el hero de Casa Brownie. A la izquierda: pequeño PARA LOS MOMENTOS QUE IMPORTAN, título Brownies hechos en casa (en casa con acento manuscrito muy discreto), texto: Para una visita, un regalo sencillo o una tarde para compartir. A veces, un detalle pequeño dice mucho. CTA Descubrir sabores enlazando a la galería. Bajo el CTA, cuatro pequeñas cualidades: DETALLES CON CARIÑO / PARA COMPARTIR / IDEALES PARA REGALAR / MIAMI LOCAL; y una pequeña imagen editorial lateral solo si hay espacio. A la derecha, usar exactamente la FOTO ESTÁTICA aprobada del archivo hero-brownies.webp, disponible en https://thelaunchera.com/demos/casa-brownie/assets/hero-brownies.webp. No usar video ni inventar otra foto. Para móvil, mostrar la foto antes del texto; en tablet dejar aire y evitar cortar producto o botones. Comparar con https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video."
    },
    {
      "title": "03 · Fotografías de los seis sabores",
      "step": "Fotografía",
      "prompt": "Prepara seis imágenes de producto independientes y realistas, no un collage. Para lograr la versión igual a la referencia, usa los seis archivos aprobados que se adjuntarán en AppDeploy, sin regenerarlos automáticamente: https://thelaunchera.com/demos/casa-brownie/assets/sabor-clasico.webp, https://thelaunchera.com/demos/casa-brownie/assets/sabor-nuez.webp, https://thelaunchera.com/demos/casa-brownie/assets/sabor-dulce-de-leche.webp, https://thelaunchera.com/demos/casa-brownie/assets/sabor-frambuesa.webp, https://thelaunchera.com/demos/casa-brownie/assets/sabor-oreo.webp, https://thelaunchera.com/demos/casa-brownie/assets/sabor-especial.webp. Si todavía no están adjuntados, solicita cada archivo antes de construir y no uses fotografías de terceros. Misma escala visual, bordes limpios, iluminación cálida; las texturas y toppings deben coincidir con el nombre. Conserva las imágenes sin mosaicos ni flores de relleno."
    },
    {
      "title": "04 · Banner y catálogo",
      "step": "Seis brownies",
      "prompt": "En la app de práctica coloca bajo el hero una banda continua animada de desplazamiento horizontal, de estilo cacao, con los mensajes HECHOS PARA COMPARTIR / UN DETALLE PARA ALGUIEN ESPECIAL / PEQUEÑOS PLACERES, GRANDES MOMENTOS / MIAMI · DEMO EDUCATIVA. A continuación sección Un sabor para cada ocasión, texto ELIGE EL QUE MÁS TE LLAME y seis tarjetas con fotografías aprobadas. Orden y nombres exactos: Clásico (El original que nunca falla), Chocolate con nuez (Crujiente y delicioso), Dulce de leche (Suave, cremoso e irresistible), Frambuesa (Un toque frutal que enamora), Oreo (Para amantes de las galletas), Edición especial (Una sorpresa para cada ocasión). Cada tarjeta abre una ficha modal de ejemplo con botón para agregar al carrito ficticio; no checkout ni cobros. Tarjetas consistentes en móvil/tablet/desktop. Inspírate en la versión final https://thelaunchera.com/demos/casa-brownie/."
    },
    {
      "title": "05 · Regalos editoriales y banner doble",
      "step": "Regalos",
      "prompt": "Construye SOLO el bloque de regalos en Casa Brownie con el título exacto Una forma bonita de decir pensé en ti. Tres zonas en desktop: fotografía caja kraft con lazo rosa a la izquierda, texto editorial centrado y foto de bolsa y cajas de Casa Brownie a la derecha. Usa SOLO https://thelaunchera.com/demos/casa-brownie/assets/regalo-lazo-rosa.webp y https://thelaunchera.com/demos/casa-brownie/assets/regalos-bolsa-y-cajas.webp (adjuntar estos dos archivos a la app de práctica). Texto: Para llegar de visita, celebrar algo pequeño o compartir una tarde sin prisa. A veces, lo que más se recuerda es el momento juntos. Botón Conoce la idea. Incorpora una banda animada DOBLE y suave con frases de regalo y compartir, cada fila corriendo en sentido contrario; sin flechas y compatible con movimiento reducido. En teléfono, imágenes legibles, titulares centrados y sin cortar el lazo, las bolsas o el empaque. No dupliques fotos ni crees nuevas secciones."
    },
    {
      "title": "06 · Historia y Miami ficticio",
      "step": "Sobre la tienda",
      "prompt": "Agrega la sección Nuestra historia de Casa Brownie inmediatamente después de regalos. Título Una historia que se comparte. Texto breve y natural acerca de la idea ficticia de imaginar una caja de brownies para compartir, sin afirmar un negocio real. Incluye una tarjeta de ubicación ficticia en Miami con 123 Calle del Cacao y señal visible de que es una dirección inventada. No mapas reales, geolocalización, reseñas falsas ni formularios. Mantén jerarquía tipográfica editorial y adaptación móvil centrada. Referencia https://thelaunchera.com/demos/casa-brownie/."
    },
    {
      "title": "07 · Entrega local y modales",
      "step": "Entrega ficticia",
      "prompt": "Construye SOLO la sección ¿Cómo funciona la entrega? con tres pasos editoriales: Explora, Entrega local, Comparte. Junto a ellos un panel oscuro Entrega local en Miami. CTA para ver información de entrega abre un MODAL informativo, explica que zonas, códigos postales, fechas, costos y horarios reales están pendientes; NO pide ubicación ni dirección. Evita prometer envío verdadero. Mantener el flujo de demostración y contrastes accesibles. Usar referencia https://thelaunchera.com/demos/casa-brownie/#entrega."
    },
    {
      "title": "08 · Carrito de muestra y experiencia",
      "step": "Interacciones simuladas",
      "prompt": "En Casa Brownie implementa únicamente interacciones de muestra: buscar sabor, abrir ficha de cada brownie, seleccionar sabor, agregar/quitar unidades en carrito temporal, abrir/cerrar modales con Escape y gestión de foco, mostrar información de entrega y permitir simular contacto SIN transmisión, correo ni guardado. El CTA final ¿Ya tienes un favorito? Haz la prueba. inicia la experiencia informativa. Aviso permanente DEMO EDUCATIVA · SIN PEDIDOS NI PAGOS REALES. No Stripe, ni Make, ni datos persistentes, ni checkout. Mantener la estructura y las fotografías ya aprobadas de https://thelaunchera.com/demos/casa-brownie/."
    },
    {
      "title": "09 · Footer y créditos",
      "step": "Pie de página",
      "prompt": "Replica en el proyecto de práctica el footer de Casa Brownie: marca y enlaces internos, contacto simulado, redes sociales de vista previa que NO llevan a perfiles reales, avisos legales adecuados para una demo, dirección ficticia claramente marcada y enlace Powered by The Launch Era a https://thelaunchera.com/ centrado y discreto al final. Nada de textos legales inventados que aseguren cumplimiento; ninguna compra ni mensaje enviados. Comprueba cierre de modales, navegación y legibilidad del footer a 390px, 820px, 1024px y 1440px."
    },
    {
      "title": "10 · Revisión con captura",
      "step": "QA sin rehacer",
      "prompt": "Compara la app de práctica Casa Brownie con la referencia https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video sección por sección en móvil 390px, tablet 820px y 1024px, escritorio 1440px: mismo orden, títulos, colores marfil/cacao, archivos de fotografía aprobados, jerarquía de hero, banner, seis tarjetas, regalos, historia, Miami, carrito ficticio y footer. Corrige SOLAMENTE diferencias demostrables, una por vez, sin sustituir logos/fotos ni modificar https://thelaunchera.com/demos/casa-brownie/. No afirmar que son idénticos sin pruebas visuales y funcionales. Solo entregar checklist de diferencias y las capturas."
    },
    {
      "title": "11 · Bono opcional: video en hero",
      "step": "Después del curso",
      "prompt": "BONO, NO para la primera demostración. Parte de la misma versión aprobada CON FOTO ESTÁTICA y agrega solo un hero de video silencioso: video https://thelaunchera.com/demos/casa-brownie/assets/hero-brownies.mp4 con poster https://thelaunchera.com/demos/casa-brownie/assets/hero-brownies.webp; autoplay muted loop playsinline y respaldo estático en caso de error, reducción de movimiento o ahorro de datos. Mantén exactamente la composición, textos, botones, sabores y todas las demás secciones. El resultado de referencia con video es https://thelaunchera.com/demos/casa-brownie/ y sin video es https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video. El clip ya aprobado no necesita regenerarse; verifica derechos antes de reutilización pública. No cambies nada del sitio oficial."
    }
  ],
  "crumb": [
    {
      "title": "00 · Inicio desde página vacía",
      "step": "Preparación",
      "prompt": "Quiero demostrar cómo construir desde una página de práctica VACÍA en AppDeploy una web ficticia llamada CRUMB. No edites la web oficial https://thelaunchera.com/demos/crumb/, ni reutilices una app ya terminada, ni publiques todavía. Idioma visible US ENGLISH natural, no español traducido. Estética boutique premium inspirada en una tienda de cookies editorial: fondo warm ivory #faf7f0, texto #3d2921, chocolate profundo #492e25, acento caramelo #a67a57, serif Cormorant Garamond y DM Sans. Sitio compacto, humano, fotografía real, sin adornos genéricos ni flechas. Estructura exacta: barra anuncio, header, hero fotográfico, franja de frase/CTA, seis sabores, regalos, mini galería de marca, mapa ilustrativo Miami, doble banner, historia, CTA final y footer. Agrega acciones de ejemplo sin checkout/pagos ni datos almacenados; no crear video. Trabaja por secciones y aprueba cada etapa contra https://thelaunchera.com/demos/crumb/."
    },
    {
      "title": "00B · Brand board fotográfico · 14 escenas",
      "step": "Dirección fotográfica · antes de construir",
      "prompt": "Quiero crear UN BRAND BOARD FOTOGRÁFICO PREMIUM para la marca ficticia de cookies CRUMB, como guía visual ANTES de construir la tienda en mi app de práctica de AppDeploy. Si te adjunto un brand board de referencia, respeta su composición; no lo pegues dentro de la web ni lo uses como una sola imagen de catálogo. No modifiques ni publiques la demo oficial https://thelaunchera.com/demos/crumb/. Este paso es SOLO para preparar y mostrar dirección fotográfica. El diseño tiene 14 escenas diferentes y está organizado en TRES FRANJAS de bordes rectos y separaciones finas color marfil, con estética de fotografía comercial editorial auténtica, NO plantilla de Canva ni collage de imágenes de estilo diferente.\n\nIDENTIDAD: escribe el nombre de marca únicamente como «crumb.» (serif café oscuro, punto incluido), manteniendo el mismo logotipo sobre cajas, bolsa, delantal y fachada. Como texto secundario de marca cuando corresponda: «COOKIES FOR A SWEETER WORLD». Paleta uniforme warm ivory, crema, cacao, café espresso y caramelo; luz de tarde cálida natural, sombras suaves, fondo de pastelería real, madera/piedra cálidas. Cookies gruesas y artesanales, muy apetecibles, chocolate derretido y toppings reales; no flores excesivas, solo pequeños detalles sutiles. Las proporciones de producto, empaques y logo tienen que ser coherentes en las 14 tomas. Sin estética plástica, sin render 3D, sin ilustraciones, sin manos deformes, sin textos inventados ni marcas de terceros.\n\nFRANJA SUPERIOR, 4 FOTOS VERTICALES DE MARCA:\n1) Hero de branding: pedestal de piedra con tres grandes cookies apiladas, migas y trozos de chocolate; sobre pared crema el wordmark «crumb.» grande y tagline pequeña; iluminación de boutique cálida.\n2) Caja de regalo color marfil ABIERTA con SEIS cookies de sabores distintos colocadas de forma natural y el logotipo legible en la tapa; papel seda y cinta satinada marrón, sin deformaciones.\n3) Lifestyle: mujer adulta sonriente disfrutando una cookie a punto de morderla, ropa neutra natural, bolsa o caja crumb. en primer plano; fotografía humana auténtica, sin apariencia generada.\n4) Fachada de pequeña boutique de cookies en Miami: rótulo físico «crumb.» y toldo chocolate, escaparate con luz acogedora, arquitectura realista, sin inventar una dirección ni usar una tienda verdadera.\n\nFRANJA CENTRAL, 6 TARJETAS DE SABORES DE IDÉNTICO TAMAÑO, una fotografía cuadrada por tarjeta con nombre EN INGLÉS bien escrito en un margen marfil y una sola línea de descripción corta debajo:\n1) Classic Chocolate Chip: masa dorada y trozos generosos de chocolate negro.\n2) Double Chocolate: masa oscura, chocolate fundido y escamas de sal.\n3) Salted Caramel: caramelo en hilos, pequeños trozos de caramelo y chocolate blanco.\n4) White Chocolate Raspberry: masa rojiza y frambuesas reales con trozos de chocolate blanco.\n5) Nutty Dream: chocolate y nueces tostadas, textura natural y una pizca de caramelo.\n6) Brownie Chip: cookie de cacao oscura con abundantes chunks de chocolate.\nLos seis sabores deben coincidir con el catálogo actual de CRUMB y parecer fotografiados en el mismo estudio, con el mismo encuadre, escala, fondo, luz y apetitosidad. No repetir ni intercambiar fotos. Si la herramienta no logra escribir perfectamente los nombres, entrega las seis fotos SIN texto para añadir luego los títulos mediante diseño tipográfico, sin letras inventadas.\n\nFRANJA INFERIOR, 4 IMÁGENES VERTICALES COMPLEMENTARIAS:\n1) Preparación real: bowl metálico con masa gruesa de cookies, cuchara, chocolate y nueces sobre mesa de cocina cálida.\n2) Packaging regalo: caja ivory cerrada con cinta café satinada, logo «crumb.» frontal, otras cajitas pequeñas y migas.\n3) Bolsa de compras kraft color caramelo con el logo «crumb.» perfectamente centrado, entorno de boutique.\n4) Persona de panadería: manos y torso de alguien con delantal chocolate «crumb.» sosteniendo una bandeja de cookies variadas, gesto natural y entorno real de obrador.\n\nCOMPOSICIÓN Y ENTREGA: tablero editorial limpio con 4 imágenes arriba, 6 tarjetas en medio y 4 imágenes abajo; separadores marfil estrechos, sin marco de navegador, sin flechas, sin sombras de tarjetas, sin muchas flores ni elementos de relleno. Exporta una versión de alta resolución de todo el brand board para mostrar la dirección visual. Después, si se van a construir las páginas, necesitamos los 14 archivos de foto SEPARADOS con el mismo estilo y sin titulares incrustados: no recortar las fotos del tablero para convertirlas en assets porque perderían calidad. Primero muestra SOLO el tablero para aprobarlo; NO crear app, NO sustituir fotos del demo oficial, NO activar checkout, NO desplegar ni publicar."
    },
    {
      "title": "01 · Header y hero completo",
      "step": "Portada boutique",
      "prompt": "En CRUMB práctica construye SOLO anuncio y header: franja superior A little Miami magic, beautifully boxed. Marca tipográfica crumb. con punto, menú Cookies / Gifts / Our Story / Miami y bolsa Bag con contador. Bajo el menú fotografía protagonista de interior boutique sin texto SUPERPUESTO: pared crema lisa sin rótulo ni ramita, vitrinas con cookies y dos búcaros de fondo, logo crumb. SOLO en caja y bolsa. Si estás reproduciendo fielmente la versión aprobada, adjunta las fotos existentes: desktop https://thelaunchera.com/demos/crumb/assets/hero.webp y móvil https://thelaunchera.com/demos/crumb/assets/hero-mobile.webp. Imagen completa: no recortar más cookies, usar altura natural y object-fit contain; tablet 601–1366px también sin altura fija. Debajo de la foto (NUNCA encima) poner texto exacto Big cookies. Beautiful boxes. Made to share. seguido por Shop Cookies y Build Your Box. Espaciado generoso, CTA más bajos, no video. No cambiar las otras secciones."
    },
    {
      "title": "02 · Seis fotografías reales",
      "step": "Catálogo visual",
      "prompt": "Para construir el catálogo CRUMB usa seis fotografías INDIVIDUALES aprobadas, adjuntadas a la app de práctica (no carruseles falsos, no collage): https://thelaunchera.com/demos/crumb/assets/classic.webp, https://thelaunchera.com/demos/crumb/assets/double.webp, https://thelaunchera.com/demos/crumb/assets/caramel.webp, https://thelaunchera.com/demos/crumb/assets/raspberry.webp, https://thelaunchera.com/demos/crumb/assets/nutty.webp, https://thelaunchera.com/demos/crumb/assets/brownie.webp. Una tarjeta por sabor, con fotografía muy apetecible en cuadrado 1:1, masa y toppings correctos, textura realista, fondo editorial coherente. Si faltan archivos, pídemelos antes de crear imágenes alternativas. No reemplazar las fotografías aprobadas. Mantener tamaño uniforme en desktop y móvil y botón Add + bien visible sin tapar la galleta."
    },
    {
      "title": "03 · Sabores, nombres, precios y etiquetas",
      "step": "Los seis sabores",
      "prompt": "Crea sección THE COOKIE EDIT con título Worth every bite. y texto Six flavors, one very good reason to treat yourself. Seis sabores EXACTOS, orden y precios de DEMO: Classic Chocolate Chip $3.50 each; Double Chocolate $4.50; Salted Caramel $5.50 (etiqueta pequeña Special); White Chocolate Raspberry $6.00 (etiqueta New Flavor); Nutty Dream $7.00 (etiqueta Special); Brownie Chip $5.00. Descripciones cortas naturales iguales a la referencia oficial https://thelaunchera.com/demos/crumb/. Tarjetas de fotografías con Add + sobre esquina inferior derecha, etiqueta sutil esquina superior izquierda de solo esas tres tarjetas. No cambiar tamaños entre tarjetas, sin ratings falsos ni checkout. La tabla de precios debe alimentar también el constructor de cajas, no inventar totales."
    },
    {
      "title": "04 · Regalos y cajas",
      "step": "Bloque gifting",
      "prompt": "Crea SOLO la sección Gifts del sitio CRUMB. Composición editorial con foto aprobada https://thelaunchera.com/demos/crumb/assets/brand-gifts.webp y textos: A little gift. Big joy. Explica que las cajas son un detalle para compartir, sin ventas reales. Botón Build Your Gift Box abre el mismo constructor de cajas del menú. Mantén fotografía abundante, fondos ivory/taupe y botones contrastados, sin encabezados en bloques pesados, sin imágenes de stock. La foto no se repite en otra sección; utiliza exactamente el archivo aprobado. Revisa tablet y móvil."
    },
    {
      "title": "05 · Galería compacta de marca",
      "step": "Inside CRUMB",
      "prompt": "Construye sección Inside CRUMB. como una galería compacta de TRES imágenes independientes y diferentes: https://thelaunchera.com/demos/crumb/assets/brand-storefront.webp (fachada), https://thelaunchera.com/demos/crumb/assets/brand-maker.webp (trabajo de elaboración) y https://thelaunchera.com/demos/crumb/assets/brand-packaging.webp (bolsa/empaque). En computadora tres columnas; en teléfono swipe horizontal suave, no tres fotos enormes apiladas. Fotos con proporciones editoriales, captions pequeños y centrados. No usar brand-tasting.webp aquí ni duplicar hero o regalo. Mantener una experiencia humana, de una boutique ficticia, no fotografías probatorias de una tienda real."
    },
    {
      "title": "06 · Constructor de cajas realmente interactivo",
      "step": "Build Your Box",
      "prompt": "Implementa UN SOLO modal reutilizable Build your box para CRUMB, activado por Bag / Build Your Box / Build Your Gift Box y CTA final. Capacidad seleccionable 3, 6 o 12 cookies (desde $10.50 / $21.00 / $42.00 si todas fueran Classic); las cantidades se agregan con Add + en el catálogo y +/- en el modal, sin exceder capacidad. Mostrar bandeja visual con exactamente 3/6/12 huecos y miniaturas de los sabores elegidos. Precio calculado en centavos usando $3.50,$4.50,$5.50,$6.00,$7.00,$5.00; para una caja mixta usar el precio real de sus unidades. Tres envolturas sin sobrecargo: Ivory Signature, Espresso Sleeve, Ribbon Edition. Añadir nota opcional y preview seguro solo si caja está completa. Anunciar cantidad, error al exceder, navegación teclado, cierre modal. Todo es simulación local: NO pagos, registro de clientes ni backend. Mantener fotos y copy del https://thelaunchera.com/demos/crumb/."
    },
    {
      "title": "07 · Miami ilustrativo, no GPS real",
      "step": "Ubicación",
      "prompt": "Crea la sección We're in your area. para CRUMB como figura editorial de una ruta dibujada en SVG y marcador pulsante que referencia únicamente Miami y surrounding areas. Texto explica que la zona es ILUSTRATIVA, nunca ubicación exacta o cobertura real. Botón Explore Local Delivery abre modal informativo y desde ahí se puede volver a Build Your Box. No pedir ni leer geolocalización, dirección, teléfono o correo; nada de promesas de entregas. Animaciones suaves y respetar prefers-reduced-motion. Comparar contra https://thelaunchera.com/demos/crumb/#delivery."
    },
    {
      "title": "08 · Dos banners animados y la historia",
      "step": "Storytelling",
      "prompt": "Después de la ubicación agrega doble banner continuo: fila superior con FRESHLY BAKED / BEAUTIFULLY BOXED / MADE TO SHARE / MIAMI COOKIES y fila inferior GIFT BOXES / SWEET MOMENTS / COOKIE LOVERS / CRUMB., desplazándose en direcciones opuestas, discreto y con alternativa estática para reducir movimiento. Luego sección Our Story con título exacto It started with a cookie., foto https://thelaunchera.com/demos/crumb/assets/brand-lifestyle.webp, historia breve de una cocina imaginaria en Miami y texto visible que confirme que es ficción. Botón Say hello to CRUMB abre el mismo modal de contacto. Ningún encabezado repetido ni secciones nuevas."
    },
    {
      "title": "09 · Footer, contacto y redes simuladas",
      "step": "Final de página",
      "prompt": "Debajo de la historia añade cierre editorial Make their day. con Build Your Box, que abre el constructor existente. Footer CRUMB: marca crumb., Big cookies. Little moments., navegación interna, Contact Us como BOTONCITO que abre modal (Name, Email, Reason, Message, campos requeridos), dirección ficticia de ejemplo 128 Cookie Lane, Miami, FL 33131 identificada como Fictional address · Not a real storefront y horarios de muestra Tue–Sun 10 AM–6 PM. Instagram y TikTok abren VISTAS PREVIAS de demo, nunca cuentas reales. El formulario valida en pantalla y muestra éxito SIMULADO sin guardar ni enviar. Disclaimers de que no se aceptan órdenes, pagos o mensajes. Pie discreto centrado Powered by The Launch Era enlazando https://thelaunchera.com/. Diseño mobile/tablet/desktop, sin datos falsamente persistentes."
    },
    {
      "title": "10 · Revisión responsive y QA",
      "step": "Comparación final",
      "prompt": "Sin rehacer las secciones, compara cada pantalla de mi app de práctica con https://thelaunchera.com/demos/crumb/. Revisa 360px, 390px, 820px, 1024px y 1440px: hero completo sin bordes de captura y sin recortar contenido extra, fotografía original, texto y dos CTA claramente debajo de ella, seis cards del mismo tamaño, tres etiquetas Special/New Flavor, fotos de regalos, galería de 3 fotos sin repetición, SVG Miami, banners dobles, historia, footer Powered by, modal de cajas 3/6/12 y contacto/redes de muestra. Probar teclado, Escape, precios centavo a centavo, botones Add+, overlays, cierre de modales, y cero envío de información. Corregir solo diferencias verificadas, conservar las fotos originales y NO modificar https://thelaunchera.com/demos/crumb/. Mostrar resumen de faltantes y capturas antes de publicar la práctica."
    }
  ]
};
