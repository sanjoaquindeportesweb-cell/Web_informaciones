import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Revalidación al publicar.
 *
 * OJO, ANTES DE CONFIAR EN ESTO: en el despliegue actual —Amplify, plataforma
 * WEB_COMPUTE— estos hooks no logran nada, y no es un error de configuración.
 * Las rutas que Next prerenderiza durante el build quedan dentro del artefacto
 * de despliegue, que es de solo lectura: `revalidatePath` no puede reescribir
 * esa entrada de caché, ni tampoco el vencimiento por tiempo. Se comprobó
 * contra el despliegue: tres horas después de vencida una ventana de una hora,
 * la portada seguía devolviendo `x-nextjs-cache: HIT` con el contenido del
 * build, y con CloudFront en MISS —era el origen, no el CDN.
 *
 * Por eso las rutas que muestran contenido del panel van con
 * `dynamic = 'force-dynamic'` y no con `revalidate`. Estos hooks se conservan
 * porque son correctos en un servidor Node propio, que es el destino que el
 * plan del proyecto contempla, y ahí sí ahorran trabajo. Mientras el portal
 * viva en Amplify son inofensivos y nada más.
 *
 * Nunca se reconstruye el sitio entero: cada hook invalida solo las rutas
 * que ese documento puede tocar. Con `revalidatePath` corriendo dentro del
 * mismo proceso de Next que sirve las páginas —Payload va montado adentro,
 * no aparte— no hace falta ni una llamada de red para que la caché se entere.
 *
 * Se revalida tanto si el documento queda publicado como si un documento que
 * SÍ estaba publicado deja de estarlo (se archiva o se vuelve a borrador):
 * sin la segunda mitad, despublicar algo lo dejaría viéndose en la versión
 * cacheada hasta la próxima revalidación por tiempo.
 */
/**
 * `revalidatePath` solo funciona dentro del contexto de una petición de Next.
 * Payload no siempre corre ahí: `payload run` para la siembra, los scripts de
 * mantenimiento y la cola de jobs son Node a secas. En esos casos la llamada
 * lanza «Invariant: static generation store missing» y, por ser un hook
 * `afterChange`, tumba la operación completa — crear una noticia desde un
 * script fallaba por no poder invalidar una caché que en ese contexto ni
 * siquiera existe.
 *
 * El error se descarta solo en ese caso: sin contexto de Next no hay caché de
 * rutas que invalidar. Desde el panel, que es el camino normal, el
 * comportamiento no cambia en nada.
 */
const revalidar = (ruta: string, tipo?: 'layout' | 'page') => {
  try {
    if (tipo) revalidatePath(ruta, tipo)
    else revalidatePath(ruta)
  } catch {
    /* Fuera de Next: nada que revalidar. */
  }
}

const fuePublicado = (doc: { _status?: string }, previousDoc?: { _status?: string }) =>
  doc?._status === 'published' || previousDoc?._status === 'published'

/** Revalida detalle + listado + portada, y también el slug viejo si cambió. */
const revalidarConSlug =
  (base: string, incluirPortada = true): CollectionAfterChangeHook =>
  ({ doc, previousDoc }) => {
    if (fuePublicado(doc, previousDoc)) {
      if (incluirPortada) revalidar('/')
      revalidar(base)
      if (doc.slug) revalidar(`${base}/${doc.slug}`)
      if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
        revalidar(`${base}/${previousDoc.slug}`)
      }
    }
    return doc
  }

const revalidarAlBorrarConSlug =
  (base: string, incluirPortada = true): CollectionAfterDeleteHook =>
  ({ doc }) => {
    if (incluirPortada) revalidar('/')
    revalidar(base)
    if (doc?.slug) revalidar(`${base}/${doc.slug}`)
    return doc
  }

export const revalidarNoticias = revalidarConSlug('/noticias')
export const revalidarNoticiasAlBorrar = revalidarAlBorrarConSlug('/noticias')

export const revalidarRecintos = revalidarConSlug('/recintos')
export const revalidarRecintosAlBorrar = revalidarAlBorrarConSlug('/recintos')

export const revalidarGalerias = revalidarConSlug('/galerias', false)
export const revalidarGaleriasAlBorrar = revalidarAlBorrarConSlug('/galerias', false)

/* Las páginas por bloques no tienen listado propio (son `/[slug]` a secas),
   así que aquí no hay una ruta base que revalidar además del slug mismo. */
export const revalidarPaginas: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  if (fuePublicado(doc, previousDoc)) {
    if (doc.slug) revalidar(`/${doc.slug}`)
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) revalidar(`/${previousDoc.slug}`)
  }
  return doc
}

export const revalidarPaginasAlBorrar: CollectionAfterDeleteHook = ({ doc }) => {
  if (doc?.slug) revalidar(`/${doc.slug}`)
  return doc
}

/* Los destacados solo aparecen en el carrusel de portada. */
export const revalidarDestacados: CollectionAfterChangeHook = ({ doc }) => {
  revalidar('/')
  return doc
}
export const revalidarDestacadosAlBorrar: CollectionAfterDeleteHook = ({ doc }) => {
  revalidar('/')
  return doc
}

/* Los tres globales se leen una sola vez en el layout raíz (navbar, pie,
   datos de contacto): tocar cualquiera de los tres invalida el sitio entero
   con `'layout'`, que arrastra a todas las páginas que cuelgan de ese layout
   — no alcanza con revalidar solo `/`. */
export const revalidarSitio: GlobalAfterChangeHook = ({ doc }) => {
  revalidar('/', 'layout')
  return doc
}
