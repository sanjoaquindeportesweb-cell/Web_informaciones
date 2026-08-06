import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { CATEGORIAS_NOTICIA } from '@/constantes/categorias'
import { camposSEO, campoSlug } from '@/payload/campos'
import { esAdmin, estaAutenticado, publicoSiPublicado } from '@/payload/acceso'
import { revalidarNoticias, revalidarNoticiasAlBorrar } from '@/payload/revalidacion'

/**
 * Noticias.
 *
 * La colección que más va a usar el equipo de comunicaciones. `categoria` es
 * un `select` cerrado a las seis claves de `constantes/categorias.ts` y no
 * una colección propia: cada una tiene una tinta auditada contra WCAG AA
 * cableada en `globals.css` (`--cat-*`). Dejar que alguien cree una categoría
 * nueva desde el panel la dejaría sin color y sin ícono — el sistema de
 * diseño no admite una séptima categoría sin que alguien la audite primero.
 */
export const Noticias: CollectionConfig = {
  slug: 'noticias',
  labels: { singular: 'Noticia', plural: 'Noticias' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'categoria', 'publicadaEn', '_status'],
    description: 'Noticias e informaciones para vecinas y vecinos de la comuna.',
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
    afterChange: [revalidarNoticias],
    afterDelete: [revalidarNoticiasAlBorrar],
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    campoSlug('titulo'),
    {
      name: 'bajada',
      type: 'textarea',
      label: 'Bajada',
      admin: { description: 'Uno o dos renglones. Aparece bajo el título en las tarjetas.' },
    },
    {
      name: 'categoria',
      type: 'select',
      required: true,
      options: CATEGORIAS_NOTICIA.map(({ clave, etiqueta }) => ({ label: etiqueta, value: clave })),
    },
    {
      name: 'publicadaEn',
      type: 'date',
      label: 'Fecha de publicación',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'portada', type: 'upload', relationTo: 'media' },
    {
      name: 'cuerpo',
      type: 'richText',
      required: true,
      label: 'Cuerpo de la noticia',
      /* Explícito aquí y no solo en buildConfig: el generador del importMap
         del panel (`payload generate:importmap`) lee la config sin sanear y
         no hereda el editor por defecto declarado a nivel raíz. Sin esto, el
         campo se rompe en el panel con «PayloadComponent not found». */
      editor: lexicalEditor(),
    },
    camposSEO(),
  ],
}
