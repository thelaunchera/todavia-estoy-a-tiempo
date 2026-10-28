/** Preparación de pantalla por video. Un único negocio ficticio: brownies tradicionales. */
export type RecordingStart = {
  tabs:string[]; actions:string[]; savedPoint:string; finish:string; readyPrompt:string;
};
export const RECORDING_EXAMPLE = 'Casa Brownie · concepto ficticio de brownies tradicionales · web informativa sin pedidos ni cobros';
export const recordingStarts:Record<string,RecordingStart>={
 '00':{
  tabs:['Vista previa de Casa Brownie (sin checkout)','Carpeta de materiales en Drive','Biblioteca de prompts'],
  actions:['Abre la vista previa del ejemplo con la etiqueta DEMO · SIN COMPRAS.','Muestra brevemente hero, tres fotografías y contacto informativo.','Abre la carpeta de trabajo y señala qué documento completará la persona.'],
  savedPoint:'Guarda captura 00_INICIO.png de la página tal como está antes de explicar.',
  finish:'Termina cuando el alumno sepa qué web va a construir y haya abierto su carpeta.',
  readyPrompt:'Quiero crear una web informativa de una página para mi idea de negocio. Hazme cinco preguntas sencillas sobre qué ofrezco, a quién ayudo, qué fotos usaré y qué acción quiero que tome la persona. No inventes testimonios ni ventas.'
 },
 '01':{
  tabs:['ChatGPT, conversación de Casa Brownie','Cuaderno: 01_FICHA_DE_OFERTA'],
  actions:['Abre una conversación nueva y escribe «Casa Brownie» como negocio de ejemplo ficticio.','Pega el prompt ya completado, léelo y envíalo.','Copia en la ficha público, producto, objetivo y datos que faltan; no añadas ingredientes ni precios inventados.'],
  savedPoint:'Antes de enviar el mensaje, copia el texto del prompt a 01_PROMPT_INICIAL.txt para repetir la toma.',
  finish:'Termina al guardar la ficha, con los datos conocidos separados de los pendientes.',
  readyPrompt:'Mi proyecto es Casa Brownie, una marca ficticia de brownies tradicionales. Quiero una web de presentación de una página, sin compras ni reservas activas. Público: personas que quieren conocer un producto artesanal. Acción: leer los detalles y contactar cuando exista información real. Crea una ficha de oferta y separa hechos, decisiones creativas y datos pendientes. No inventes ingredientes, disponibilidad, precios, reseñas ni permisos.'
 },
 '02':{
  tabs:['Tres webs públicas de referencia (sin copiar)','ChatGPT','Documento 02_REFERENCIAS'],
  actions:['Abre tres ejemplos y compara únicamente hero, organización y versión móvil.','Escribe una observación y algo que NO vas a copiar de cada página.','Pide a ChatGPT una paleta y estilo propio para Casa Brownie y guárdalos.'],
  savedPoint:'Guarda URLs y capturas de las tres referencias antes de grabar; no dependen de que sigan abiertas.',
  finish:'Termina con paleta, composición y tres reglas visuales aprobadas.',
  readyPrompt:'Estoy diseñando Casa Brownie, una web ficticia de brownies tradicionales. Tras revisar estas tres webs y anotar lo que me gustó [PEGAR MIS OBSERVACIONES], propón una dirección editorial propia: colores, fotografía, tipografías y jerarquía en móvil. No copies textos, fotos, marcas ni estructura completa.'
 },
 '03':{
  tabs:['ChatGPT con generación de imágenes disponible','Paleta y referencias de 02_REFERENCIAS','Carpeta 03_FOTOS'],
  actions:['Pega el prompt de imagen horizontal y genera el hero.','Revisa manos extrañas, etiquetas ficticias y letras dibujadas.','Usa el hero como referencia para dos fotografías coherentes y guarda cada archivo.'],
  savedPoint:'Guarda HERO_ORIGINAL.png antes de producir variaciones; podrás regresar a él.',
  finish:'Termina con HERO, PRODUCTO y DETALLE guardados por separado.',
  readyPrompt:'Crea una fotografía editorial realista para Casa Brownie, un proyecto ficticio de brownies tradicionales. Formato horizontal 16:9, luz natural lateral, mesa de madera clara, brownies simples de chocolate, fondo cálido con espacio libre para un título externo. Sin texto impreso, logos, personas, empaques con ingredientes inventados ni reseñas.'
 },
 '04':{
  tabs:['ChatGPT','01_FICHA_DE_OFERTA','04_TEXTOS_DE_LANDING'],
  actions:['Pega la ficha de Casa Brownie, diferenciando lo confirmado de lo pendiente.','Pide hero, presentación, galería, preguntas frecuentes y contacto informativo.','Elimina palabras vacías y cualquier promesa sobre disponibilidad, precio o ingredientes.'],
  savedPoint:'Duplica la primera versión de textos antes de editar para mostrar un antes y después auténtico.',
  finish:'Termina con el título, subtítulo, secciones y CTA informativo guardados.',
  readyPrompt:'Para Casa Brownie, web informativa de un concepto ficticio de brownies tradicionales, escribe un título claro, subtítulo breve, galería de producto, sección de presentación, tres preguntas frecuentes y un botón «Conoce el proyecto». Usa lenguaje humano y cálido. No inventes precios, pedidos, entregas, ingredientes, licencias ni comentarios de clientes.'
 },
 '05':{
  tabs:['ChatGPT con el conector AppDeploy autorizado, si está disponible','03_FOTOS: HERO, PRODUCTO, DETALLE','04_TEXTOS_DE_LANDING','Vista previa de AppDeploy'],
  actions:['En ChatGPT busca AppDeploy en Plugins; conéctalo y autoriza desde su pantalla oficial si tu plan lo permite.','Pega el prompt preparado e incorpora los textos y fotos reales de la carpeta.','Pide construir y desplegar la web; revisa el enlace público de AppDeploy sin comprar dominio.','Prueba el botón, la navegación móvil y que no existan formularios de cobro ni pedidos.'],
  savedPoint:'Guarda prompt completo, archivos y URL de la primera versión antes de pedir cambios. Usa historial/rollback de AppDeploy si está disponible.',
  finish:'Termina cuando tengas una URL pública comprobada y un botón informativo que funcione.',
  readyPrompt:'Usa AppDeploy para crear y publicar una web responsiva de una página para Casa Brownie, concepto ficticio de brownies tradicionales. Usa exactamente mis textos revisados [PEGAR TEXTOS] y estas tres imágenes [ADJUNTAR HERO, PRODUCTO Y DETALLE]. Secciones: portada, presentación, galería, preguntas frecuentes y contacto informativo. Diseño editorial cálido, legible en móvil, fotografías reales y botón «Conoce el proyecto» que lleva a una sección interna. Muestra claramente DEMO · SIN COMPRAS. No crees checkout, base de datos, login ni formulario que guarde datos. Comprueba navegación y devuelve URL pública HTTPS. Antes de cada cambio importante conserva una versión.'
 },
 '06':{
  tabs:['URL publicada en AppDeploy','Vista móvil estrecha y escritorio','ChatGPT con capturas reales'],
  actions:['Abre la URL en el teléfono y recorre toda la página.','Toma capturas reales de título, foto y botón antes de corregir.','Pega las capturas en ChatGPT, aplica solo dos correcciones y vuelve a probar.'],
  savedPoint:'Guarda fotos 06_ANTES_MOVIL.png y la URL de versión inicial para comparar.',
  finish:'Termina con capturas antes/después y la navegación móvil verificada.',
  readyPrompt:'Analiza estas capturas REALES de Casa Brownie en teléfono y escritorio [ADJUNTOS]. Señala solo problemas observables de legibilidad, foto recortada, contraste, botón o desbordamiento horizontal. Propón dos correcciones concretas para aplicar con AppDeploy, manteniendo contenido y marca. No inventes resultados de pruebas.'
 },
 '07':{
  tabs:['Web ficticia Casa Brownie: sin checkout','Stripe Dashboard en modo de prueba (cuenta propia, datos ocultos)','Guía de conexiones en este Studio'],
  actions:['Explica que el ejemplo de brownies permanece sin cobrar; no habilites su checkout.','Muestra dónde se encuentra el modo de prueba de Stripe y qué datos necesita verificar un negocio estadounidense.','Presenta Payment Links como camino sin código PARA UN NEGOCIO Y PRODUCTO REAL, verificado y permitido.','Dibuja el recorrido de Stripe → Make → correo, sin fingir que hay una venta ni utilizar llaves reales.'],
  savedPoint:'Deja una captura del Dashboard en modo de prueba sin saldo, nombres, claves ni emails privados.',
  finish:'Termina cuando el alumno diferencie publicar una web, cobrar de verdad y confirmar una compra antes de entregar.',
  readyPrompt:'Explícame paso a paso, para una persona principiante en Estados Unidos, cómo verificar si puede usar Stripe para su negocio y su producto permitido. Después describe cómo crear un Payment Link de prueba y validar el pago antes de enviar un correo con Make. Separa configuración, pruebas y activación real; no solicites secretos, SSN ni datos bancarios en este chat.'
 },
 '08':{
  tabs:['URL final de Casa Brownie en AppDeploy','Checklist de publicación','Carpeta 08_CAPTURAS'],
  actions:['Recorre la página de arriba abajo desde móvil.','Abre cada enlace y comprueba que no haya promesas ni ventas inexistentes.','Guarda captura de hero, página completa, botón y URL; escribe una pregunta concreta.'],
  savedPoint:'Conserva la URL y la versión aprobada de AppDeploy para evitar rehacer el proyecto al repetir.',
  finish:'Termina con la URL compartible y una lista honesta de lo que funciona y de lo que falta.',
  readyPrompt:'Evalúa mi web Casa Brownie [URL Y CAPTURAS] como un visitante nuevo. Prioriza tres mejoras concretas en claridad, fotos, lectura móvil y navegación. No presupongas ventas, cobros, reseñas ni formularios conectados. Dame un checklist para verificar cada mejora.'
 }
};
