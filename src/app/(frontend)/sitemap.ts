import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { URL_DEL_SITIO } from '@/constantes/sitio'
import config from '@/payload.config'

/**
 * Sitemap dinámico.
 *
 * Consulta directo por la Local API en vez de reusar `payload/consultas.ts`:
 * aquí solo hacen falta `slug` y `updatedAt` de cada documento publicado, y
 * pasar por los mapeos completos —imagen, SEO, bloques— sería trabajo que
 * nadie va a leer.
 *
 * «Dinámico» es literal y hay que declararlo: Next genera el sitemap durante el
 * build, y en Amplify ese archivo queda en el artefacto de solo lectura. Se
 * notaba —el despliegue publicaba 14 URLs y la base ya tenía 15—, y una página
 * nueva no entraba nunca al sitemap por más que se publicara.
 * Ver el comentario largo en `app/(frontend)/page.tsx`.
 */
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  const [noticias, recintos, galerias, paginas] = await Promise.all([
    payload.find({
      collection: 'noticias',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'recintos',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'galerias',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'paginas',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      select: { slug: true, updatedAt: true },
    }),
  ])

  const rutasFijas: MetadataRoute.Sitemap = [
    { url: URL_DEL_SITIO, changeFrequency: 'daily', priority: 1 },
    { url: `${URL_DEL_SITIO}/noticias`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${URL_DEL_SITIO}/recintos`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${URL_DEL_SITIO}/galerias`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${URL_DEL_SITIO}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const deColeccion = (base: string, prioridad: number) => (resultado: typeof noticias) =>
    resultado.docs.map(
      (doc): MetadataRoute.Sitemap[number] => ({
        url: `${URL_DEL_SITIO}${base}/${doc.slug}`,
        lastModified: doc.updatedAt,
        changeFrequency: 'weekly',
        priority: prioridad,
      }),
    )

  return [
    ...rutasFijas,
    ...deColeccion('/noticias', 0.7)(noticias),
    ...deColeccion('/recintos', 0.7)(recintos),
    ...deColeccion('/galerias', 0.5)(galerias),
    ...paginas.docs.map(
      (doc): MetadataRoute.Sitemap[number] => ({
        url: `${URL_DEL_SITIO}/${doc.slug}`,
        lastModified: doc.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      }),
    ),
  ]
}
