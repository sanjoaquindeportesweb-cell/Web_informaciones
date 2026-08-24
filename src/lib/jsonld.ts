import type { DiaHorario } from './horarios'
import { NOMBRE_ORGANIZACION, URL_DEL_SITIO } from '@/constantes/sitio'
import type { Imagen, Noticia, Recinto } from '@/tipos'

const EDITOR = {
  '@type': 'Organization' as const,
  name: NOMBRE_ORGANIZACION,
  logo: { '@type': 'ImageObject' as const, url: `${URL_DEL_SITIO}/marca/logo.png` },
}

/* Los datos estructurados no pasan por `metadataBase` —eso solo resuelve
   `metadata.openGraph`—, así que si no se arma la URL absoluta a mano aquí,
   Google recibe `/api/media/file/foto.webp` y la descarta silenciosamente:
   la especificación de `ImageObject` exige una URL completa. */
const aURL = (imagen?: Imagen) => {
  const ruta = imagen?.url ?? '/marca/og-default.jpg'
  return ruta.startsWith('http') ? ruta : `${URL_DEL_SITIO}${ruta}`
}

/**
 * NewsArticle. Es lo que hace que un artículo pueda aparecer en Google
 * Noticias y en el carrusel de noticias del buscador, no solo en el
 * resultado de texto plano.
 */
export const jsonLdNoticia = (noticia: Noticia & { cuerpoHTML: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: noticia.titulo,
  description: noticia.bajada,
  image: [aURL(noticia.portada)],
  datePublished: noticia.publicadaEn,
  dateModified: noticia.publicadaEn,
  author: EDITOR,
  publisher: EDITOR,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${URL_DEL_SITIO}/noticias/${noticia.slug}` },
})

/* 0 domingo … 6 sábado, igual que `Date.getDay()` — mismo orden que
   `lib/horarios.ts`, para no mantener dos mapeos que puedan divergir. */
const DIA_SCHEMA = [
  'https://schema.org/Sunday',
  'https://schema.org/Monday',
  'https://schema.org/Tuesday',
  'https://schema.org/Wednesday',
  'https://schema.org/Thursday',
  'https://schema.org/Friday',
  'https://schema.org/Saturday',
]

/**
 * SportsActivityLocation, con el horario real. Es lo que le permite a Google
 * mostrar «Abierto ahora» o el horario del día directamente en el resultado
 * de búsqueda, sin que la persona entre al sitio.
 */
export const jsonLdRecinto = (recinto: Recinto & { seo: { imagen?: Imagen } }) => ({
  '@context': 'https://schema.org',
  '@type': 'SportsActivityLocation',
  name: recinto.nombre,
  image: [aURL(recinto.seo.imagen ?? recinto.portada)],
  address: { '@type': 'PostalAddress', streetAddress: recinto.direccion, addressLocality: 'San Joaquín' },
  url: `${URL_DEL_SITIO}/recintos/${recinto.slug}`,
  openingHoursSpecification: recinto.horarios.flatMap((dia: DiaHorario) =>
    dia.tramos.map((tramo) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DIA_SCHEMA[dia.dia],
      opens: tramo.inicio,
      closes: tramo.fin,
    })),
  ),
})
