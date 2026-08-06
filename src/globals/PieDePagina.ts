import type { GlobalConfig } from 'payload'

import { estaAutenticado } from '@/payload/acceso'
import { revalidarSitio } from '@/payload/revalidacion'

/**
 * Enlaces legales — Transparencia, Ley del Lobby, Privacidad.
 *
 * Hoy se pintan en la barra de utilidad, la franja violeta oscura sobre la
 * cabecera; el nombre del global es «pie de página» porque es ahí donde vive
 * este tipo de enlace en la mayoría de los sitios municipales, y es donde
 * probablemente termine también aquí cuando el pie crezca.
 */
export const PieDePagina: GlobalConfig = {
  slug: 'pie-de-pagina',
  label: 'Pie de página',
  access: {
    read: () => true,
    update: estaAutenticado,
  },
  hooks: {
    afterChange: [revalidarSitio],
  },
  fields: [
    {
      name: 'enlacesLegales',
      type: 'array',
      label: 'Enlaces legales',
      admin: { description: 'Transparencia, Ley del Lobby, Privacidad. Se muestran en la barra superior.' },
      fields: [
        { name: 'etiqueta', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
  ],
}
