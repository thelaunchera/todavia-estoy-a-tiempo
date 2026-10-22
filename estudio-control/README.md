# Estudio de Control — Todavía estoy a tiempo

Este es el **código fuente y publicación real** del estudio del podcast; no requiere AppDeploy.

## Abrir el estudio
**https://podcast.thelaunchera.com/estudio/**

En cada cambio a `main`, GitHub Actions compila esta aplicación React desde `estudio-control/` y publica los archivos resultantes en GitHub Pages bajo `/estudio/`. El landing sigue en la raíz.

## Cómo funciona esta primera versión
- Organiza **episodios, calendario, tareas, productos e ideas**, con crear, editar, completar y borrar.
- **Modo grabación** oculta controles delicados para mostrar el estudio en videos.
- Tus registros se guardan **en el navegador**, cifrados con AES-GCM a partir de una frase que eliges al entrar por primera vez.
- En la **bóveda local**, tras desbloquearla correctamente, ese **mismo navegador** recordará el acceso durante **5 días (120 horas)**. Recargar o cerrar y abrir la pestaña no debe volver a pedirte la frase en ese periodo.
- La frase **nunca se guarda**; el navegador recuerda temporalmente una llave WebCrypto AES-GCM no exportable, asociada al archivo cifrado, en IndexedDB. La sesión expira a los cinco días contados desde el último desbloqueo con frase; las visitas no reinician el plazo.
- **Cerrar sesión**, importar un respaldo distinto o caducar el plazo borra o invalida el acceso recordado. Si el navegador bloquea IndexedDB, usa navegación privada o borra los datos, hará falta volver a introducir la frase.
- **No actives esta comodidad en un dispositivo compartido**: cualquiera con acceso al navegador abierto podrá entrar durante esos cinco días. La modalidad Supabase, cuando está configurada, tiene autenticación de servidor y sesiones independientes.
- Para usarlo en otro dispositivo, utiliza **Guardar copia** y **Restaurar copia** desde Configuración. Las copias mantienen el cifrado y requieren la misma frase.
- Si borras los datos del navegador o olvidas la frase sin tener un respaldo, no será posible recuperar los registros.
- GitHub Pages no proporciona backend ni autenticación de usuarios; la frase protege los datos locales, **no crea una cuenta de servidor**.
- Los registros anteriores de otro proveedor **no se transfieren** automáticamente.
- **Ventas, compradores, suscriptores y bandeja de mensajes** todavía no están sincronizados. No mostrar datos reales hasta implementar un servicio con acceso autorizado y una base de datos exclusiva del podcast.

## Arquitectura
`src/Studio.tsx` contiene la interfaz; `src/local-client.ts` el almacenamiento cifrado local; `src/five-day-session.ts` el recuerdo temporal de acceso; `src/supabase-client.ts` la conexión opcional a Supabase y `src/studio.css` el diseño.

Para desarrollar: `cd estudio-control && npm install && npm run dev`.

El directorio antiguo `backend/` fue retirado de este repositorio porque dependía de AppDeploy. **No coloques claves privadas, correos de compradores ni secretos de pago en los archivos publicados.**

## Próxima fase
Un backend externo al sitio estático, controlado desde este mismo repositorio, con base de datos separada, autenticación verificada y eventos firmados de pago para sincronizar compras, entregas, audiencia y soporte. No usar la base de datos comercial de The Launch Era como si fuera la del podcast.
