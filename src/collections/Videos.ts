import type { CollectionConfig, Validate } from 'payload'

import { esAdmin, estaAutenticado } from '@/payload/acceso'

const validarIdYoutube: Validate<string | null | undefined> = (valor) => {
  if (!valor) return 'El ID del video es obligatorio.'
  return /^[\w-]{11}$/.test(valor) || 'No parece un ID de YouTube (son 11 caracteres, ej: aqz-KE-bpKQ).'
}

/**
 * Catálogo de videos de YouTube.
 *
 * Es un catálogo reutilizable, no una página propia: no tiene ruta pública ni
 * necesita SEO ni borradores. El bloque «Video» del constructor de páginas
 * apunta aquí por relación en vez de pedir el ID cada vez, así el mismo video
 * se puede usar en dos páginas sin volver a escribirlo — y si se corrige el
 * título, se corrige en las dos a la vez.
 *
 * Se guarda el ID, no la URL completa: acepta pegar `https://youtu.be/xxxxx`
 * o `https://www.youtube.com/watch?v=xxxxx` igual de mal, así que se pide
 * el ID solo, con el ejemplo de dónde sacarlo en la ayuda del campo.
 */
export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: { singular: 'Video', plural: 'Videos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'idYoutube'],
    description: 'Videos de YouTube para incrustar en páginas y galerías.',
  },
  access: {
    read: () => true,
    create: estaAutenticado,
    update: estaAutenticado,
    delete: esAdmin,
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    {
      name: 'idYoutube',
      type: 'text',
      label: 'ID de YouTube',
      required: true,
      validate: validarIdYoutube,
      admin: {
        description:
          'La parte después de "v=" o "youtu.be/" en la URL del video. Ej: en youtu.be/aqz-KE-bpKQ, el ID es aqz-KE-bpKQ.',
      },
    },
    { name: 'descripcion', type: 'textarea' },
  ],
}
