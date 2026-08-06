import type { Metadata } from 'next'

import type { Imagen } from '@/tipos'

/**
 * Imagen para Open Graph: la de la pieza si tiene, si no el respaldo de
 * marca. Nunca se comparte sin imagen — sin esta, algunas redes ni siquiera
 * arman una vista previa de la tarjeta.
 */
export const imagenOG = (imagen?: Imagen) =>
  imagen
    ? [{ url: imagen.url, width: imagen.ancho, height: imagen.alto }]
    : [{ url: '/marca/og-default.jpg', width: 1200, height: 630 }]

/**
 * Metadatos de una página de listado (sin imagen propia: no hay una sola
 * foto que la represente, así que usan el respaldo de marca del layout).
 *
 * Existe porque Next **no** hereda campo por campo: en cuanto una ruta
 * declara su propio `openGraph`, reemplaza al del layout entero, incluido el
 * título. Sin este bloque, compartir «/noticias» en redes mostraría el
 * título genérico del sitio en vez de «Noticias».
 */
export const metadatosDeListado = (titulo: string, descripcion: string): Metadata => ({
  title: titulo,
  description: descripcion,
  openGraph: {
    title: titulo,
    description: descripcion,
    images: [{ url: '/marca/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: titulo,
    description: descripcion,
    images: ['/marca/og-default.jpg'],
  },
})
