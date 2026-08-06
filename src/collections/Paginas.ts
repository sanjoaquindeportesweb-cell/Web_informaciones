import type { CollectionConfig } from 'payload'

import { BLOQUES_PAGINA } from '@/payload/bloques'
import { camposSEO, campoSlug } from '@/payload/campos'
import { esAdmin, estaAutenticado, publicoSiPublicado } from '@/payload/acceso'
import { revalidarPaginas, revalidarPaginasAlBorrar } from '@/payload/revalidacion'

/**
 * Páginas armadas por bloques.
 *
 * Es la pieza que hace cierto el «100 % editable»: cualquiera con cuenta
 * arma una página nueva combinando los bloques de `payload/bloques.ts`, la
 * publica y la suma al global `navegacion` — sin que nadie toque código. La
 * ruta `/[slug]` (siguiente tarea) la resuelve genéricamente para cualquier
 * documento publicado de esta colección.
 */
export const Paginas: CollectionConfig = {
  slug: 'paginas',
  labels: { singular: 'Página', plural: 'Páginas' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'slug', '_status'],
    description: 'Páginas institucionales armadas con bloques: Quiénes somos, Historia, etc.',
  },
  access: {
    read: publicoSiPublicado,
    create: estaAutenticado,
    update: estaAutenticado,
    delete: esAdmin,
  },
  versions: {
    drafts: { schedulePublish: true },
  },
  hooks: {
    afterChange: [revalidarPaginas],
    afterDelete: [revalidarPaginasAlBorrar],
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    campoSlug('titulo'),
    {
      name: 'resumen',
      type: 'textarea',
      admin: { description: 'Se usa en resultados de búsqueda internos y como respaldo del SEO.' },
    },
    { name: 'portada', type: 'upload', relationTo: 'media' },
    {
      name: 'contenido',
      type: 'blocks',
      label: 'Contenido de la página',
      blocks: BLOQUES_PAGINA,
    },
    camposSEO(),
  ],
}
