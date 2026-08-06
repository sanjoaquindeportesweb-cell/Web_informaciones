import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Revalidación al publicar.
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
const fuePublicado = (doc: { _status?: string }, previousDoc?: { _status?: string }) =>
  doc?._status === 'published' || previousDoc?._status === 'published'

/** Revalida detalle + listado + portada, y también el slug viejo si cambió. */
const revalidarConSlug =
  (base: string, incluirPortada = true): CollectionAfterChangeHook =>
  ({ doc, previousDoc }) => {
    if (fuePublicado(doc, previousDoc)) {
      if (incluirPortada) revalidatePath('/')
      revalidatePath(base)
      if (doc.slug) revalidatePath(`${base}/${doc.slug}`)
      if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
        revalidatePath(`${base}/${previousDoc.slug}`)
      }
    }
    return doc
  }

const revalidarAlBorrarConSlug =
  (base: string, incluirPortada = true): CollectionAfterDeleteHook =>
  ({ doc }) => {
    if (incluirPortada) revalidatePath('/')
    revalidatePath(base)
    if (doc?.slug) revalidatePath(`${base}/${doc.slug}`)
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
    if (doc.slug) revalidatePath(`/${doc.slug}`)
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) revalidatePath(`/${previousDoc.slug}`)
  }
  return doc
}

export const revalidarPaginasAlBorrar: CollectionAfterDeleteHook = ({ doc }) => {
  if (doc?.slug) revalidatePath(`/${doc.slug}`)
  return doc
}

/* Los destacados solo aparecen en el carrusel de portada. */
export const revalidarDestacados: CollectionAfterChangeHook = ({ doc }) => {
  revalidatePath('/')
  return doc
}
export const revalidarDestacadosAlBorrar: CollectionAfterDeleteHook = ({ doc }) => {
  revalidatePath('/')
  return doc
}

/* Los tres globales se leen una sola vez en el layout raíz (navbar, pie,
   datos de contacto): tocar cualquiera de los tres invalida el sitio entero
   con `'layout'`, que arrastra a todas las páginas que cuelgan de ese layout
   — no alcanza con revalidar solo `/`. */
export const revalidarSitio: GlobalAfterChangeHook = ({ doc }) => {
  revalidatePath('/', 'layout')
  return doc
}
