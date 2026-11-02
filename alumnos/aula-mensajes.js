/* Course/system messages. Student-authored content is deliberately not translated. */
const messages={
 "Acceso verificado.": "Access verified.",
 "Acceso pendiente de compra verificada.": "Access is pending a verified purchase.",
 "Comprobando tu cuenta…": "Checking your account…",
 "Comprobando permisos…": "Checking permissions…",
 "Preparando tu cuenta…": "Preparing your account…",
 "Enlace de recuperación verificado. Escribe tu nueva contraseña.": "Recovery link confirmed. Enter your new password.",
 "Enlace verificado. Ya puedes crear una contraseña nueva.": "Link verified. You can now set a new password.",
 "Abriendo tu aula privada desde el Studio…": "Opening your private classroom from Studio…",
 "Conectando con tu Studio privado…": "Connecting to your private Studio…",
 "El Studio aún no ha confirmado tu sesión.": "Studio has not confirmed your session yet.",
 "Entra con tu correo y contraseña.": "Sign in with your email address and password.",
 "No pudimos verificar los permisos de administradora. Esta vista no abre cuentas de alumnos.": "We could not verify owner permissions. This preview cannot open student accounts.",
 "Por seguridad, vuelve a entrar con tu contraseña.": "For security, sign in again with your password.",
 "Confirma tu correo antes de entrar al aula.": "Confirm your email address before entering the classroom.",
 "No se pudo confirmar la sesión privada. Regresa al Studio y vuelve a pulsar Aula.": "We could not verify your private session. Return to Studio and reopen the classroom.",
 "No pudimos comprobar el acceso. Actualiza la página o pide ayuda si continúa.": "We could not verify access. Refresh the page or ask for help if it continues.",
 "No pudimos confirmar el acceso a la clase.": "We could not verify access to the course.",
 "Vista privada abierta. Algunas guías o prompts no cargaron; las lecciones siguen disponibles.": "Private preview opened. Some resources did not load, but lessons remain accessible.",
 "Vista administrativa: borradores visibles solo para ti. Sin cambios al progreso de alumnos.": "Owner preview: drafts are visible only to you. Student progress is unchanged.",
 "No se pudieron cargar los materiales. Vuelve a abrir el aula o pide ayuda desde aquí.": "Materials could not be loaded. Reopen the classroom or request help here.",
 "No se pudieron cargar los ejemplos. Vuelve a abrir el aula.": "Examples could not be loaded. Reopen the classroom.",
 "No pudimos actualizar tus bonos. Vuelve a entrar o solicita ayuda.": "We could not update your bonuses. Sign in again or request help.",
 "Activa el almacenamiento de este navegador para iniciar sesión.": "Enable browser storage to sign in.",
 "No pudimos entrar. Revisa tu correo y contraseña o recupérala si la olvidaste.": "Could not sign in. Check your email and password, or reset your password.",
 "Las contraseñas no coinciden. Inténtalo de nuevo.": "Passwords do not match. Please try again.",
 "Las contraseñas no coinciden.": "Passwords do not match.",
 "Si puedes crear una cuenta con ese correo, recibirás las instrucciones para confirmarla. Si ya tenías una cuenta, usa «Olvidé mi contraseña». Después podrás entrar con tu contraseña.": "If you can create an account with that email, we will send confirmation instructions. If you already have an account, use Forgot password. Then sign in with your password.",
 "No pudimos crear la cuenta. Comprueba el correo y utiliza una contraseña de al menos 8 caracteres.": "We could not create your account. Check your email and use a password of at least 8 characters.",
 "Solicitando recuperación…": "Requesting password reset…",
 "Si existe una cuenta con ese correo, recibirás el enlace para recuperar la contraseña. Revisa también Promociones o Spam.": "If an account exists for that email, we will send a password reset link. Check Promotions and Spam too.",
 "No pudimos enviar el correo. Inténtalo después o solicita ayuda.": "We could not send the email. Try again later or ask for help.",
 "Guardando contraseña…": "Saving password…",
 "Contraseña guardada. Ahora entra con tu correo y contraseña.": "Password saved. You can now sign in with your email and password.",
 "No pudimos guardar tu contraseña. Abre de nuevo el enlace de recuperación o solicita uno nuevo.": "We could not save your password. Open your recovery link again or request a new one.",
 "No pudimos guardar tu avance. Vuelve a intentarlo.": "We could not save your progress. Please try again.",
 "La ayuda no está disponible ahora. Escríbenos a hello@thelaunchera.com.": "Help is unavailable right now. Email hello@thelaunchera.com.",
 "¡Recibí tu consulta! Te envié una confirmación por correo. Puedes continuar con tu clase.": "Your request was received! We sent a confirmation email. You can continue learning.",
 "No pudimos confirmar el envío. Intenta otra vez o escribe a hello@thelaunchera.com.": "We could not confirm delivery. Try again or email hello@thelaunchera.com.",
 "Enviando consulta…": "Sending request…",
 "Enviar mi consulta": "Send my request",
 "Tu sesión terminó. Vuelve a entrar para continuar.": "Your session ended. Sign in again to continue.",
 "La cuenta cambió. Comprobando el acceso de nuevo…": "Your account changed. Checking access again…",
 "No se pudo verificar tu acceso de administradora. Vuelve al Studio y abre el aula otra vez. Si continúa, inicia sesión en el Studio de nuevo.": "Could not verify your admin access. Reopen the classroom from Studio or sign in to Studio again.",
 "No se pudo verificar la sesión de administradora": "The owner session could not be verified",
 "Comprueba la conexión del aula.": "Check your classroom connection."
};
export function courseCopy(es,en,language='es'){
 return language==='en'?en:es;
}
export function translateCourseMessage(value,language='es'){
 const src=String(value??'');
 if(language!=='en')return src;
 if(Object.hasOwn(messages,src))return messages[src];
 if(src.startsWith('Tu sesión de administradora está verificada, pero falló la carga de '))
  return 'Your owner session is verified, but loading failed. Return to Studio and reopen the classroom.';
 if(src.startsWith('No se pudo verificar la sesión de administradora'))
  return 'The owner session could not be verified. Return to Studio and try again.';
 return src;
}
