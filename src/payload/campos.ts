import type { Field } from 'payload'

import { slug as generarSlug } from '@/lib/formato'

/**
 * Campo `slug`, autogenerado desde otro campo del mismo documento.
 *
 * Se completa solo si llega vacío — así un editor que quiere una URL propia
 * (`/noticias/no-al-cierre-de-la-piscina` en vez de la generada del título)
 * puede escribirla a mano y el gancho no se la pisa. Reutiliza `slug()` de
 * `lib/formato.ts`, el mismo que usa el frontend: es la fuente única para no
 * terminar con dos formas de «limpiar» un título.
 */
export const campoSlug = (origen: string): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Se genera solo desde el título. Editable si necesitas una URL distinta.',
  },
  hooks: {
    beforeValidate: [
      ({ value, siblingData }) => {
        if (value) return value
        const origenValor = (siblingData as Record<string, unknown>)[origen]
        return typeof origenValor === 'string' && origenValor.trim()
          ? generarSlug(origenValor)
          : value
      },
    ],
  },
})

/**
 * Grupo de SEO, igual en toda colección con página pública propia. Los tres
 * campos son opcionales porque cada uno tiene un respaldo razonable: el
 * título de la pieza, su resumen, y su portada — declarado en la descripción
 * de ayuda para que quien no sabe qué es una meta-descripción no tenga que
 * preguntarlo.
 */
export const camposSEO = (): Field => ({
  name: 'seo',
  type: 'group',
  label: 'Buscadores y redes sociales',
  admin: {
    description:
      'Lo que se ve en el resultado de Google y en la vista previa al compartir en redes. Si se deja vacío, se arma solo desde el título, el resumen y la portada.',
  },
  fields: [
    {
      name: 'metaTitulo',
      type: 'text',
      label: 'Título para buscadores',
      maxLength: 70,
    },
    {
      name: 'metaDescripcion',
      type: 'textarea',
      label: 'Descripción para buscadores',
      maxLength: 160,
      admin: { description: 'Hasta 160 caracteres. Es lo que Google muestra bajo el título.' },
    },
    {
      name: 'imagenCompartir',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen para compartir en redes',
      admin: { description: 'Si se deja vacía, se usa la portada de la pieza.' },
    },
  ],
})
