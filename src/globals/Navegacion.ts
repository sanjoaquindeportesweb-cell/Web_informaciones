import type { GlobalConfig } from 'payload'

import { camposEnlace } from '@/payload/campos'
import { estaAutenticado } from '@/payload/acceso'
import { revalidarSitio } from '@/payload/revalidacion'

/**
 * Menú principal — la fuente única del navbar.
 *
 * Es lo que hace cierto que crear una página nueva y sumarla al menú no
 * exige tocar código: los tres campos de cada ítem vienen de `camposEnlace`,
 * compartidos con los enlaces legales de la barra superior.
 *
 * `hijos` llega hasta un nivel y ese nivel sí se pinta: en escritorio como
 * panel desplegable y bajo 1024px como acordeón dentro del menú. Un tercer
 * nivel no existe a propósito — en una cabecera de portal municipal se vuelve
 * imposible de usar con el dedo, y esconde páginas en vez de mostrarlas.
 */
export const Navegacion: GlobalConfig = {
  slug: 'navegacion',
  label: 'Navegación principal',
  access: {
    read: () => true,
    update: estaAutenticado,
  },
  hooks: {
    afterChange: [revalidarSitio],
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Ítems del menú',
      minRows: 1,
      maxRows: 8,
      admin: { description: 'El orden aquí es el orden en la cabecera.' },
      fields: [
        ...camposEnlace,
        {
          name: 'hijos',
          type: 'array',
          label: 'Sub-ítems',
          admin: {
            description:
              'Si agregas sub-ítems, el ítem pasa a ser un desplegable y su propio enlace queda como primera opción dentro («Ver …»).',
          },
          fields: camposEnlace,
        },
      ],
    },
  ],
}
