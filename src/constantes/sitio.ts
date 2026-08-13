/**
 * Origen público del portal, normalizado.
 *
 * Sale de `NEXT_PUBLIC_SERVER_URL` y se usa en todo lo que necesita una URL
 * absoluta: el sitemap, el RSS, los datos estructurados, las migas de pan, la
 * vista previa en vivo del panel y el `metadataBase` del layout.
 *
 * La barra final se recorta y no es una precaución de manual. El valor del
 * panel de Amplify estaba escrito como `https://…amplifyapp.com/`, y esa barra
 * de más convertía cada `${URL_DEL_SITIO}${ruta}` en `https://…com//noticias/x`.
 * La doble barra es otra ruta para el servidor, así que el sitemap y el RSS
 * publicaban enlaces que no resolvían, los datos estructurados declaraban URLs
 * que no eran las canónicas y la vista previa en vivo del panel apuntaba a una
 * página inexistente. Nada de eso lanza un error visible: el sitio se ve bien y
 * lo que se rompe es lo que leen Google y el propio panel.
 *
 * Antes esta línea estaba copiada en siete archivos, cada uno con su fallback.
 * Acá está una vez, y recortar la barra arregla los siete de golpe sin depender
 * de que nadie escriba bien la variable.
 */
export const URL_DEL_SITIO = (
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
).replace(/\/+$/, '')
