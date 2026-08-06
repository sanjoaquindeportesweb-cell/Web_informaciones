import type { Field, GlobalConfig } from 'payload'

import { estaAutenticado } from '@/payload/acceso'
import { revalidarSitio } from '@/payload/revalidacion'

/**
 * Menú principal — la fuente única del navbar.
 *
 * Es lo que hace cierto que crear una página nueva y sumarla al menú no
 * exige tocar código: `href` es texto libre a propósito, no una relación a
 * `paginas`, porque el menú también necesita apuntar a rutas que no son
 * documentos de esa colección (`/noticias`, `/recintos`, `/contacto`) y a
 * enlaces externos hacia la plataforma de trámites.
 *
 * `hijos` llega hasta un nivel: la cabecera de hoy no pinta submenús
 * desplegables, así que un segundo nivel no se vería. Está declarado para
 * cuando se construya esa parte de la interfaz, no antes.
 */

const camposEnlace: Field[] = [
  { name: 'etiqueta', type: 'text', required: true },
  {
    name: 'href',
    type: 'text',
    required: true,
    admin: { description: 'Ruta interna que empieza con / (ej: /noticias) o URL externa completa.' },
  },
  { name: 'externo', type: 'checkbox', defaultValue: false, label: 'Sale del portal' },
]

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
          fields: camposEnlace,
        },
      ],
    },
  ],
}
