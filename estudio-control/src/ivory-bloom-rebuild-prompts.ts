import type {DemoRebuildPrompt} from './demo-rebuild-prompts';
import {ivoryBloomPhotos} from './ivory-bloom-photos';
/** Guía didáctica para reproducir el concepto sin editar el demo publicado. */
export const ivoryBloomRebuildPrompts:DemoRebuildPrompt[] = [
  {
    "step": "Investigación",
    "title": "00 · Concepto y objetivos",
    "prompt": "Investiga las necesidades de una tienda ficticia premium de pasteles de boda en Estados Unidos: cómo mostrar estilos, diferenciar diseños, reducir dudas y conseguir solicitudes de cotización sin checkout. Especifica claramente que ningún pedido está confirmado hasta que la tienda contacte al cliente. Propón un landing editorial mobile-first. No programes todavía.",
    "say": "Antes de diseñar, definimos qué necesita una pareja: ver los cakes, elegir su estilo y preguntar. Como cada pastel se hace a medida, no mostramos un carrito ni cobramos online.",
    "show": "Presentar objetivo, referencias, cuatro preguntas de la cliente y el recorrido foto → galería → inquiry."
  },
  {
    "step": "Brand board",
    "title": "01 · Identidad editorial de boda",
    "prompt": "Define la identidad visual de IVORY & BLOOM, wedding cake atelier ficticio: warm ivory, taupe, blush pink, beige y detalles dorados discretos. Serif editorial sofisticada, cuerpo moderno legible, cinta satinada y pequeñas flores como ornamentos. Nada de emojis, flechas decorativas grandes ni plantillas genéricas. Muestra moodboard, paleta y jerarquía de títulos. No construyas aún la web.",
    "say": "Primero elegimos una dirección de boda que no parezca una plantilla. El marfil y las cintas unen las fotos, pero el protagonista siempre será el cake.",
    "show": "Enseñar colores, tipos de letra, materiales y dos referencias de marcas premium."
  },
  {
    "step": "Fotos individuales",
    "title": "02 · Fotografías individuales del atelier",
    "prompt": "Crea una colección editorial fotográfica coherente para IVORY & BLOOM. Utiliza los 17 comandos individuales de abajo, de uno en uno. Pide siempre UNA imagen en UN archivo, sin collage, sin texto, sin personas cuando la foto sea solo del cake. Mantén consistencia de luz y ambientación, pero asegura que los cakes negros, amarillos, rosas e ivory sean modelos claramente diferentes. Guarda cada foto con el filename indicado.",
    "say": "Ahora hacemos las fotos una por una. Primero el hero y su detalle; después negro, amarillo, rosa, marfil, interior, degustación y celebración. Reviso cada imagen antes de pasar a la siguiente para que no haya cakes repetidos.",
    "show": "Abrir los 17 archivos publicados y mostrar cada prompt, ubicación en el landing y cómo guardar una foto individual.",
    "photoCommands": ivoryBloomPhotos.map(photo=>({title:photo.title,prompt:photo.prompt,imageUrl:photo.url}))
  },
  {
    "step": "Hero",
    "title": "03 · Hero fotográfico desde la entrada",
    "prompt": "Construye el hero de IVORY & BLOOM usando images/hero-cake-artist.webp como foto principal, y images/hero-detail.webp como detalle secundario. La fotografía debe verse desde el primer viewport tanto en móvil como en escritorio; el logo y navegación son compactos. Usa el título ‘Cakes for life’s most beautiful moments’ y CTA ‘Explore Our Cakes’. No pongas a los novios en el hero: la foto de boda se reserva para una sección más abajo. Sin flechas grandes ni espacios vacíos.",
    "say": "El hero debe mostrar el oficio en los primeros segundos. Al abrir en el móvil la foto se ve enseguida; no quiero un bloque de texto enorme que la empuje abajo.",
    "show": "Probar el landing a 375 px, revisar primer scroll y CTA a galería."
  },
  {
    "step": "Galería",
    "title": "04 · Galería sin imágenes repetidas",
    "prompt": "Crea una galería de cakes con fotografías diferentes, sin repetir ninguna foto: black-gold, black-bow, buttercream-yellow, yellow-silk-petals, rose-heirloom-pink, blush-sculptural, romantic-ivory-floral e ivory-floral-classic; añade un diseño azul si ya existe una imagen aprobada del cake solo. Mantén nombres editoriales y filtros accesibles, con opción ‘Inquire About This Design’ que preselecciona el estilo en el formulario. No reutilices la imagen de un mismo pastel con títulos distintos.",
    "say": "Mira cómo el negro con oro, el negro con lazo, el amarillo vintage y el amarillo escultórico no se parecen. Cada foto debe aportar una idea nueva.",
    "show": "Abrir la galería en móvil, comparar cada imagen, cambiar filtros y preseleccionar un diseño."
  },
  {
    "step": "Historia",
    "title": "05 · Celebration / Something Blue",
    "prompt": "Debajo de la galería añade una sección editorial de boda con images/something-blue-wedding.webp: salón de fiesta, novios cortando el cake azul y novia con vestido azul princesa. Acompaña con texto romántico pero concreto sobre momentos especiales. No uses esta foto en el hero. Añade una sección breve del atelier con images/atelier-interior.webp y un proceso de consulta.",
    "say": "Esta foto cuenta la historia después de que la clienta ya vio los diseños. Así el hero se centra en la pastelería y la escena de boda aporta emoción más abajo.",
    "show": "Señalar la ubicación de la pareja debajo de la galería y comprobar que no se repite en el hero."
  },
  {
    "step": "Formulario",
    "title": "06 · Solicitud de pastel sin pago online",
    "prompt": "Crea un formulario ‘Wedding Cake Inquiry’ para IVORY & BLOOM: nombre, email, fecha, cantidad estimada de invitados, estilo, ciudad o salón, preferencias y solicitudes especiales. Debe mostrar todos los campos en UNA columna en iPhone 375px, sin select que se superponga ni calendario gigante; labels accesibles y CTA ‘Send My Inquiry’. Incluye aviso breve de concepto ficticio: el formulario del demo no envía solicitudes y no recoge pagos. No muestres un checkout. Deja un espacio para integrar el contacto real solo cuando exista una tienda real.",
    "say": "Como cada cake es personalizado, el objetivo del formulario es pedir información para una cotización. En este demo no vamos a recibir pedidos ni pagos reales.",
    "show": "Rellenar todos los campos a 375px, confirmar ancho de inputs y revisar mensaje de simulación, sin enviar datos reales."
  },
  {
    "step": "QA",
    "title": "07 · Revisión final y versión móvil",
    "prompt": "Audita IVORY & BLOOM en 375px, 768px y escritorio. Comprueba que el hero muestre fotografía en el primer viewport, que no haya fotos duplicadas en la galería, que la pareja aparezca solo abajo, que las imágenes no se corten mal, que los botones sean cómodos, que el formulario esté en una sola columna y que enlaces y navegación funcionen. Conserva el aviso de concepto ficticio y la ausencia de pago online. No edites otros demos.",
    "say": "Terminamos como se termina una web de verdad: abriéndola en el teléfono, tocando los botones, comprobando cada foto y revisando el formulario.",
    "show": "Abrir versión móvil y desktop, probar la galería, selección de estilo, menú, desplazamiento y formulario."
  }
];
