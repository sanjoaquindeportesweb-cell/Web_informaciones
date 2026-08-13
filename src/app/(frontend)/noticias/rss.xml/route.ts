import { URL_DEL_SITIO } from '@/constantes/sitio'
import { listarNoticias } from '@/payload/consultas'

/* Se revalida junto con el resto de rutas estáticas: el feed no necesita
   estar más al día que la portada, y evita golpear la base de datos en cada
   lector de RSS que pase a consultarlo. */
export const revalidate = 3600

/**
 * Feed RSS de noticias. Sin librerías: es XML de cuatro etiquetas, y traer
 * una dependencia para esto pesa más que escribirlo a mano.
 *
 * Escapar el texto no es opcional — una `bajada` con un `&` o un `<` sin
 * escapar deja el XML inválido, y con contenido cargado por varias personas
 * tarde o temprano alguien escribe uno.
 */
const escaparXML = (texto: string) =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export const GET = async () => {
  const { noticias } = await listarNoticias({ porPagina: 30 })

  const items = noticias
    .map(
      (n) => `
    <item>
      <title>${escaparXML(n.titulo)}</title>
      <link>${URL_DEL_SITIO}/noticias/${n.slug}</link>
      <guid isPermaLink="true">${URL_DEL_SITIO}/noticias/${n.slug}</guid>
      <pubDate>${new Date(n.publicadaEn).toUTCString()}</pubDate>
      ${n.bajada ? `<description>${escaparXML(n.bajada)}</description>` : ''}
    </item>`,
    )
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Noticias — Corporación Municipal de Deportes de San Joaquín</title>
    <link>${URL_DEL_SITIO}/noticias</link>
    <description>Noticias e informaciones para vecinas y vecinos de la comuna.</description>
    <language>es-cl</language>${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
