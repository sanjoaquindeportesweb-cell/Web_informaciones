import type { CollectionConfig } from 'payload'

import { camposSEO, campoSlug } from '@/payload/campos'
import { esAdmin, estaAutenticado, publicoSiPublicado } from '@/payload/acceso'
import { revalidarGalerias, revalidarGaleriasAlBorrar } from '@/payload/revalidacion'

/**
 * Galerías de fotos.
 *
 * `imagenes` es un campo `upload` con `hasMany`, no un array de objetos: cada
 * imagen ya trae su propio `alt` obligatorio desde la colección `media`, así
 * que no hace falta duplicarlo por cada aparición en una galería.
 */
export const Galerias: CollectionConfig = {
  slug: 'galerias',
  labels: { singular: 'Galería', plural: 'Galerías' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', '_status'],
    description: 'Álbumes de fotos de actividades y campeonatos.',
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
    afterChange: [revalidarGalerias],
    afterDelete: [revalidarGaleriasAlBorrar],
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    campoSlug('titulo'),
    { name: 'descripcion', type: 'textarea' },
    { name: 'portada', type: 'upload', relationTo: 'media' },
    {
      name: 'imagenes',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      minRows: 1,
      required: true,
    },
    camposSEO(),
  ],
}
