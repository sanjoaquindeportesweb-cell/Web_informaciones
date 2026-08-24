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
  /* Sin esto Next no emite `<link rel="canonical">` en ninguna ruta:
     `metadataBase` solo convierte las relativas de aquí abajo en absolutas, no
     declara cuál es la URL buena. Y el sitio se sirve en dos hosts —el ápice y
     `www`, ambos apuntando a la misma rama en Amplify— con contenido idéntico.
     Sin canónica no hay ninguna señal de cuál manda, así que Google elige por su
     cuenta y reparte la autoridad entre los dos.

     `'./'` se resuelve contra `metadataBase` más la ruta actual, de modo que
     cada página declara la suya. Ninguno de los once archivos que definen
     metadata declara `alternates`, así que todos heredan esta línea. */
  alternates: { canonical: './' },
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
