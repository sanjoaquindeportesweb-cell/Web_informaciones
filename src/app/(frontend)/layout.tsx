import type { Metadata } from 'next'
import React from 'react'

/* Tipografías autoalojadas: se sirven desde el propio dominio, no desde el CDN
   de Google. El portal es de un organismo público chileno y no corresponde
   mandar la IP de cada visitante a un tercero solo para pintar un titular. */
import '@fontsource-variable/inter'
import '@fontsource-variable/rubik'

import { PageShell } from '@/componentes/layout/PageShell'
import { URL_DEL_SITIO } from '@/constantes/sitio'
import { ProveedorMovimiento } from '@/lib/movimiento'
import { obtenerDatosSitio } from '@/payload/consultas'
import './globals.css'

const DESCRIPCION =
  'Noticias, recintos deportivos y actividades de la Corporación Municipal de Deportes de San Joaquín.'

/* `metadataBase` es lo que convierte las URLs relativas de `openGraph.images`
   de cada ruta en absolutas — sin esto, la vista previa al compartir en
   redes queda rota. Lo que se declara aquí es el respaldo: cualquier ruta
   que no arme su propio `openGraph` (los listados, por ejemplo) hereda esto
   en vez de compartirse sin imagen ni descripción. */
export const metadata: Metadata = {
  metadataBase: new URL(URL_DEL_SITIO),
  title: {
    default: 'Corporación Municipal de Deportes de San Joaquín',
    template: '%s · Deportes San Joaquín',
  },
  description: DESCRIPCION,
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'Corporación Municipal de Deportes de San Joaquín',
    title: 'Corporación Municipal de Deportes de San Joaquín',
    description: DESCRIPCION,
    images: [{ url: '/marca/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corporación Municipal de Deportes de San Joaquín',
    description: DESCRIPCION,
    images: ['/marca/og-default.jpg'],
  },
}

/**
 * El navbar y el pie se resuelven una sola vez aquí, no en cada página: es
 * lo que hace que crear una página en el panel y sumarla a `navegacion` se
 * vea en todo el sitio sin tocar código en ningún otro archivo.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sitio = await obtenerDatosSitio()

  return (
    <html lang="es-CL">
      <body>
        <ProveedorMovimiento>
          <PageShell sitio={sitio}>{children}</PageShell>
        </ProveedorMovimiento>
      </body>
    </html>
  )
}
