import {useState} from 'react';
import {BookOpen, Clipboard, CheckCircle2, ExternalLink, ShieldCheck, Globe2} from 'lucide-react';
import './connectors-lesson.css';

type Guide={name:string;level:string;cost:string;why:string;steps:string[];prompt:string;url:string;warning:string};
const guides:Guide[]=[
{name:'AppDeploy',level:'1 · Publicar',cost:'Gratis para empezar; sujeto a límites del plan.',why:'Convertir textos y fotografías en una web pública con dirección HTTPS, sin comprar dominio.',
 steps:['Abre ChatGPT y busca AppDeploy entre los plugins disponibles. Conecta la cuenta si tu plan lo permite.','Abre tu carpeta de proyecto: textos aprobados y tres fotografías separadas.','Pega el comando, adjunta las imágenes y pide que construya la web.','Abre la dirección HTTPS resultante en teléfono y computadora. Comprueba el menú y los botones.','Guarda la URL, la versión y el prompt en 05_WEB; no habilites compras ficticias.'],
 prompt:'Usa AppDeploy para crear y publicar una página de presentación para Casa Brownie, ejemplo ficticio de brownies tradicionales. Usa MIS textos y MIS tres fotos [ADJUNTOS]. Secciones: portada, galería, información, preguntas y botón que baja a contacto informativo. Debe funcionar en móvil. No añadas pagos, formulario de datos, cuentas de clientes ni funciones simuladas como reales. Muestra DEMO · SIN COMPRAS, prueba la navegación y dame la dirección pública HTTPS. Conserva la versión anterior antes de editar.',
 url:'https://appdeploy.ai/faq',warning:'No necesitas comprar dominio para compartir la primera versión. Un dominio personalizado puede requerir otro plan.'},
{name:'Stripe en Estados Unidos',level:'2 · Cobrar más adelante',cost:'Sin mensualidad estándar; cada transacción real tiene comisiones.',why:'Aceptar pagos para un negocio y un producto permitidos, sin programar un sistema de tarjetas.',
 steps:['Entra a Stripe y crea tu cuenta con tus datos reales, dentro de su página segura.','Antes de cobrar, verifica elegibilidad de tu tipo de negocio, identidad, domicilio y cuenta bancaria según te solicite Stripe.','En el panel busca el entorno de prueba. Crea un producto permitido y un enlace de pago de prueba.','Prueba un pago exitoso y uno rechazado; confirma el estado dentro de Stripe, no por la pantalla de gracias.','Solo si todo está verificado, decide si activar el enlace para un negocio REAL; Casa Brownie sigue siendo una demostración sin pedidos.'],
 prompt:'Estoy en Estados Unidos y quiero aprender a usar Stripe para un producto real y permitido. Explícame los requisitos generales y dónde completar la verificación DENTRO de Stripe, sin pedirme datos de identidad o bancarios aquí. Guíame para crear un enlace de pago de PRUEBA y reconocer un pago confirmado o rechazado. No actives cobros reales por mí.',
 url:'https://stripe.com/payments/payment-links',warning:'No hace falta una LLC en todos los casos, pero Stripe comprueba identidad, actividad y elegibilidad. No recopiles tarjetas en tu propia página.'},
{name:'Make + Gmail',level:'3 · Correos sencillos',cost:'Make tiene plan gratis limitado; Gmail personal también tiene límites de envío.',why:'Organizar confirmaciones sin comprar dominio ni enviar correos manualmente.',
 steps:['Abre Make → Create a new scenario y añade Stripe como disparador para un pago verificado. Si solo practicas, deja la automatización desactivada.','Añade un filtro: continuar únicamente con pago exitoso. Comprueba el ID de pago o evento para no mandar dos veces el mismo correo.','Pulsa el signo + del escenario, busca Gmail y selecciona Send an email. Usa el módulo actual de Gmail, no la versión antigua.','Pulsa Create a connection → Sign in with Google y autoriza la cuenta que tú controlas. Si Google no autoriza, revisa permisos con la guía oficial; no copies claves ni contraseñas en ChatGPT.','En To selecciona el correo del comprador del evento verificado; en Subject escribe la confirmación; en Body coloca el texto y el enlace de entrega que realmente exista.','Ejecuta Run once con un evento de prueba y TU correo; revisa que no se envíe con pagos rechazados y que no haya duplicados. Activa solo después de comprobar todo.'],
 prompt:'Enséñame un escenario sencillo y SIN ACTIVAR en Make: Stripe con pago confirmado → filtro de pago exitoso y control de duplicados → Gmail Send an email. Explícame qué escoger y cómo mapear To, Subject y Body, primero con mi propio correo de prueba. Revisa cómo evitar envíos después de un pago rechazado. No envíes correos ni cambies mi cuenta por mí.',
 url:'https://apps.make.com/gmail-modules',warning:'Utiliza una cuenta separada para el negocio si es posible. Gmail no es un servicio de envíos masivos; puede limitar o suspender el envío por abuso. Para cuentas personales, Google documenta límites de hasta 500 mensajes/destinatarios por día, pero pueden aplicarse límites menores.'},
{name:'Conectores de ChatGPT',level:'Opcional',cost:'Disponibilidad según plan y cada servicio.',why:'Conectar tus propias herramientas para que ChatGPT te guíe y, con permiso, ejecute acciones.',
 steps:['Abre el directorio de plugins de ChatGPT desde su menú o Configuración → Plugins.','Busca AppDeploy, Make o Supabase, y revisa permisos antes de conectar tu cuenta.','Para Gmail puedes usar la conexión de Make sin necesidad de conectar tu bandeja personal directamente a ChatGPT.','Pide primero explicar y preparar, sin publicar, cobrar ni enviar correos. Si el plugin no aparece, continúa desde la web de la herramienta.'],
 prompt:'Ayúdame a revisar qué conectores tengo disponibles para crear mi primera web con AppDeploy, preparar pagos con Stripe y hacer correos con Make y Gmail. Empieza explicándome qué permisos necesita cada uno y prepara los pasos SIN enviar nada, cobrar ni cambiar configuraciones.',
 url:'https://help.openai.com/',warning:'Conectar no significa que el trabajo esté configurado o probado; cada acción necesita permisos y comprobación.'},
{name:'Supabase',level:'Solo si creces',cost:'Plan gratuito con límites de uso e inactividad.',why:'Guardar datos y cuentas de usuarios si tu proyecto realmente lo necesita.',
 steps:['Pregunta primero: ¿voy a guardar contactos, permitir inicio de sesión o mostrar información privada a cada cliente?','Si la respuesta es no, termina tu web con AppDeploy y no crees ninguna base de datos.','Si es sí, define qué información guardarás, de quién es y quién puede verla.','Estudia las reglas de seguridad de las filas (RLS). Cada persona debe ver solo sus propios datos.','Pide una propuesta antes de crear tablas y no pongas claves secretas en lo visible de tu web.'],
 prompt:'Mi web [DESCRIBE LA IDEA] quizá necesite guardar datos. Pregúntame primero si necesito usuarios, formularios o información privada. Si no necesito base de datos, dímelo claramente. Si sí, diseña una solución mínima con Supabase, permisos por usuario, seguridad RLS y una prueba de privacidad. No ejecutes SQL ni crees servicios todavía.',
 url:'https://supabase.com/pricing',warning:'El backend no es obligatorio para una web informativa; añadirlo sin necesidad aumenta trabajo, riesgos y costes.'},
{name:'Dominio propio con Namecheap',level:'Para después',cost:'Dominio y renovación son de pago; las promociones cambian.',why:'Elegir una dirección de marca cuando ya existe una página que funciona.',
 steps:['Publica primero con la URL gratuita de AppDeploy: esa dirección ya se puede compartir.','Piensa un nombre corto y comprueba que no infrinja una marca existente.','Busca el nombre en Namecheap y compara precio del primer año, renovación e impuestos/tasas.','Antes de pagar, comprueba si TU plan de alojamiento admite dominio propio y qué registros DNS te indicará.','Guarda el recibo y la fecha de renovación en 07_GASTOS, sin almacenar contraseñas en la carpeta compartida.'],
 prompt:'Quiero elegir un nombre para mi pequeño negocio [IDEA]. Propón 10 nombres claros en español e inglés; no afirmes que un dominio está disponible. Dime cómo comprobar marca, precio inicial, renovación, privacidad del registro, DNS y compatibilidad con AppDeploy antes de comprar.',
 url:'https://www.namecheap.com/domains/',warning:'El dominio es opcional. No lo compres hasta confirmar que te gusta el nombre y que puedes conectarlo a tu sitio.'}
];
const projectFolders=[
 ['00_IDEA','Oferta, público y objetivo de la página.'],
 ['01_TEXTOS','Titular, descripción, preguntas y texto del botón aprobados.'],
 ['02_FOTOS','HERO, PRODUCTO y DETALLE por separado, con nombres claros.'],
 ['03_PROMPTS','Instrucciones utilizadas y versiones que sí funcionaron.'],
 ['04_DISENO','Colores, tipografías y referencias propias.'],
 ['05_WEB','Enlace publicado y copia de la versión revisada.'],
 ['06_PRUEBAS','Capturas de teléfono, botones, formularios y pendientes.'],
 ['07_GASTOS','Costes, renovaciones y recibos, sin claves ni contraseñas.']
];
export default function ConnectorsLesson(){
 const [selected,setSelected]=useState(0);
 const [copied,setCopied]=useState(false);
 const [example,setExample]=useState<'simple'|'ventas'>('simple');
 const guide=guides[selected];
 async function copy(){try{await navigator.clipboard.writeText(guide.prompt);setCopied(true);}catch{setCopied(false);}}
 return <section id="class-connectors-workshop" className="connectors-lesson" aria-label="Explicación privada para preparar las grabaciones">
  <header className="connectors-heading"><span><BookOpen size={16}/> GUÍA PRIVADA PARA GRABAR · NIVEL PRINCIPIANTE</span><h3>Cómo funciona una web y cómo tenerlo todo en orden.</h3><p>Un proyecto, un recorrido y herramientas fáciles. Todo se explica con el ejemplo ficticio de Casa Brownie, que no vende ni recibe pedidos.</p></header>
  <div className="connectors-organization">
    <h4>Cómo grabar el bloque extra de Make, seguridad y legales</h4>
    <p><b>Make gratis:</b> máximo 2 escenarios activos, 1,000 créditos/mes, ejecuciones programadas con un intervalo mínimo de 15 minutos y un máximo de 5 minutos por ejecución. Los eventos de webhook pueden llegar al instante. No prometas que todas las funciones o conexiones de ChatGPT son gratuitas.</p>
    <p><b>Enseña dos situaciones reales:</b> 1) una nueva respuesta de Google Forms aparece en Sheets y Gmail te avisa; 2) Stripe confirma un pago permitido, Make verifica el estado y evita duplicados antes de pedir a Gmail una confirmación. Deja ambos escenarios sin activar durante la demostración.</p>
    <p><b>Seguridad:</b> explica en una escena por qué se usa un gestor de contraseñas, verificación en dos pasos y secretos protegidos. Una clave API secreta no se pega en ChatGPT, capturas o frontend. Si se filtra, debe revocarse desde su proveedor.</p>
    <p><b>Footer legal:</b> mostrar nombre del negocio, contacto verificable, privacidad para datos recopilados, términos/devoluciones si corresponden y cookies según seguimiento y normativa. Revisar enlaces y accesibilidad sin asegurar cumplimiento legal.</p>
    <p><b>Mara:</b> enseña a crear un Proyecto PRIVADO en ChatGPT y pegar las instrucciones de «Mara · tu guía web» disponibles dentro del Centro de alumnos → Materiales. No compartas un mismo proyecto con todos: los proyectos compartidos permiten ver chats y archivos de otras personas.</p>
   </div>
  <div className="connectors-foundation">
   <article><span className="connectors-level">LO QUE SE VE · FRONTEND</span><h4>La cara visible de tu web</h4><p>Son las fotos, los títulos, colores, botones, menú y cómo se acomoda todo en el teléfono. El visitante puede verlo y tocarlo. Un diseño claro ayuda a entender la idea, incluso sin hacer ninguna compra.</p><p><b>Ejemplo:</b> en Casa Brownie ves una fotografía, lees la descripción y tocas «Conoce el proyecto».</p></article>
   <article><span className="connectors-level">LO QUE OCURRE DETRÁS · BACKEND</span><h4>Los procesos que no se ven</h4><p>Si más adelante alguien se registra, paga o recibe un acceso privado, tiene que existir un sistema que compruebe la información y ejecute la acción correcta. Puede estar en servicios como Stripe y Make; no necesitas construir tu propio servidor para una página informativa.</p><p><b>Ejemplo:</b> Stripe confirma un pago real, Make comprueba la condición y Gmail envía una confirmación, solo si todo se configuró y probó.</p></article>
  </div>
  <div className="connectors-compare">
   <div><h4>¿Mi web necesita backend?</h4><p>Elige un caso para saber qué necesitas, sin añadir herramientas porque sí.</p>
    <div className="connectors-choice"><button aria-pressed={example==='simple'} onClick={()=>setExample('simple')} type="button">Solo presentar mi idea</button><button aria-pressed={example==='ventas'} onClick={()=>setExample('ventas')} type="button">Cobrar y enviar confirmación</button></div>
   </div>
   {example==='simple'?<div className="connectors-flow-result"><b>Tu web pública → tus fotos y textos → un botón informativo.</b><p>AppDeploy puede publicar esta primera versión. No se requiere base de datos, cuentas de usuarios ni pagar un dominio.</p></div>:<div className="connectors-flow-result"><b>Página pública → pago alojado por Stripe → pago comprobado → Make → Gmail.</b><p>Son servicios separados con tus permisos. El correo no demuestra el pago: primero hay que verificarlo. No guardes tarjetas ni contraseñas en la parte visible.</p></div>}
  </div>
  <div className="connectors-organization">
   <h4>La carpeta que mantiene tu proyecto organizado</h4><p>En Drive crea una sola carpeta con el nombre de tu negocio y dentro guarda estas secciones. Si cambias una foto o un texto, sabrás exactamente dónde está la versión correcta.</p>
   <div className="connectors-folder-grid">{projectFolders.map(([name,description])=><div key={name}><strong>{name}</strong><span>{description}</span></div>)}</div>
   <p className="connectors-warning"><ShieldCheck size={16}/> <span>Las contraseñas, claves privadas, datos bancarios y números de identificación van en el servicio correspondiente o en un gestor de contraseñas. Nunca en una carpeta compartida, imagen ni prompt.</span></p>
  </div>
  <div className="connectors-path"><div><b>1 · CREAR Y PUBLICAR</b><small>ChatGPT + AppDeploy</small></div><div><b>2 · VENDER SOLO CUANDO ESTÉ LISTO</b><small>Stripe → Make → Gmail</small></div><div><b>3 · AMPLIAR SOLO SI HACE FALTA</b><small>Supabase y dominio opcional</small></div></div>
  <div className="connectors-grid">
   <nav className="connectors-tabs" aria-label="Elegir conexión">{guides.map((item,i)=><button key={item.name} type="button" aria-current={i===selected?'true':undefined} onClick={()=>{setSelected(i);setCopied(false);}} className={i===selected?'selected':''}><strong>{item.name}</strong><small>{item.level}</small></button>)}</nav>
   <article className="connectors-detail">
    <span className="connectors-level">{guide.level}</span><h4>{guide.name}</h4><p className="connectors-why">{guide.why}</p>
    <p className="connectors-cost"><CheckCircle2 size={16}/> {guide.cost}</p>
    <h5>Dónde tocar, paso a paso</h5><ol>{guide.steps.map(step=><li key={step}>{step}</li>)}</ol>
    <div className="connectors-prompt"><div><h5>Texto listo para copiar en ChatGPT</h5><button type="button" onClick={()=>void copy()}><Clipboard size={14}/>{copied?'Copiado':'Copiar instrucciones'}</button></div><p>{guide.prompt}</p></div>
    <div className="connectors-warning"><ShieldCheck size={16}/><span>{guide.warning}</span></div>
    <a href={guide.url} target="_blank" rel="noopener noreferrer" className="connectors-source">Ver ayuda oficial <ExternalLink size={14}/></a>
   </article>
  </div>
  <footer className="connectors-bottom"><Globe2 size={18}/><p><b>El objetivo de esta clase es publicar una primera web que funcione, no aprender todas las herramientas.</b> Primero frontend y organización. Después, solo si es necesario, pagos, automatizaciones y datos. Tarifas y condiciones: revisar antes de grabar.</p></footer>
 </section>;
}
