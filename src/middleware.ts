import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { URL_DEL_SITIO } from '@/constantes/sitio'

/**
 * Redirecciones desde la colección "Redirecciones".
 *
 * El plugin de Payload solo guarda el dato (de dónde, hacia dónde); nada
 * redirige por sí solo. Esto es lo que hace cumplir esa entrada en cada
 * visita — por eso pasó de ser una nota en el panel a una URL que de verdad
 * funciona.
 *
 * Va por REST (`fetch`), no por la Local API: el middleware corre en el
 * runtime de Node de Next, pero mantener la consulta como una petición HTTP
 * liviana evita levantar una instancia completa de Payload en cada visita
 * del sitio — la mayoría de las visitas no tiene redirección y deben seguir
 * de largo lo más rápido posible.
 */

const RUTA_PUBLICA: Partial<Record<string, string>> = {
  paginas: '',
  noticias: '/noticias',
  recintos: '/recintos',
  galerias: '/galerias',
}

type Redireccion = {
  to?: {
    type?: 'custom' | 'reference'
    url?: string | null
    reference?: {
      relationTo: string
      value: string | { slug?: string }
    } | null
  }
}

/**
 * Dominio histórico de la Corporación, inscrito en 2010. Servía una página de
 * mantenimiento hasta que el portal se mudó a `deportesanjoaquin.cl`, y sigue
 * recibiendo visitas de quien lo tiene guardado o enlazado desde documentos
 * municipales viejos.
 */
const DOMINIO_HISTORICO = 'sanjoaquindeportes.cl'

export const middleware = async (request: NextRequest) => {
  const { pathname, origin } = request.nextUrl

  /* Va ANTES de la consulta a `redirecciones`, y no es cosmético: esa consulta
     es una petición HTTP más un viaje a Mongo en cada visita. Hacerla para algo
     que se va a redirigir de todos modos es pagar dos veces por una respuesta
     que ya está decidida.

     301 y no el 308 que usa la colección de redirecciones más abajo. Ahí el
     308 es correcto porque conserva el método; aquí lo que hay que comunicar es
     «este sitio se mudó de dominio», que es el caso de manual del 301 y lo que
     todo rastreador —incluidos los viejos— interpreta sin ambigüedad para
     transferir la autoridad al dominio nuevo.

     Conserva la ruta a propósito. El sitio viejo no tenía URLs profundas, así
     que en la práctica casi todo cae en `/`, pero preservarla no cuesta nada y
     evita mandar a la portada a quien sí traiga un enlace con ruta. */
  const host = request.headers.get('host')?.split(':')[0]
  if (host === DOMINIO_HISTORICO || host === `www.${DOMINIO_HISTORICO}`) {
    const destino = new URL(request.nextUrl.pathname + request.nextUrl.search, URL_DEL_SITIO)
    return NextResponse.redirect(destino, 301)
  }

  try {
    const busqueda = new URLSearchParams({
      'where[from][equals]': pathname,
      limit: '1',
      depth: '1',
    })
    const respuesta = await fetch(`${origin}/api/redirecciones?${busqueda.toString()}`)
    if (!respuesta.ok) return NextResponse.next()

    const datos: { docs?: Redireccion[] } = await respuesta.json()
    const destino = datos.docs?.[0]?.to
    if (!destino) return NextResponse.next()

    let rutaDestino: string | null = null

    if (destino.type === 'custom' && destino.url) {
      rutaDestino = destino.url
    } else if (destino.type === 'reference' && destino.reference) {
      const { relationTo, value } = destino.reference
      const slug = typeof value === 'object' ? value.slug : undefined
      const base = RUTA_PUBLICA[relationTo]
      if (slug && base !== undefined) rutaDestino = `${base}/${slug}`
    }

    if (!rutaDestino || rutaDestino === pathname) return NextResponse.next()

    /* 308 y no 301: conserva el método de la petición y es la recomendación
       vigente para «se movió permanente» en vez del histórico 301. */
    return NextResponse.redirect(new URL(rutaDestino, origin), 308)
  } catch {
    /* Si Payload no responde, el sitio sigue funcionando sin la
       redirección — no vale la pena caerse por esto. */
    return NextResponse.next()
  }
}

export const config = {
  /* Todo menos el panel, la API, los assets de Next y los archivos
     estáticos servidos desde /public. */
  matcher: ['/((?!admin|api|_next/static|_next/image|favicon.ico|marca|muestras).*)'],
}
