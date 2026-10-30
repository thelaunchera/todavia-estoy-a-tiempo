/** Preparación de pantalla por video. Un único negocio ficticio: brownies tradicionales. */
export type RecordingStart = {
  tabs:string[]; actions:string[]; savedPoint:string; finish:string; readyPrompt:string;
};
export const OFFICIAL_DEMO_URL = 'https://thelaunchera.com/demos/casa-brownie/';
export const RECORDING_EXAMPLE = 'Casa Brownie · concepto ficticio de brownies tradicionales · web informativa sin pedidos ni cobros';
export const recordingStarts:Record<string,RecordingStart>={
 '00':{
  tabs:['Versión de clase SIN VIDEO: https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video','Demo final CON video: reservar enlace solo para el bono','Carpeta de materiales en Drive','Biblioteca de prompts'],
  actions:['Primero abre la versión SIN VIDEO. Explica que el demo ya estaba creado y que ahora vas a reconstruir una práctica desde cero. NO muestres el video animado en la introducción: lo revelaremos únicamente en el bono final.','Muestra fotos, textos y botón: eso es frontend, la parte visible.','Explica que guardar datos, confirmar pagos y enviar correos son procesos internos (backend); una web informativa no los necesita.','Abre la carpeta de trabajo y enseña qué documento completará el estudiante.'],
  savedPoint:'Guarda captura 00_INICIO.png de la página tal como está antes de explicar.',
  finish:'Termina cuando el alumno sepa qué web va a construir y haya abierto su carpeta.',
  readyPrompt:'Estoy preparando Casa Brownie, una web informativa de una página para un concepto ficticio de brownies tradicionales. La usaremos para aprender a crear una web desde cero; no tendrá pedidos ni pagos reales. Hazme cinco preguntas claras sobre el objetivo de la página, a quién va dirigida, qué fotografías necesito, qué botón informativo tendrá y qué datos faltan por comprobar. No inventes precios, ingredientes, testimonios, ventas, permisos ni entregas.'
 },
 '01':{
  tabs:['ChatGPT, conversación de Casa Brownie','Drive, carpeta única CASA_BROWNIE','Cuaderno: 01_FICHA_DE_OFERTA'],
  actions:['En Drive crea una carpeta llamada CASA_BROWNIE y dentro ocho subcarpetas: 00_IDEA, 01_TEXTOS, 02_FOTOS, 03_PROMPTS, 04_DISENO, 05_WEB, 06_PRUEBAS, 07_GASTOS.','Abre ChatGPT y escribe «Casa Brownie» como negocio de ejemplo ficticio.','Pega el prompt de oferta preparado, envíalo y separa lo confirmado de lo pendiente.','Guarda 01_FICHA_DE_OFERTA en 00_IDEA; conserva secretos fuera de carpetas compartidas.'],
  savedPoint:'Antes de enviar el mensaje, copia el texto del prompt a 01_PROMPT_INICIAL.txt para repetir la toma.',
  finish:'Termina al guardar la ficha, con los datos conocidos separados de los pendientes.',
  readyPrompt:'Mi proyecto es Casa Brownie, una marca ficticia de brownies tradicionales. Quiero una web de presentación de una página, sin compras ni reservas activas. Público: personas que quieren conocer un producto artesanal. Acción: leer los detalles y contactar cuando exista información real. Crea una ficha de oferta y separa hechos, decisiones creativas y datos pendientes. No inventes ingredientes, disponibilidad, precios, reseñas ni permisos.'
 },
 '02':{
  tabs:['Tres referencias concretas guardadas en 02_REFERENCIAS: URL, captura y observación (comprobar antes de grabar)','ChatGPT','Documento 02_REFERENCIAS'],
  actions:['Abre tres ejemplos y compara únicamente hero, organización y versión móvil.','Escribe una observación y algo que NO vas a copiar de cada página.','Pide a ChatGPT una paleta y estilo propio para Casa Brownie y guárdalos.'],
  savedPoint:'Guarda URLs y capturas de las tres referencias antes de grabar; no dependen de que sigan abiertas.',
  finish:'Termina con paleta, composición y tres reglas visuales aprobadas.',
  readyPrompt:'Estoy diseñando Casa Brownie, una web ficticia de brownies tradicionales. Tras revisar estas tres webs y anotar lo que me gustó [PEGAR MIS OBSERVACIONES], propón una dirección editorial propia: colores, fotografía, tipografías y jerarquía en móvil. No copies textos, fotos, marcas ni estructura completa.'
 },
 '03':{
  tabs:['ChatGPT con generación de imágenes disponible','Paleta y referencias de 02_REFERENCIAS','Carpeta 02_FOTOS'],
  actions:['Pega el prompt de imagen horizontal y genera el hero.','Revisa manos extrañas, etiquetas ficticias y letras dibujadas.','Usa el hero como referencia para los seis sabores y dos regalos. Demuestra un archivo y explica cómo repetir el mismo método, una imagen por solicitud.'],
  savedPoint:'Guarda HERO_ORIGINAL.png antes de producir variaciones; podrás regresar a él.',
  finish:'Termina con hero estático, seis sabores y dos regalos guardados por separado; muestra una generación completa y explica la repetición del método.',
  readyPrompt:'Crea una fotografía editorial realista para Casa Brownie, un proyecto ficticio de brownies tradicionales. Formato horizontal 16:9, luz natural lateral, mesa de madera clara, brownies simples de chocolate, fondo cálido con espacio libre para un título externo. Sin texto impreso, logos, personas, empaques con ingredientes inventados ni reseñas.'
 },
 '04':{
  tabs:['ChatGPT','01_FICHA_DE_OFERTA','03_TEXTOS_DE_WEB'],
  actions:['Pega la ficha de Casa Brownie, diferenciando lo confirmado de lo pendiente.','Pide hero, presentación, galería, preguntas frecuentes y contacto informativo.','Elimina palabras vacías y cualquier promesa sobre disponibilidad, precio o ingredientes.'],
  savedPoint:'Duplica la primera versión de textos antes de editar para mostrar un antes y después auténtico.',
  finish:'Termina con el título, subtítulo, secciones y CTA informativo guardados.',
  readyPrompt:'Para Casa Brownie, web informativa de un concepto ficticio de brownies tradicionales, escribe un título claro, subtítulo breve, galería de producto, sección de presentación, tres preguntas frecuentes y un botón «Conoce el proyecto». Usa lenguaje humano y cálido. No inventes precios, pedidos, entregas, ingredientes, licencias ni comentarios de clientes.'
 },
 '05':{
  tabs:['Demo aprobada SIN VIDEO: https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video','Demo oficial con VIDEO para el bono final (no sobrescribir)','ChatGPT con AppDeploy para el proyecto NUEVO del estudiante, si está disponible','02_FOTOS: hero estático, seis sabores y dos regalos aprobados','03_TEXTOS_DE_WEB','Vista previa de AppDeploy'],
  actions:['Muestra en Casa Brownie qué es frontend: fotos, textos, colores y botones. Explica por qué esta web no necesita backend propio.','En ChatGPT busca AppDeploy en Plugins, conéctalo y autoriza solo si tu plan lo permite.','Pega el prompt preparado y adjunta los textos y fotos guardados en su carpeta.','Publica la versión de práctica del estudiante con dirección HTTPS distinta de la demo oficial; guárdala en 05_WEB y comprueba botón y móvil. Nunca sobrescribas Casa Brownie del repo.'],
  savedPoint:'Guarda prompt completo, archivos y URL de la primera versión antes de pedir cambios. Usa historial/rollback de AppDeploy si está disponible.',
  finish:'Termina cuando tengas una URL pública comprobada y un botón informativo que funcione.',
  readyPrompt:'Usa AppDeploy para crear y publicar una web responsiva de una página para Casa Brownie, concepto ficticio de brownies tradicionales. Usa exactamente mis textos revisados [PEGAR TEXTOS] y las fotografías aprobadas [ADJUNTAR HERO, SEIS SABORES Y DOS REGALOS]. Secciones: header, hero estático, banner, seis sabores, regalos, historia, entrega ilustrativa en Miami y footer. Construye una sección por instrucción y conserva lo aprobado. Divide la captura en 05A (header/hero/banner/catálogo) y 05B (regalos/historia/entrega/footer). Diseño editorial cálido, legible en móvil, fotografías reales y botón «Conoce el proyecto» que lleva a una sección interna. Muestra claramente DEMO · SIN COMPRAS. No crees checkout, base de datos, login ni formulario que guarde datos. Comprueba navegación y devuelve URL pública HTTPS. Antes de cada cambio importante conserva una versión.'
 },
 '06':{
  tabs:['Demo oficial SIN VIDEO https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video','URL de práctica del estudiante en AppDeploy','Vista móvil estrecha y escritorio','ChatGPT con capturas reales'],
  actions:['Abre la URL en el teléfono y recorre toda la página.','Toma capturas reales de título, foto y botón antes de corregir.','Pega las capturas en ChatGPT, aplica solo dos correcciones y vuelve a probar.'],
  savedPoint:'Guarda fotos 06_ANTES_MOVIL.png y la URL de versión inicial para comparar.',
  finish:'Termina con capturas antes/después y la navegación móvil verificada.',
  readyPrompt:'Analiza estas capturas REALES de Casa Brownie en teléfono y escritorio [ADJUNTOS]. Señala solo problemas observables de legibilidad, foto recortada, contraste, botón o desbordamiento horizontal. Propón dos correcciones concretas para aplicar con AppDeploy, manteniendo contenido y marca. No inventes resultados de pruebas.'
 },
 '07':{
  tabs:['Web ficticia Casa Brownie: sin cobros','Stripe en modo de prueba, con datos privados ocultos','Make con Gmail (escenario desactivado)','Guía de conexiones del Studio','Aula → Materiales → Make gratis y Contraseñas'],
  actions:['Mantén la web ficticia sin cobros y muestra solo un mapa de lo que ocurriría detrás.','Abre el modo de prueba de Stripe y explica elegibilidad y verificación en Estados Unidos, sin datos privados.','En Make muestra un escenario no activado: Stripe con pago confirmado, filtro, control de duplicados y Gmail Send an email.','Explica Create a connection → Sign in with Google, destinatario, asunto y cuerpo; prueba únicamente con tu propio correo.','Muestra los 2 escenarios activos posibles en Make gratis, el límite de 1,000 créditos al mes y los prompts para que ChatGPT explique cada conexión.','Abre las guías de contraseñas y API keys: nunca pegarlas en prompts ni ponerlas en frontend.'],
  savedPoint:'Deja una captura del Dashboard en modo de prueba sin saldo, nombres, claves ni emails privados.',
  finish:'Termina cuando el alumno diferencie publicar una web, cobrar de verdad y confirmar una compra antes de entregar.',
  readyPrompt:'Explícame paso a paso cómo probar Stripe para un producto real permitido en Estados Unidos. Después enséñame a preparar en Make un escenario sin activar: pago confirmado de Stripe → filtro y evitar duplicados → Gmail Send an email. Detalla cómo conectar Gmail mediante Sign in with Google y rellenar To, Subject y Body usando mi propio correo de prueba. No pidas contraseñas, SSN ni datos bancarios.'
 },
 '08':{
  tabs:['Versión principal sin video, para terminar la clase','URL separada de la práctica del estudiante','Versión oficial animada, únicamente para presentar el bono','Checklist de publicación','Aula → Materiales → Footer y legales','Carpeta 06_PRUEBAS'],
  actions:['Recorre la página de arriba abajo desde móvil.','Abre cada enlace y comprueba que no haya promesas ni ventas inexistentes.','Explica qué debe verificarse en footer: negocio, contacto, privacidad si hay datos, términos y devoluciones si se vende, cookies según tracking y accesibilidad.','Abre los cuatro prompts del aula; deja claro que son borradores condicionados a la ley aplicable.','Guarda captura de hero, footer, página completa, botón y URL; escribe una pregunta concreta. Verifica Proyectos del Club de Ideas y Ayuda con una cuenta de prueba antes de grabar cómo compartir; no prometer plazos ni revisiones ilimitadas.'],
  savedPoint:'Conserva las DOS vistas del mismo repo: ?etapa=sin-video para la clase y URL limpia con video únicamente como bono. Guarda aparte las versiones de práctica del estudiante.',
  finish:'Termina con la URL compartible y una lista honesta de lo que funciona y de lo que falta.',
  readyPrompt:'Evalúa la web informativa Casa Brownie [URL Y CAPTURAS]. Revisa claridad, fotos, móvil, enlaces, footer y accesibilidad. Señala qué páginas legales se deben revisar de acuerdo con los datos que REALMENTE se recogen y con el país o estado; no inventes políticas, ventas ni cumplimiento. Dame un checklist de pruebas concretas.'
 }
};
