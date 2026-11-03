export type Brand = 'clase'|'lab';
export type BrandReel = {
  id:string; date:string; title:string; goal:string; voice:string; shots:string[];
  overlay:string; cta:string; cover:string; source?:string; caption:string;
};
export const BRAND_REELS_SECTIONS:Record<Brand,string> = {
  clase:'reels-clase-2026',
  lab:'reels-lab-2026'
};
// Guiones editoriales privados basados en calendario vigente de Notion (noviembre de 2026).
// No son videos publicados. La propietaria graba, edita y aprueba cada Reel.
export const BRAND_REELS:Record<Brand,BrandReel[]> = {
  clase:[
    {
      id:'casa-brownie-movil',date:'2026-11-14',title:'Casa Brownie: ¿cómo se ve en móvil?',
      goal:'Enseñar una comprobación real de la web, sin inventar problemas ni before/after.',
      voice:'En computadora una web puede verse perfecta… y en el teléfono, no tanto. Por eso siempre reviso cómo se lee el título, cómo se ven las fotos y si el botón se encuentra sin esfuerzo. Mira esta parte real de Casa Brownie. Si quieres aprender a hacer tu primera web, la lista de espera está en mi bio.',
      shots:[
        '0–4 s · Graba la pantalla real de Casa Brownie en laptop.',
        '4–10 s · Enseña la vista móvil auténtica. Acércate al título, foto y botón.',
        '10–20 s · Revisa un detalle concreto. Solo muestra una corrección si existe el error real.',
        '20–26 s · Enseña la página móvil comprobada; termina con la lista de espera.'
      ],
      overlay:'EN LAPTOP SE VE BIEN… ¿Y EN EL TELÉFONO?',
      cover:'ASÍ REVISO UNA WEB EN MÓVIL',cta:'Lista de espera de Tu primera web con IA.',
      source:'https://app.notion.com/p/409a68f2ee6e81ec90d4c00492a02070',
      caption:'En computadora puede verse perfecta… pero siempre reviso la versión móvil. Así compruebo el título, las fotos y los botones de Casa Brownie. Si quieres aprender, tienes la lista de espera de Tu primera web con IA en mi bio.'
    },
    {
      id:'cumple-19-web',date:'2026-11-19',title:'Mi regalo de cumpleaños: una web con un prompt',
      goal:'Funnel: demostración real → comentario WEB → correo con UN prompt → invitación suave a la clase. No enseñar tutorial completo.',
      voice:'Hoy es mi cumpleaños y preparé un regalito para ti. Esta web empezó con un solo prompt en ChatGPT. Mira cómo va tomando forma… y aquí está la primera versión. Puedes añadir tus fotos, tus productos y preparar tu propia web para vender. Comenta WEB y te envío el prompt por correo.',
      shots:[
        '0–4 s · Cámara vertical: tú escribiendo en la laptop. Texto: «HOY TE REGALO UN PROMPT».',
        '4–9 s · Plano sobre el hombro. Superponer solo dos líneas del prompt sobre video de la laptop, sin enseñar todo.',
        '9–18 s · Captura de la web real creada con ChatGPT + AppDeploy. Recorre hero, productos y versión móvil.',
        '18–23 s · Enseña fotos/productos reales y botón de contacto. Checkout/membresía solo si están realmente configurados; si no, mostrar como estructura preparada.',
        '23–27 s · Tú a cámara: «Comenta WEB»; texto grande «WEB 💌». No más CTAs.'
      ],
      overlay:'UN SOLO PROMPT → UNA WEB REAL', cover:'UN PROMPT. TU WEB.',
      cta:'Comenta WEB. Entrega por correo de un único prompt; la clase se presenta después dentro del correo.',
      caption:'Hoy cumplo años y quería compartir algo útil contigo. 🎂 Preparé UN prompt para empezar tu website con ChatGPT + AppDeploy, con secciones para fotos, productos, contacto y más. Comenta WEB y te lo mando por correo. 💌',
    },
    {
      id:'algun-dia',date:'2026-11-30',title:'Llevo meses diciendo «algún día»',
      goal:'Conectar la idea guardada en Notas con un resultado real de Casa Brownie y la clase.',
      voice:'Esta web empezó en una nota de mi iPhone. Tenía ideas guardadas en el teléfono, como le pasa a mucha gente. Pero tener una idea y saber cómo mostrarla son dos cosas distintas. Por eso estoy usando Casa Brownie para enseñar todo el proceso. Si quieres hacerlo con tu proyecto, la lista de espera de Tu primera web con IA está en mi bio.',
      shots:[
        '0–4 s · Abre mostrando la web real completa en móvil.',
        '4–10 s · Enseña tus Notas reales sin mostrar datos privados.',
        '10–19 s · Graba un fragmento real de construcción, fotos y cambio entre pantallas.',
        '19–27 s · Muestra hero, sabores y CTA de Casa Brownie. Cierra con la clase.'
      ],
      overlay:'ESA IDEA LLEVA MESES EN MIS NOTAS',cover:'LLEVO MESES DICIENDO «ALGÚN DÍA»',
      cta:'Lista de espera de Tu primera web con IA.',
      source:'https://app.notion.com/p/407a68f2ee6e8125b83ff36388d27335',
      caption:'Esta web empezó en una nota de mi iPhone. Hoy puedo enseñar cómo pasó de idea a una página real. Estoy preparando la clase Tu primera web con IA: lista de espera en bio.'
    }
  ],
  lab:[
    {
      id:'jumm-8-prompts',date:'2026-11-04',title:'Jumm: demo y 8 Master Prompts',
      goal:'Mostrar Jumm real y llevar al freebie de imágenes, no atribuir la web a los 8 prompts.',
      voice:'Mira cómo quedó Jumm. Una idea puede cambiar muchísimo cuando cuidas las imágenes, el estilo y cómo presentas cada detalle. Lo interesante no es hacer una web enorme. Es empezar a mostrar bien lo que tienes. Si quieres mejorar las fotos de tu producto, preparé ocho Master Prompts gratuitos. Están en el enlace de mi perfil.',
      shots:[
        '0–2 s · Muestra el mejor fragmento real del demo de Jumm en teléfono.',
        '2–8 s · Recorre fotografía, texto y diseño del sitio real.',
        '8–15 s · Enseña detalles o una interacción verificada; no simules.',
        '15–20 s · Cierra con «8 MASTER PROMPTS GRATIS · BIO».'
      ],
      overlay:'MIRA EL DEMO QUE HICIMOS',cover:'DE UNA IDEA A UNA WEB QUE SE VE ASÍ',
      cta:'8 Master Prompts gratuitos · enlace en bio.',
      source:'https://app.notion.com/p/40ba68f2ee6e81348e1ae82c2765c1b9',
      caption:'Quería enseñar cómo quedó Jumm ✨. Cuidar imágenes, presentación y detalles cambia mucho una idea. Jumm es un demo. Si quieres mejorar tus propias imágenes, mis 8 Master Prompts están gratis en bio.'
    },
    {
      id:'foto-post',date:'2026-11-23',title:'La imagen ya está. Hagamos el post',
      goal:'Mostrar cómo diseñar con una foto preparada en Content Lab; no decir que el Lab genera fotos.',
      voice:'La foto está linda… pero ¿y ahora qué publico? Te muestro cómo paso de esa imagen a un post que puedo diseñar a mi estilo. La subo al Lab, pongo un título y acomodo la foto para que se lea bien. Así le voy dando forma a la publicación. Si quieres verlo por dentro, el enlace está en mi perfil.',
      shots:[
        '0–3 s · Abre con la pieza terminada, usando un resultado real.',
        '3–10 s · Graba la pantalla subiendo una foto real al editor.',
        '10–22 s · Agrega título y ajusta composición, únicamente con funciones verificadas.',
        '22–30 s · Muestra el post final y «CONOCE CONTENT LAB».'
      ],
      overlay:'LA FOTO ESTÁ LINDA… ¿Y EL POST?',cover:'LA FOTO YA ESTÁ. HAGAMOS EL POST',
      cta:'Conoce Content Lab · enlace en bio.',
      source:'https://app.notion.com/p/40ba68f2ee6e8140a678eecd776cc056',
      caption:'Una foto bonita no significa que ya tengas el post. Me gusta probar título, encuadre y estilo antes de publicar. Así lo hago en Content Lab. Puedes conocerlo desde el enlace en mi perfil.'
    }
  ]
};